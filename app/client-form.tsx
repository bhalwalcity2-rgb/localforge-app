"use client";

import { KeyRound, Plus } from "lucide-react";
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
        <div className="integrationHint">
          <KeyRound size={17} />
          <div>
            <strong>Global account</strong>
            <span>GBP access will connect here, then locations can be imported automatically.</span>
          </div>
        </div>
        <label>
          Client account name
          <input name="name" required placeholder="ATLA1 or BrightPath Agency" />
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
          {pending ? "Saving..." : "Save Client Account"}
        </button>
      </form>
    </>
  );
}
