"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import {
  updateLocationCitationData,
  updateLocationHours,
  updateLocationImages,
  updateLocationSocialLinks,
  type LocationDetailsFormState
} from "./actions";

type Hours = Record<string, { status?: string; open?: string; close?: string }>;
type Images = Record<string, string>;
type CitationData = Record<string, string | string[]>;
type SocialLinks = Record<string, string>;

const initialState: LocationDetailsFormState = {
  ok: false,
  message: null
};

const dayLabels = [
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
  ["sunday", "Sunday"]
] as const;

function FormNotice({ state }: { state: LocationDetailsFormState }) {
  if (!state.message) {
    return null;
  }

  return <div className={`formNotice inlineNotice ${state.ok ? "success" : "error"}`}>{state.message}</div>;
}

export function OpeningHoursForm({ businessId, hours }: { businessId: string; hours: Hours }) {
  const [state, formAction, pending] = useActionState(updateLocationHours, initialState);

  return (
    <section className="managerSection">
      <div className="managerSectionHead">
        <div>
          <h3>Opening Hours</h3>
          <span>Regular hours</span>
        </div>
      </div>
      <FormNotice state={state} />
      <form className="hoursEditForm" action={formAction}>
        <input name="business_id" type="hidden" value={businessId} />
        {dayLabels.map(([key, label]) => {
          const day = hours[key] ?? {};
          const isClosed = day.status === "closed" || (!day.open && !day.close && (key === "saturday" || key === "sunday"));

          return (
            <div key={key} className="hoursRow">
              <strong>{label}</strong>
              <select name={`${key}_status`} defaultValue={isClosed ? "closed" : day.status || "open"}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
              <input name={`${key}_open`} defaultValue={day.open || (isClosed ? "" : "09:00")} placeholder="09:00" />
              <em>to</em>
              <input name={`${key}_close`} defaultValue={day.close || (isClosed ? "" : "17:00")} placeholder="17:00" />
            </div>
          );
        })}
        <button className="primaryButton" type="submit" disabled={pending}>
          <Check size={17} />
          {pending ? "Saving..." : "Save Hours"}
        </button>
      </form>
    </section>
  );
}

export function ImageManagementForm({ businessId, images }: { businessId: string; images: Images }) {
  const [state, formAction, pending] = useActionState(updateLocationImages, initialState);

  return (
    <section className="managerSection">
      <div className="managerSectionHead">
        <div>
          <h3>Image Management</h3>
          <span>Logo and primary photos</span>
        </div>
      </div>
      <FormNotice state={state} />
      <form className="imageManager" action={formAction}>
        <input name="business_id" type="hidden" value={businessId} />
        <div className="uploadDropzone">
          <strong>Image URLs</strong>
          <span>Paste logo and primary photo links for now. File uploads can plug in later.</span>
        </div>
        <div className="imageUrlGrid">
          <label>Logo URL<input name="logo" defaultValue={images.logo || ""} placeholder="https://..." /></label>
          <label>Primary 1 URL<input name="primary_1" defaultValue={images.primary_1 || ""} placeholder="https://..." /></label>
          <label>Primary 2 URL<input name="primary_2" defaultValue={images.primary_2 || ""} placeholder="https://..." /></label>
          <label>Primary 3 URL<input name="primary_3" defaultValue={images.primary_3 || ""} placeholder="https://..." /></label>
          <button className="primaryButton" type="submit" disabled={pending}>
            <Check size={17} />
            {pending ? "Saving..." : "Save Images"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function CitationBuilderDataForm({
  businessId,
  citationData,
  fallbackPhone,
  fallbackDescription
}: {
  businessId: string;
  citationData: CitationData;
  fallbackPhone: string | null;
  fallbackDescription: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateLocationCitationData, initialState);
  const payments = Array.isArray(citationData.payments) ? citationData.payments : [];

  return (
    <section className="managerSection">
      <div className="managerSectionHead">
        <div>
          <h3>Citation Builder Data</h3>
          <span>Extra directory listing data</span>
        </div>
      </div>
      <FormNotice state={state} />
      <form className="citationEditForm" action={formAction}>
        <input name="business_id" type="hidden" value={businessId} />
        <label className="wideField">
          Business description
          <textarea name="description" defaultValue={String(citationData.description || fallbackDescription || "")} maxLength={750} />
        </label>
        <label>Contact first name<input name="contact_first_name" defaultValue={String(citationData.contact_first_name || "")} /></label>
        <label>Contact last name<input name="contact_last_name" defaultValue={String(citationData.contact_last_name || "")} /></label>
        <label>Contact email<input name="contact_email" defaultValue={String(citationData.contact_email || "")} /></label>
        <label>Mobile phone<input name="mobile_phone" defaultValue={String(citationData.mobile_phone || fallbackPhone || "")} /></label>
        <label>Employees<input name="employees" defaultValue={String(citationData.employees || "")} /></label>
        <label>Services/products<input name="services" defaultValue={String(citationData.services || "")} /></label>
        <label className="wideField">Extra categories<input name="categories" defaultValue={String(citationData.categories || "")} /></label>
        <div className="checkboxRow wideField">
          {["Cash", "Visa", "Mastercard", "Invoice", "PayPal", "Insurance"].map((payment) => (
            <label key={payment}>
              <input name="payments" type="checkbox" value={payment} defaultChecked={payments.includes(payment)} />
              {payment}
            </label>
          ))}
        </div>
        <button className="primaryButton" type="submit" disabled={pending}>
          <Check size={17} />
          {pending ? "Saving..." : "Save Citation Data"}
        </button>
      </form>
    </section>
  );
}

export function SocialLinksForm({ businessId, socialLinks }: { businessId: string; socialLinks: SocialLinks }) {
  const [state, formAction, pending] = useActionState(updateLocationSocialLinks, initialState);

  return (
    <section className="managerSection">
      <div className="managerSectionHead">
        <div>
          <h3>Social Profile Links</h3>
          <span>Profiles for authority signals</span>
        </div>
      </div>
      <FormNotice state={state} />
      <form className="socialEditForm" action={formAction}>
        <input name="business_id" type="hidden" value={businessId} />
        {["facebook", "linkedin", "x", "instagram", "pinterest", "youtube", "tiktok"].map((network) => (
          <label key={network}>
            {network}
            <input name={network} defaultValue={socialLinks[network] || ""} placeholder={`https://${network}.com`} />
          </label>
        ))}
        <button className="primaryButton" type="submit" disabled={pending}>
          <Check size={17} />
          {pending ? "Saving..." : "Save Social Links"}
        </button>
      </form>
    </section>
  );
}
