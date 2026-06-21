import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

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
  business_name: string | null;
};

type CitationTaskRow = {
  id: string;
  status: string;
  businesses: { name: string } | { name: string }[] | null;
};

async function getBusiness(id: string): Promise<Business | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("id,client_id,name,address,phone,website,primary_category,short_description,clients(name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const business = data as BusinessRow;

  return {
    id: business.id,
    client_id: business.client_id,
    name: business.name,
    address: business.address,
    phone: business.phone,
    website: business.website,
    primary_category: business.primary_category,
    short_description: business.short_description,
    client_name: Array.isArray(business.clients) ? business.clients[0]?.name ?? null : business.clients?.name ?? null
  };
}

async function getLocationTasks(businessName: string): Promise<CitationTask[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("citation_tasks")
    .select("id,status,businesses(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return ((data ?? []) as CitationTaskRow[])
    .map((task) => {
      const business = Array.isArray(task.businesses) ? task.businesses[0] : task.businesses;

      return {
        id: task.id,
        status: task.status,
        business_name: business?.name ?? null
      };
    })
    .filter((task) => task.business_name === businessName);
}

export default async function LocationManagerPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getBusiness(id);

  if (!business) {
    notFound();
  }

  const citationTasks = await getLocationTasks(business.name);

  return (
    <main className="standalonePage">
      <section className="pageHead">
        <div>
          <Link className="backLink" href="/">
            <ArrowLeft size={16} />
            All Locations
          </Link>
          <h1>Location Manager</h1>
          <p>Manage this specific location NAP, sync, citations, images, and future modules.</p>
        </div>
        <span className="badge live">Location Ready</span>
      </section>

      <section className="panel locationPanel">
        <div className="locationBody singleLocationBody">
          <aside className="locationList" aria-label="Selected location">
            <div className="locationItem active">
              <strong>{business.name}</strong>
              <span>{business.client_name || "No client"}</span>
              <small>{business.primary_category || "Category missing"}</small>
            </div>
          </aside>
          <div className="locationDetail">
            <section className="locationHero">
              <div>
                <span className="eyebrow">Selected Location</span>
                <h3>{business.name}</h3>
                <p>{business.address}</p>
              </div>
              <div className="locationScore">
                <strong>{citationTasks.length}</strong>
                <span>Citation items</span>
              </div>
            </section>

            <section className="managerSection">
              <div className="managerSectionHead">
                <h3>Core Information</h3>
                <span>General settings and business details</span>
              </div>
              <div className="infoGrid">
                <div><span>Client</span><strong>{business.client_name || "-"}</strong></div>
                <div><span>Unique Location Reference</span><strong>{business.name.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 14) || business.id.slice(0, 8)}</strong></div>
                <div><span>Location Name</span><strong>{business.name}</strong></div>
                <div><span>Address</span><strong>{business.address || "-"}</strong></div>
                <div><span>Category</span><strong>{business.primary_category || "-"}</strong></div>
                <div><span>Phone</span><strong>{business.phone || "-"}</strong></div>
                <div><span>Website</span><strong>{business.website || "-"}</strong></div>
                <div><span>Service Area Business</span><strong>No</strong></div>
              </div>
            </section>

            <section className="managerSection">
              <div className="managerSectionHead">
                <h3>Connect & Sync</h3>
                <span>Future module connections</span>
              </div>
              <div className="connectionList">
                {["Google Business Profile", "Facebook", "Bing", "Apple Maps", "Yelp"].map((platform, index) => (
                  <div className="connectionRow" key={platform}>
                    <div>
                      <strong>{platform}</strong>
                      <span>{index === 0 ? "Next: connect Google access to import location data automatically." : "Connection planned for sync and alerts."}</span>
                    </div>
                    <span className={index === 0 ? "connectionBadge ready" : "connectionBadge"}>{index === 0 ? "GBP ready" : "Later"}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="managerSection">
              <div className="managerSectionHead">
                <h3>Opening Hours</h3>
                <span>Regular hours</span>
              </div>
              <div className="hoursGrid">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <div key={day} className="hoursRow">
                    <strong>{day}</strong>
                    <span>Open</span>
                    <time>09:00</time>
                    <em>to</em>
                    <time>17:00</time>
                  </div>
                ))}
                {["Saturday", "Sunday"].map((day) => (
                  <div key={day} className="hoursRow">
                    <strong>{day}</strong>
                    <span>Closed</span>
                    <time>-</time>
                    <em>to</em>
                    <time>-</time>
                  </div>
                ))}
              </div>
            </section>

            <section className="managerSection">
              <div className="managerSectionHead">
                <h3>Image Management</h3>
                <span>Logo and primary photos</span>
              </div>
              <div className="imageManager">
                <div className="uploadDropzone">
                  <strong>Drag files here</strong>
                  <span>or browse when uploads are enabled</span>
                </div>
                <div className="imageSlots">
                  {["Logo", "Primary 1", "Primary 2", "Primary 3"].map((slot) => (
                    <div key={slot}>{slot}</div>
                  ))}
                </div>
              </div>
            </section>

            <section className="managerSection">
              <div className="managerSectionHead">
                <h3>About the Business</h3>
                <span>Description used for citations</span>
              </div>
              <div className="descriptionBox">
                <p>{business.short_description || "No business description saved yet."}</p>
                <span>750 characters remaining</span>
              </div>
            </section>

            <section className="managerSection">
              <div className="managerSectionHead">
                <h3>Citation Builder Data</h3>
                <span>Extra directory listing data</span>
              </div>
              <div className="citationDataGrid">
                <div><span>Contact first name</span><strong>Not supplied</strong></div>
                <div><span>Contact last name</span><strong>Not supplied</strong></div>
                <div><span>Contact email</span><strong>Not supplied</strong></div>
                <div><span>Mobile phone</span><strong>{business.phone || "Not supplied"}</strong></div>
              </div>
              <div className="pillList">
                <span>Cash</span>
                <span>Visa</span>
                <span>Mastercard</span>
                <span>Invoice</span>
                <span>PayPal</span>
              </div>
            </section>

            <section className="managerSection">
              <div className="managerSectionHead">
                <h3>Social Profile Links</h3>
                <span>Profiles for authority signals</span>
              </div>
              <div className="socialLinkGrid">
                {["Facebook", "LinkedIn", "X", "Instagram", "Pinterest", "YouTube", "TikTok"].map((network) => (
                  <div key={network}>
                    <span>{network}</span>
                    <strong>https://{network.toLowerCase()}.com</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
