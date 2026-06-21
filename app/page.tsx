import {
  Bell,
  Building2,
  ClipboardList,
  FileText,
  Globe2,
  Menu,
  Plus,
  RadioTower,
  Search,
  Settings,
  Share2,
  Star
} from "lucide-react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase-server";
import { ClientForm } from "./client-form";
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

type Business = {
  id: string;
  client_id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  primary_category: string | null;
  short_description: string | null;
  client_name: string | null;
};

type BusinessRow = Omit<Business, "client_name"> & {
  clients: { name: string } | { name: string }[] | null;
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
      .select("id,client_id,name,address,phone,website,primary_category,short_description,clients(name)")
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
      short_description: business.short_description,
      client_name: Array.isArray(business.clients) ? business.clients[0]?.name ?? null : business.clients?.name ?? null
    }));
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

const navGroups = [
  {
    label: "Workspace",
    items: [
      ["All Locations", Building2, "active"],
      ["Citation Builder", ClipboardList, ""],
      ["Reports", FileText, ""]
    ]
  },
  {
    label: "Local SEO Modules",
    items: [
      ["GBP Audit", Globe2, "planned"],
      ["Rank Tracking", RadioTower, "planned"],
      ["Reviews", Star, "planned"],
      ["Social & Backlinks", Share2, "planned"]
    ]
  },
  {
    label: "System",
    items: [["Settings", Settings, ""]]
  }
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
  const citationTasks = await getCitationTasks();
  const pendingTaskCount = citationTasks.filter((task) => task.status.includes("pending")).length;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">LF</div>
          <div>
            <strong>LocalForge</strong>
            <span>Local SEO OS</span>
          </div>
        </div>

        <nav className="nav">
          {navGroups.map((group) => (
            <div className="navGroup" key={group.label}>
              <span>{group.label}</span>
              {group.items.map(([label, Icon, state]) => (
                <a className={state === "active" ? "active" : ""} href={`#${label.toLowerCase().replaceAll(" ", "-")}`} key={label}>
                  <Icon size={18} />
                  {label}
                  {state === "planned" ? <small>Later</small> : null}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <div className="phaseCard">
          <strong>Workflow</strong>
          <p>Start from All Locations. Each location will connect citations, GBP, rankings, reviews, and reports.</p>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="iconButton mobileOnly" aria-label="Open menu">
            <Menu size={18} />
          </button>
          <label className="search">
            <Search size={18} />
            <input placeholder="Search clients, locations, modules..." />
          </label>
          <div className="topActions">
            <button className="iconButton" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <Link className="primaryButton" href="/locations/new">
              <Plus size={17} />
              Add Location
            </Link>
          </div>
        </header>

        <div className="content">
          <section className="pageHead" id="all-locations">
            <div>
              <h1>All Locations</h1>
              <p>Manage every business location from one place. Add manually now; GBP import will auto-fill location data after Google access is connected.</p>
            </div>
            <div className="pageActions">
              <button className="secondaryButton" type="button">Download Location Data</button>
              <Link className="primaryButton" href="/locations/new">
                <Plus size={17} />
                Add Location(s)
              </Link>
            </div>
          </section>

          <WorkflowTabs
            tabs={[
              {
                id: "locations",
                label: "Locations",
                helper: `${businesses.length} saved`,
                content: (
                  <div className="tabStack">
                    <article className="panel locationsTablePanel">
                      <div className="locationsToolbar">
                        <div className="locationsSearch">
                          <input placeholder="Name, City, Zip or Reference" />
                          <button className="iconButton" type="button" aria-label="Search locations">
                            <Search size={17} />
                          </button>
                        </div>
                        <button className="secondaryButton filterButton" type="button">Filter by Client</button>
                        <span className="resultCount">Showing {businesses.length ? `1-${businesses.length} of ${businesses.length}` : "0"} results</span>
                      </div>
                      <div className="tableScroll">
                        <table>
                          <thead>
                            <tr>
                              <th>Location</th>
                              <th>Ref. Number</th>
                              <th>City, Zipcode</th>
                              <th>Client Name</th>
                              <th>Active Sync Alerts</th>
                              <th>Connections</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {businesses.length ? (
                              businesses.map((business, index) => {
                                const locationTasks = citationTasks.filter((task) => task.business_name === business.name);
                                const pendingAlerts = locationTasks.filter((task) => task.status !== "live").length;
                                const cityZip = business.address?.split(",").slice(-2).join(",").trim() || "-";
                                const refNumber = business.name.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 12) || `LOC${index + 1}`;

                                return (
                                  <tr key={business.id}>
                                    <td>
                                      <div className="locationNameCell">
                                        <span className="favoriteStar">*</span>
                                        <div>
                                          <strong>{business.name}</strong>
                                          <span>{business.address || "Address missing"}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td>{refNumber}</td>
                                    <td>{cityZip}</td>
                                    <td>{business.client_name || "-"}</td>
                                    <td>
                                      {pendingAlerts ? (
                                        <span className="alertNumber">{pendingAlerts}</span>
                                      ) : (
                                        <button className="syncButton" type="button">Get Active Sync</button>
                                      )}
                                    </td>
                                    <td><span className="gbpIcon" title="Google Business Profile">G</span></td>
                                    <td>
                                      <div className="rowActions">
                                        <Link className="managerButton" href={`/locations/${business.id}`}>Location Manager</Link>
                                        <button className="roundMenu" type="button" aria-label="More location actions">v</button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={7}>
                                  <div className="emptyState">
                                    <strong>No locations yet</strong>
                                    <span>Add a business location manually now. GBP import will come after Google access is connected.</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  </div>
                )
              },
              {
                id: "clients",
                label: "Clients",
                helper: `${clients.length} accounts`,
                content: (
                  <section className="clientGrid">
                    <article className="panel">
                      <div className="panelHead">
                        <div>
                          <h2>Clients</h2>
                          <p className="sectionHint">Client records used for filtering and ownership.</p>
                        </div>
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
                                  <span>Add a client when you need to group multiple locations.</span>
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
                )
              },
              {
                id: "alerts",
                label: "Alert Inbox",
                helper: String(pendingTaskCount),
                content: (
                  <article className="panel">
                    <div className="panelHead">
                      <div>
                        <h2>Alert Inbox</h2>
                        <p className="sectionHint">Active sync and citation alerts will collect here.</p>
                      </div>
                      <span className="badge pending">{pendingTaskCount}</span>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Location</th>
                          <th>Directory</th>
                          <th>Status</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citationTasks.filter((task) => task.status !== "live").length ? (
                          citationTasks.filter((task) => task.status !== "live").map((task) => (
                            <tr key={task.id}>
                              <td>{task.business_name || "-"}</td>
                              <td>{task.directory_name || "-"}</td>
                              <td><StatusBadge>{task.status}</StatusBadge></td>
                              <td>{task.verification_notes || "-"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4}>
                              <div className="emptyState">
                                <strong>No alerts yet</strong>
                                <span>Pending sync, NAP, duplicate, and citation issues will appear here.</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </article>
                )
              }
            ]}
          />
        </div>
      </main>
    </div>
  );
}
