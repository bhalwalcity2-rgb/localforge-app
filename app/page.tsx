import {
  Bell,
  Building2,
  CheckSquare,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  Users
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase-server";
import { BusinessForm } from "./business-form";
import { CitationTaskForm } from "./citation-task-form";
import { ClientForm } from "./client-form";
import { DirectoryForm } from "./directory-form";
import { WorkflowTabs } from "./workflow-tabs";

export const dynamic = "force-dynamic";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

type Metric = {
  label: string;
  value: string;
  note: string;
  tone?: "warning";
};

type Business = {
  id: string;
  client_id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  primary_category: string | null;
  client_name: string | null;
};

type BusinessRow = Omit<Business, "client_name"> & {
  clients: { name: string } | { name: string }[] | null;
};

type Directory = {
  id: string;
  name: string;
  type: string | null;
  country: string | null;
  is_paid: boolean;
  login_required: boolean;
  verification_type: string | null;
  priority_score: number;
  submission_url: string | null;
};

type CitationTask = {
  id: string;
  status: string;
  listing_url: string | null;
  verification_notes: string | null;
  business_name: string | null;
  directory_name: string | null;
  verification_type: string | null;
};

type CitationTaskRow = Omit<CitationTask, "business_name" | "directory_name" | "verification_type"> & {
  businesses: { name: string } | { name: string }[] | null;
  directories: { name: string; verification_type: string | null } | { name: string; verification_type: string | null }[] | null;
};

async function getClients(): Promise<Client[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("clients")
      .select("id,name,email,phone,notes,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getBusinesses(): Promise<Business[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,client_id,name,address,phone,website,primary_category,clients(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      return [];
    }

    return ((data ?? []) as BusinessRow[]).map((business) => ({
      id: business.id,
      client_id: business.client_id,
      name: business.name,
      address: business.address,
      phone: business.phone,
      website: business.website,
      primary_category: business.primary_category,
      client_name: Array.isArray(business.clients) ? business.clients[0]?.name ?? null : business.clients?.name ?? null
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getDirectories(): Promise<Directory[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("directories")
      .select("id,name,type,country,is_paid,login_required,verification_type,priority_score,submission_url")
      .order("priority_score", { ascending: false });

    if (error) {
      console.error(error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getCitationTasks(): Promise<CitationTask[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("citation_tasks")
      .select("id,status,listing_url,verification_notes,businesses(name),directories(name,verification_type)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      return [];
    }

    return ((data ?? []) as CitationTaskRow[]).map((task) => {
      const business = Array.isArray(task.businesses) ? task.businesses[0] : task.businesses;
      const directory = Array.isArray(task.directories) ? task.directories[0] : task.directories;

      return {
        id: task.id,
        status: task.status,
        listing_url: task.listing_url,
        verification_notes: task.verification_notes,
        business_name: business?.name ?? null,
        directory_name: directory?.name ?? null,
        verification_type: directory?.verification_type ?? null
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

const navItems = [
  ["Dashboard", LayoutDashboard],
  ["Clients", Users],
  ["Business Info", Building2],
  ["Citation Sources", ClipboardList],
  ["Citation Work", CheckSquare],
  ["Reports", FileText],
  ["Settings", Settings]
] as const;

function StatusBadge({ children }: { children: string }) {
  const label = children.toLowerCase().replaceAll("_", " ");
  const tone = label.includes("live")
    ? "live"
    : label.includes("pending")
      ? "pending"
      : label.includes("fix")
        ? "fix"
        : "draft";

  return <span className={`badge ${tone}`}>{label.replace(/\b\w/g, (letter) => letter.toUpperCase())}</span>;
}

export default async function Home({
  searchParams
}: {
  searchParams?: Promise<{ client_saved?: string; client_error?: string }>;
}) {
  await searchParams;
  const clients = await getClients();
  const businesses = await getBusinesses();
  const directories = await getDirectories();
  const citationTasks = await getCitationTasks();
  const liveCitationCount = citationTasks.filter((task) => task.status === "live").length;
  const pendingTaskCount = citationTasks.filter((task) => task.status.includes("pending")).length;
  const liveMetrics: Metric[] = [
    { label: "Clients", value: String(clients.length), note: clients.length ? "Loaded from Supabase" : "Add first client" },
    { label: "Businesses", value: String(businesses.length), note: businesses.length ? "Master NAP profiles" : "Add business NAP" },
    { label: "Citation tasks", value: String(citationTasks.length), note: liveCitationCount ? `${liveCitationCount} live citations` : "Create first task" },
    { label: "Pending review", value: String(pendingTaskCount), note: pendingTaskCount ? "Needs verification" : "No pending tasks", tone: pendingTaskCount ? "warning" : undefined }
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">LF</div>
          <div>
            <strong>LocalForge</strong>
            <span>Citation workspace</span>
          </div>
        </div>

        <nav className="nav">
          {navItems.map(([label, Icon], index) => (
            <a className={index === 0 ? "active" : ""} href={`#${label.toLowerCase().replaceAll(" ", "-")}`} key={label}>
              <Icon size={18} />
              {label}
            </a>
          ))}
        </nav>

        <div className="phaseCard">
          <strong>Phase 1</strong>
          <p>Add a client, save business info, choose sources, then track citation work.</p>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="iconButton mobileOnly" aria-label="Open menu">
            <Menu size={18} />
          </button>
          <label className="search">
            <Search size={18} />
            <input placeholder="Search clients, businesses, citations..." />
          </label>
          <div className="topActions">
            <button className="iconButton" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button className="primaryButton">
              <Plus size={17} />
              New Item
            </button>
          </div>
        </header>

        <div className="content">
          <section className="pageHead">
            <div>
              <h1>Citation Workspace</h1>
              <p>A simple workflow for client setup, business info, citation sources, and citation tracking.</p>
            </div>
            <button className="primaryButton">Generate Report</button>
          </section>

          <section className="guidePanel">
            <div>
              <span className="stepNumber">1</span>
              <strong>Add Client</strong>
              <p>Start with the account or business owner.</p>
            </div>
            <div>
              <span className="stepNumber">2</span>
              <strong>Business Info</strong>
              <p>Save the main NAP profile.</p>
            </div>
            <div>
              <span className="stepNumber">3</span>
              <strong>Citation Sources</strong>
              <p>Add directories like Yelp or Bing.</p>
            </div>
            <div>
              <span className="stepNumber">4</span>
              <strong>Track Work</strong>
              <p>Create tasks and update status.</p>
            </div>
          </section>

          <section className="metricGrid">
            {liveMetrics.map((metric) => (
              <article className="panel metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small className={metric.tone === "warning" ? "warningText" : ""}>{metric.note}</small>
              </article>
            ))}
          </section>

          <WorkflowTabs
            tabs={[
              {
                id: "setup",
                label: "Setup",
                helper: "Client + business info",
                content: (
                  <div className="tabStack">
                    <section className="clientGrid">
                      <article className="panel">
                        <div className="panelHead">
                          <h2>Clients</h2>
                          <span className="badge live">Step 1</span>
                        </div>
                        <table>
                          <thead>
                            <tr>
                              <th>Client</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clients.length ? (
                              clients.map((client) => (
                                <tr key={client.id}>
                                  <td>{client.name}</td>
                                  <td>{client.email || "-"}</td>
                                  <td>{client.phone || "-"}</td>
                                  <td>{client.notes || "-"}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4}>
                                  <div className="emptyState">
                                    <strong>No clients yet</strong>
                                    <span>Add your first client to confirm Supabase is saving real data.</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </article>

                      <article className="panel">
                        <div className="panelHead">
                          <h2>Add Client</h2>
                        </div>
                        <ClientForm />
                      </article>
                    </section>

                    <section className="businessGrid" id="businesses">
                      <article className="panel">
                        <div className="panelHead">
                          <h2>Business Info</h2>
                          <span className="badge live">Step 2</span>
                        </div>
                        <table>
                          <thead>
                            <tr>
                              <th>Business</th>
                              <th>Client</th>
                              <th>Category</th>
                              <th>Phone</th>
                              <th>Website</th>
                            </tr>
                          </thead>
                          <tbody>
                            {businesses.length ? (
                              businesses.map((business) => (
                                <tr key={business.id}>
                                  <td>
                                    <strong>{business.name}</strong>
                                    <span className="tableSubtext">{business.address}</span>
                                  </td>
                                  <td>{business.client_name || "-"}</td>
                                  <td>{business.primary_category || "-"}</td>
                                  <td>{business.phone || "-"}</td>
                                  <td>{business.website || "-"}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5}>
                                  <div className="emptyState">
                                    <strong>No business profiles yet</strong>
                                    <span>Add the main NAP profile that citations will use.</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </article>

                      <article className="panel">
                        <div className="panelHead">
                          <h2>Add Business Info</h2>
                        </div>
                        <BusinessForm clients={clients.map((client) => ({ id: client.id, name: client.name }))} />
                      </article>
                    </section>
                  </div>
                )
              },
              {
                id: "sources",
                label: "Sources",
                helper: "Citation directories",
                content: (
                  <section className="directoryGrid" id="directories">
                    <article className="panel">
                      <div className="panelHead">
                        <h2>Citation Sources</h2>
                        <span className="badge pending">Step 3</span>
                      </div>
                      <table>
                        <thead>
                          <tr>
                            <th>Directory</th>
                            <th>Type</th>
                            <th>Country</th>
                            <th>Cost</th>
                            <th>Verification</th>
                            <th>Priority</th>
                          </tr>
                        </thead>
                        <tbody>
                          {directories.length ? (
                            directories.map((directory) => (
                              <tr key={directory.id}>
                                <td>
                                  <strong>{directory.name}</strong>
                                  <span className="tableSubtext">{directory.submission_url || "No submission URL yet"}</span>
                                </td>
                                <td>{directory.type || "-"}</td>
                                <td>{directory.country || "-"}</td>
                                <td>{directory.is_paid ? "Paid" : "Free"}</td>
                                <td>{directory.verification_type || "-"}</td>
                                <td><span className="badge pending">{String(directory.priority_score)}</span></td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6}>
                                <div className="emptyState">
                                  <strong>No directories yet</strong>
                                  <span>Add citation sources manually. Later we will add suggested lists.</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </article>

                    <article className="panel">
                      <div className="panelHead">
                        <h2>Add Source</h2>
                      </div>
                      <DirectoryForm />
                    </article>
                  </section>
                )
              },
              {
                id: "work",
                label: "Citation Work",
                helper: "Create + track status",
                content: (
                  <section className="taskGrid" id="citation-tasks">
                    <article className="panel">
                      <div className="panelHead">
                        <h2>Citation Work</h2>
                        <span className="badge live">Step 4</span>
                      </div>
                      <table>
                        <thead>
                          <tr>
                            <th>Business</th>
                            <th>Directory</th>
                            <th>Status</th>
                            <th>Verification</th>
                            <th>Listing URL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {citationTasks.length ? (
                            citationTasks.map((task) => (
                              <tr key={task.id}>
                                <td>{task.business_name || "-"}</td>
                                <td>{task.directory_name || "-"}</td>
                                <td><StatusBadge>{task.status}</StatusBadge></td>
                                <td>{task.verification_type || "-"}</td>
                                <td>{task.listing_url || "-"}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5}>
                                <div className="emptyState">
                                  <strong>No citation tasks yet</strong>
                                  <span>Create work items to track submitted, pending, live, duplicate, rejected, and needs-fix citations.</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </article>

                    <article className="panel">
                      <div className="panelHead">
                        <h2>Create Work Item</h2>
                      </div>
                      <CitationTaskForm
                        businesses={businesses.map((business) => ({ id: business.id, name: business.name }))}
                        directories={directories.map((directory) => ({ id: directory.id, name: directory.name }))}
                      />
                    </article>
                  </section>
                )
              },
              {
                id: "report",
                label: "Report",
                helper: "Simple client summary",
                content: (
                  <section className="reportGrid">
                    <article className="panel">
                      <div className="panelHead">
                        <h2>Report Summary</h2>
                        <span className="badge live">Draft</span>
                      </div>
                      <div className="reportBody">
                        <div>
                          <span>Clients</span>
                          <strong>{clients.length}</strong>
                        </div>
                        <div>
                          <span>Businesses</span>
                          <strong>{businesses.length}</strong>
                        </div>
                        <div>
                          <span>Citation Sources</span>
                          <strong>{directories.length}</strong>
                        </div>
                        <div>
                          <span>Citation Work</span>
                          <strong>{citationTasks.length}</strong>
                        </div>
                      </div>
                    </article>
                    <article className="panel">
                      <div className="panelHead">
                        <h2>Next Report Features</h2>
                      </div>
                      <div className="panelBody stack">
                        <div className="copyRow">
                          <div>
                            <strong>Client-ready PDF</strong>
                            <span>Export progress, live citations, pending items, and NAP issues.</span>
                          </div>
                        </div>
                        <div className="copyRow">
                          <div>
                            <strong>CSV Export</strong>
                            <span>Download citation tasks and source lists for operations.</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </section>
                )
              }
            ]}
          />
        </div>
      </main>
    </div>
  );
}
