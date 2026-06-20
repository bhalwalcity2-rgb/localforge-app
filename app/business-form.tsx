"use client";

import { Building2 } from "lucide-react";
import { useActionState } from "react";
import { addBusiness, type BusinessFormState } from "./actions";

type ClientOption = {
  id: string;
  name: string;
};

const initialState: BusinessFormState = {
  ok: false,
  message: null
};

export function BusinessForm({ clients }: { clients: ClientOption[] }) {
  const [state, formAction, pending] = useActionState(addBusiness, initialState);
  const hasClients = clients.length > 0;

  return (
    <>
      {state.message ? (
        <div className={`formNotice ${state.ok ? "success" : "error"}`}>{state.message}</div>
      ) : null}
      <form className="clientForm" action={formAction}>
        <label>
          Client
          <select name="client_id" required disabled={!hasClients}>
            <option value="">{hasClients ? "Select client" : "Add a client first"}</option>
            {clients.map((client) => (
              <option value={client.id} key={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Business name
          <input name="name" required placeholder="Summit Dental Studio" />
        </label>
        <label>
          Address
          <textarea name="address" required placeholder="418 Market Street, Suite 210, Austin, TX 78701" />
        </label>
        <label>
          Phone
          <input name="phone" placeholder="(512) 555-0198" />
        </label>
        <label>
          Website
          <input name="website" placeholder="https://example.com" />
        </label>
        <label>
          Email
          <input name="email" type="email" placeholder="hello@example.com" />
        </label>
        <label>
          Primary category
          <input name="primary_category" placeholder="Dental Clinic" />
        </label>
        <label>
          Short description
          <textarea name="short_description" placeholder="Modern local service business description." />
        </label>
        <label>
          Notes
          <textarea name="notes" placeholder="NAP notes, onboarding info, or verification reminders" />
        </label>
        <button className="primaryButton" type="submit" disabled={pending || !hasClients}>
          <Building2 size={17} />
          {pending ? "Saving..." : "Save Business"}
        </button>
      </form>
    </>
  );
}
