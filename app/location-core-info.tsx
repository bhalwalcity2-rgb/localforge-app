"use client";

import { useState, useActionState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { updateBusinessCoreInfo, type CoreInfoFormState } from "./actions";

type LocationCoreInfoProps = {
  business: {
    id: string;
    name: string;
    address: string;
    phone: string | null;
    website: string | null;
    primary_category: string | null;
    client_name: string | null;
  };
};

const initialState: CoreInfoFormState = {
  ok: false,
  message: null
};

export function LocationCoreInfo({ business }: LocationCoreInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateBusinessCoreInfo, initialState);
  const reference = business.name.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 14) || business.id.slice(0, 8);

  return (
    <section className="managerSection">
      <div className="managerSectionHead">
        <div>
          <h3>Core Information</h3>
          <span>General settings and business details</span>
        </div>
        <div className="sectionActions">
          {isEditing ? (
            <button className="secondaryButton compactButton" type="button" onClick={() => setIsEditing(false)}>
              <X size={16} />
              Cancel
            </button>
          ) : (
            <button className="secondaryButton compactButton" type="button" onClick={() => setIsEditing(true)}>
              <Pencil size={16} />
              Edit
            </button>
          )}
        </div>
      </div>

      {state.message ? (
        <div className={`formNotice inlineNotice ${state.ok ? "success" : "error"}`}>{state.message}</div>
      ) : null}

      {isEditing ? (
        <form className="coreEditForm" action={formAction}>
          <input name="id" type="hidden" value={business.id} />
          <label>
            Location name
            <input name="name" required defaultValue={business.name} />
          </label>
          <label>
            Address
            <textarea name="address" required defaultValue={business.address} />
          </label>
          <label>
            Primary category
            <input name="primary_category" defaultValue={business.primary_category || ""} />
          </label>
          <label>
            Phone
            <input name="phone" defaultValue={business.phone || ""} />
          </label>
          <label>
            Website
            <input name="website" defaultValue={business.website || ""} />
          </label>
          <button className="primaryButton" type="submit" disabled={pending}>
            <Check size={17} />
            {pending ? "Saving..." : "Save Core Info"}
          </button>
        </form>
      ) : (
        <div className="infoGrid">
          <div><span>Client</span><strong>{business.client_name || "-"}</strong></div>
          <div><span>Unique Location Reference</span><strong>{reference}</strong></div>
          <div><span>Location Name</span><strong>{business.name}</strong></div>
          <div><span>Address</span><strong>{business.address || "-"}</strong></div>
          <div><span>Category</span><strong>{business.primary_category || "-"}</strong></div>
          <div><span>Phone</span><strong>{business.phone || "-"}</strong></div>
          <div><span>Website</span><strong>{business.website || "-"}</strong></div>
          <div><span>Service Area Business</span><strong>No</strong></div>
        </div>
      )}
    </section>
  );
}
