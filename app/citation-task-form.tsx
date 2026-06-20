"use client";

import { CheckSquare } from "lucide-react";
import { useActionState } from "react";
import { addCitationTask, type CitationTaskFormState } from "./actions";

type Option = {
  id: string;
  name: string;
};

const initialState: CitationTaskFormState = {
  ok: false,
  message: null
};

export function CitationTaskForm({
  businesses,
  directories
}: {
  businesses: Option[];
  directories: Option[];
}) {
  const [state, formAction, pending] = useActionState(addCitationTask, initialState);
  const ready = businesses.length > 0 && directories.length > 0;

  return (
    <>
      {state.message ? (
        <div className={`formNotice ${state.ok ? "success" : "error"}`}>{state.message}</div>
      ) : null}
      <form className="clientForm" action={formAction}>
        <label>
          Business
          <select name="business_id" required disabled={!ready}>
            <option value="">{businesses.length ? "Select business" : "Add a business first"}</option>
            {businesses.map((business) => (
              <option value={business.id} key={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Directory
          <select name="directory_id" required disabled={!ready}>
            <option value="">{directories.length ? "Select directory" : "Add a directory first"}</option>
            {directories.map((directory) => (
              <option value={directory.id} key={directory.id}>
                {directory.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue="not_started">
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="live">Live</option>
            <option value="needs_fix">Needs Fix</option>
            <option value="duplicate_found">Duplicate Found</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <label>
          Listing URL
          <input name="listing_url" placeholder="https://directory.com/listing" />
        </label>
        <label>
          Verification notes
          <textarea name="verification_notes" placeholder="Email used, OTP needed, captcha/manual checkpoint, or follow-up note" />
        </label>
        <button className="primaryButton" type="submit" disabled={pending || !ready}>
          <CheckSquare size={17} />
          {pending ? "Creating..." : "Create Citation Task"}
        </button>
      </form>
    </>
  );
}
