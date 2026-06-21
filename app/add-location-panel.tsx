"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { BusinessForm } from "./business-form";

type AddLocationPanelProps = {
  clients: {
    id: string;
    name: string;
  }[];
};

export function AddLocationPanel({ clients }: AddLocationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <article className="panel addLocationPanel">
        <div className="addLocationClosed">
          <div>
            <p className="eyebrow">Location setup</p>
            <h2>Add Location</h2>
            <p>Create a business profile only when you need another NAP record.</p>
          </div>
          <button className="primaryButton" type="button" onClick={() => setIsOpen(true)}>
            <Plus size={17} />
            Add Location
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="panel addLocationPanel">
      <div className="panelHead">
        <div>
          <p className="eyebrow">Location setup</p>
          <h2>Add Location</h2>
          <p className="sectionHint">Save the master NAP profile used by citations and future modules.</p>
        </div>
        <button className="secondaryButton compactButton" type="button" onClick={() => setIsOpen(false)}>
          <X size={16} />
          Close
        </button>
      </div>
      <BusinessForm clients={clients} />
    </article>
  );
}
