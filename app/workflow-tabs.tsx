"use client";

import { useState, type ReactNode } from "react";

type WorkflowTab = {
  id: string;
  label: string;
  helper: string;
  content: ReactNode;
};

export function WorkflowTabs({ tabs }: { tabs: WorkflowTab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <section className="workflowShell">
      <div className="workflowTabs" role="tablist" aria-label="Citation workflow">
        {tabs.map((tab) => (
          <button
            className={tab.id === activeTab ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={tab.id === activeTab}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <strong>{tab.label}</strong>
            <span>{tab.helper}</span>
          </button>
        ))}
      </div>
      <div className="workflowContent">{activeContent}</div>
    </section>
  );
}
