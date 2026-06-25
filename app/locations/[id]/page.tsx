import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase-server";
import {
  CitationBuilderDataForm,
  ImageManagementForm,
  OpeningHoursForm,
  SocialLinksForm
} from "../../location-detail-forms";
import { LocationCoreInfo } from "../../location-core-info";

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

type LocationDetails = {
  opening_hours: Record<string, { status?: string; open?: string; close?: string }>;
  images: Record<string, string>;
  citation_data: Record<string, string | string[]>;
  social_links: Record<string, string>;
};

const emptyDetails: LocationDetails = {
  opening_hours: {},
  images: {},
  citation_data: {},
  social_links: {}
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

async function getLocationDetails(id: string): Promise<LocationDetails> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return emptyDetails;
  }

  const { data, error } = await supabase
    .from("location_details")
    .select("opening_hours,images,citation_data,social_links")
    .eq("business_id", id)
    .maybeSingle();

  if (error || !data) {
    return emptyDetails;
  }

  return {
    opening_hours: asRecord(data.opening_hours) as Record<string, { status?: string; open?: string; close?: string }>,
    images: asRecord(data.images) as Record<string, string>,
    citation_data: asRecord(data.citation_data) as Record<string, string | string[]>,
    social_links: asRecord(data.social_links) as Record<string, string>
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
  const details = await getLocationDetails(business.id);

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

            <LocationCoreInfo business={business} />

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

            <OpeningHoursForm businessId={business.id} hours={details.opening_hours} />
            <ImageManagementForm businessId={business.id} images={details.images} />
            <CitationBuilderDataForm
              businessId={business.id}
              citationData={details.citation_data}
              fallbackDescription={business.short_description}
              fallbackPhone={business.phone}
            />
            <SocialLinksForm businessId={business.id} socialLinks={details.social_links} />
          </div>
        </div>
      </section>
    </main>
  );
}
