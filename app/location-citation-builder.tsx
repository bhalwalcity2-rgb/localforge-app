"use client";

import { useActionState } from "react";
import { Check, ClipboardList } from "lucide-react";
import {
  createCitationCampaign,
  updateCitationTaskStatus,
  type CitationCampaignFormState,
  type CitationStatusFormState
} from "./actions";

type DirectoryOption = {
  id: string;
  name: string;
  type: string | null;
  country: string | null;
  verification_type: string | null;
  priority_score: number;
};

type CitationTask = {
  id: string;
  status: string;
  listing_url: string | null;
  verification_notes: string | null;
  directory_id: string | null;
  directory_name: string | null;
  verification_type: string | null;
};

const campaignInitialState: CitationCampaignFormState = {
  ok: false,
  message: null
};

const statusInitialState: CitationStatusFormState = {
  ok: false,
  message: null
};

const statusOptions = [
  ["not_started", "Not Started"],
  ["in_progress", "In Progress"],
  ["submitted", "Submitted"],
  ["pending_verification", "Pending Verification"],
  ["live", "Live"],
  ["needs_fix", "Needs Fix"],
  ["duplicate_found", "Duplicate Found"],
  ["rejected", "Rejected"]
] as const;

function FormNotice({ state }: { state: CitationCampaignFormState | CitationStatusFormState }) {
  if (!state.message) {
    return null;
  }

  return <div className={`formNotice inlineNotice ${state.ok ? "success" : "error"}`}>{state.message}</div>;
}

function statusLabel(status: string) {
  return statusOptions.find(([value]) => value === status)?.[1] ?? status.replaceAll("_", " ");
}

export function LocationCitationBuilder({
  businessId,
  directories,
  tasks
}: {
  businessId: string;
  directories: DirectoryOption[];
  tasks: CitationTask[];
}) {
  const [campaignState, campaignAction, campaignPending] = useActionState(createCitationCampaign, campaignInitialState);
  const existingDirectoryIds = new Set(tasks.map((task) => task.directory_id).filter(Boolean));
  const liveCount = tasks.filter((task) => task.status === "live").length;
  const pendingCount = tasks.filter((task) => task.status.includes("pending") || task.status === "submitted").length;

  return (
    <section className="managerSection">
      <div className="managerSectionHead">
        <div>
          <h3>Citation Builder</h3>
          <span>Create citation work and track listing progress for this location</span>
        </div>
        <div className="citationStats">
          <span>{tasks.length} total</span>
          <span>{liveCount} live</span>
          <span>{pendingCount} pending</span>
        </div>
      </div>

      <FormNotice state={campaignState} />

      <form className="citationCampaignForm" action={campaignAction}>
        <input name="business_id" type="hidden" value={businessId} />
        <div className="directoryPicker">
          {directories.length ? (
            directories.map((directory) => {
              const exists = existingDirectoryIds.has(directory.id);

              return (
                <label key={directory.id} className={exists ? "directoryOption exists" : "directoryOption"}>
                  <input name="directory_ids" type="checkbox" value={directory.id} disabled={exists} />
                  <span>
                    <strong>{directory.name}</strong>
                    <small>{directory.type || "General"} | {directory.country || "Any"} | {directory.verification_type || "Manual"} | Priority {directory.priority_score}</small>
                  </span>
                  {exists ? <em>Added</em> : null}
                </label>
              );
            })
          ) : (
            <div className="emptyState">
              <strong>No directories yet</strong>
              <span>Add directory sources before starting citation campaigns.</span>
            </div>
          )}
        </div>
        <button className="primaryButton" type="submit" disabled={campaignPending || !directories.length}>
          <ClipboardList size={17} />
          {campaignPending ? "Creating..." : "Create Citation Tasks"}
        </button>
      </form>

      <div className="citationTaskList">
        <div className="managerSectionHead">
          <h3>Campaign Tasks</h3>
          <span>Status tracking</span>
        </div>
        {tasks.length ? (
          tasks.map((task) => (
            <CitationTaskRow key={task.id} businessId={businessId} task={task} />
          ))
        ) : (
          <div className="emptyState">
            <strong>No citation tasks yet</strong>
            <span>Select directories above to create campaign tasks.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function CitationTaskRow({ businessId, task }: { businessId: string; task: CitationTask }) {
  const [state, formAction, pending] = useActionState(updateCitationTaskStatus, statusInitialState);

  return (
    <form className="citationTaskRow" action={formAction}>
      <input name="task_id" type="hidden" value={task.id} />
      <input name="business_id" type="hidden" value={businessId} />
      <div>
        <strong>{task.directory_name || "Directory"}</strong>
        <span>{task.verification_type || "Manual verification"}</span>
      </div>
      <label>
        Status
        <select name="status" defaultValue={task.status}>
          {statusOptions.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label>
        Listing URL
        <input name="listing_url" defaultValue={task.listing_url || ""} placeholder="https://..." />
      </label>
      <label>
        Notes
        <input name="verification_notes" defaultValue={task.verification_notes || ""} placeholder="Verification, login, or issue notes" />
      </label>
      <button className="secondaryButton compactButton" type="submit" disabled={pending}>
        <Check size={16} />
        {pending ? "Saving..." : "Save"}
      </button>
      <span className="badge pending">{statusLabel(task.status)}</span>
      <FormNotice state={state} />
    </form>
  );
}
