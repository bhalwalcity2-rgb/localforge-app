"use client";

import { ClipboardList } from "lucide-react";
import { useActionState } from "react";
import { addDirectory, type DirectoryFormState } from "./actions";

const initialState: DirectoryFormState = {
  ok: false,
  message: null
};

export function DirectoryForm() {
  const [state, formAction, pending] = useActionState(addDirectory, initialState);

  return (
    <>
      {state.message ? (
        <div className={`formNotice ${state.ok ? "success" : "error"}`}>{state.message}</div>
      ) : null}
      <form className="clientForm" action={formAction}>
        <label>
          Directory name
          <input name="name" required placeholder="Yelp" />
        </label>
        <label>
          Website URL
          <input name="website_url" placeholder="https://www.yelp.com" />
        </label>
        <label>
          Submission URL
          <input name="submission_url" placeholder="https://biz.yelp.com" />
        </label>
        <label>
          Type
          <select name="type" defaultValue="general">
            <option value="core">Core</option>
            <option value="general">General</option>
            <option value="local">Local</option>
            <option value="niche">Niche</option>
            <option value="industry">Industry</option>
          </select>
        </label>
        <label>
          Country
          <input name="country" placeholder="US" />
        </label>
        <label>
          Verification type
          <select name="verification_type" defaultValue="manual">
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="manual">Manual review</option>
            <option value="captcha">Captcha/manual</option>
            <option value="none">None</option>
          </select>
        </label>
        <label>
          Priority score
          <input name="priority_score" type="number" min="1" max="100" defaultValue="70" />
        </label>
        <div className="checkboxRow">
          <label>
            <input name="is_paid" type="checkbox" />
            Paid
          </label>
          <label>
            <input name="login_required" type="checkbox" />
            Login required
          </label>
        </div>
        <label>
          Notes
          <textarea name="notes" placeholder="Niche, rules, verification notes, or quality details" />
        </label>
        <button className="primaryButton" type="submit" disabled={pending}>
          <ClipboardList size={17} />
          {pending ? "Saving..." : "Save Directory"}
        </button>
      </form>
    </>
  );
}
