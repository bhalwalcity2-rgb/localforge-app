import {
  Bell,
  Building2,
  CheckSquare,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MapPin,
  Menu,
  Plus,
  Search,
  Settings,
  Users,
  Wand2
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { addClient } from "./actions";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

async function getClients(): Promise<Client[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("clients")
    .select("id,name,email,phone,notes,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return data ?? [];
}

const metrics = [
  { label: "Clients", value: "12", note: "+2 this month" },
  { label: "Live citations", value: "418", note: "86% completion" },
  { label: "Pending verification", value: "37", note: "Needs review", tone: "warning" },
  { label: "Average NAP score", value: "82%", note: "+9 improvement" }
];

const tasks = [
  ["Summit Dental Studio", "Yelp", "Pending Verification", "Amina"],
  ["Oakline Plumbing", "Apple Maps", "Needs Fix", "Hamza"],
  ["Riverview Legal", "BBB", "Not Started", "Unassigned"],
  ["Northside Fitness", "Bing Places", "Live", "Amina"]
];

const directories = [
  ["Google Business Profile", "Core", "Free", "Phone/Video", "98"],
  ["Bing Places", "Core", "Free", "Email", "91"],
  ["Yelp", "General", "Free", "Manual", "84"],
  ["Healthgrades", "Niche", "Free", "Manual", "79"]
];

const navItems = [
  ["Dashboard", LayoutDashboard],
  ["Clients", Users],
  ["Businesses", Building2],
  ["Directories", ClipboardList],
  ["Citation Tasks", CheckSquare],
  ["Assistant", Wand2],
  ["NAP Checker", MapPin],
  ["Reports", FileText],
  ["Settings", Settings]
] as const;

function StatusBadge({ children }: { children: string }) {
  const label = children.toLowerCase();
  const tone = label.includes("live")
    ? "live"
    : label.includes("pending")
      ? "pending"
      : label.includes("fix")
        ? "fix"
        : "draft";

  return <span className={`badge ${tone}`}>{children}</span>;
}

export default async function Home() {
  const clients = await getClients();
  const liveMetrics = [
    { label: "Clients", value: String(clients.length), note: clients.length ? "Loaded from Supabase" : "Add first client" },
    ...metrics.slice(1)
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">LF</div>
          <div>
            <strong>LocalForge</strong>
            <span>Local SEO operations</span>
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
          <p>Citation workflow, NAP checking, and client-ready reporting.</p>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button className="iconButton mobileOnly" aria-label="Open menu">
            <Menu size={18} />
          </button>
          <label className="search">
            <Search size={18} />
            <input placeholder="Search clients, directories, listings..." />
          </label>
          <div className="topActions">
            <button className="iconButton" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button className="primaryButton">
              <Plus size={17} />
              Quick Add
            </button>
          </div>
        </header>

        <div className="content">
          <section className="pageHead">
            <div>
              <h1>Operations Dashboard</h1>
              <p>Track citation progress, NAP issues, and client work from one workspace.</p>
            </div>
            <button className="primaryButton">Generate Report</button>
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

          <section className="clientGrid">
            <article className="panel">
              <div className="panelHead">
                <h2>Clients</h2>
                <span className="badge live">Database connected</span>
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
              <form className="clientForm" action={addClient}>
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
                <button className="primaryButton" type="submit">
                  <Plus size={17} />
                  Save Client
                </button>
              </form>
            </article>
          </section>

          <section className="splitGrid">
            <article className="panel">
              <div className="panelHead">
                <h2>Work Queue</h2>
                <button className="secondaryButton">View All</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Directory</th>
                    <th>Status</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(([business, directory, status, owner]) => (
                    <tr key={`${business}-${directory}`}>
                      <td>{business}</td>
                      <td>{directory}</td>
                      <td>
                        <StatusBadge>{status}</StatusBadge>
                      </td>
                      <td>{owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <article className="panel">
              <div className="panelHead">
                <h2>NAP Health</h2>
              </div>
              <div className="panelBody">
                <div className="scoreRing">
                  <span>82%</span>
                </div>
                <p className="centerText">Most issues are address formatting and missing suite numbers.</p>
                <button className="primaryButton fullWidth">Open NAP Checker</button>
              </div>
            </article>
          </section>

          <section className="splitGrid lowerGrid">
            <article className="panel">
              <div className="panelHead">
                <h2>Directory Opportunities</h2>
                <button className="secondaryButton">Add Directory</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Directory</th>
                    <th>Type</th>
                    <th>Cost</th>
                    <th>Verification</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {directories.map(([name, type, cost, verification, priority]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{type}</td>
                      <td>{cost}</td>
                      <td>{verification}</td>
                      <td>
                        <StatusBadge>{priority}</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <article className="panel">
              <div className="panelHead">
                <h2>Submission Assistant</h2>
              </div>
              <div className="panelBody stack">
                <div className="copyRow">
                  <div>
                    <strong>Business Name</strong>
                    <span>Summit Dental Studio</span>
                  </div>
                  <button className="secondaryButton">Copy</button>
                </div>
                <div className="copyRow">
                  <div>
                    <strong>Address</strong>
                    <span>418 Market Street, Suite 210, Austin, TX 78701</span>
                  </div>
                  <button className="secondaryButton">Copy</button>
                </div>
                <div className="copyRow">
                  <div>
                    <strong>Verification</strong>
                    <span>Human step required for captcha, OTP, or final approval.</span>
                  </div>
                  <StatusBadge>Pending</StatusBadge>
                </div>
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
