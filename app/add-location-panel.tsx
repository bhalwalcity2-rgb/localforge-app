"use client";

import { useState } from "react";
import { Building2, CloudDownload, Plus, X } from "lucide-react";
import { BusinessForm } from "./business-form";

type AddLocationPanelProps = {
  clients: {
    id: string;
    name: string;
  }[];
  defaultOpen?: boolean;
};

export function AddLocationPanel({ clients, defaultOpen = false }: AddLocationPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!isOpen) {
    return (
      <article className="panel addLocationPanel">
        <div className="addLocationClosed">
          <div>
            <p className="eyebrow">Location setup</p>
            <h2>Add Business Location</h2>
            <p>Import from GBP when connected, or add the NAP profile manually.</p>
          </div>
          <div className="locationCreateOptions">
            <button className="secondaryButton optionButton" type="button" disabled title="Google Business Profile import will be added after OAuth setup.">
              <CloudDownload size={17} />
              Import from GBP
              <span>Planned</span>
            </button>
            <button className="primaryButton optionButton" type="button" onClick={() => setIsOpen(true)}>
              <Building2 size={17} />
              Add Manually
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="panel addLocationPanel">
      <div className="panelHead">
        <div>
          <p className="eyebrow">Location setup</p>
          <h2>Add Business Location</h2>
          <p className="sectionHint">Manual fallback for the NAP profile. Later this same record can be populated from GBP.</p>
        </div>
        <button className="secondaryButton compactButton" type="button" onClick={() => setIsOpen(false)}>
          <X size={16} />
          Close
        </button>
      </div>
      <div className="importNotice">
        <Plus size={16} />
        <span>GBP import will auto-fill name, address, phone, website, category, hours, photos, and profile details after Google access is connected.</span>
      </div>
      <BusinessForm clients={clients} />
    </article>
  );
}
