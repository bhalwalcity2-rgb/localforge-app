"use client";

import { Plus } from "lucide-react";
import { useActionState } from "react";
import { addClient, type ClientFormState } from "./actions";

const initialState: ClientFormState = {
  ok: false,
  message: null
};

export function ClientForm() {
  const [state, formAction, pending] = useActionState(addClient, initialState);

  return (
    <>
      {state.message ? (
        <div className={`formNotice ${state.ok ? "success" : "error"}`}>{state.message}</div>
      ) : null}
      <form className="clientForm" action={formAction}>
        <label>
          Client name
          <input name="name" required placeholder="BrightPath Agency" />
        </label>
        <label>
          Email
          <input name="email" type="email" placeholder="ops@example.com" />
        </label>
        <label>
          Phone
          <input name="phone" placeholder="(555) 012-3456" />
        </label>
        <label>
          Notes
          <textarea name="notes" placeholder="Primary contact, package, or onboarding note" />
        </label>
        <button className="primaryButton" type="submit" disabled={pending}>
          <Plus size={17} />
          {pending ? "Saving..." : "Save Client"}
        </button>
      </form>
    </>
  );
}
