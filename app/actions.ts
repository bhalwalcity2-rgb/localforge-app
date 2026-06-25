"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase-server";

export type ClientFormState = {
  ok: boolean;
  message: string | null;
};

export type BusinessFormState = ClientFormState;
export type DirectoryFormState = ClientFormState;
export type CitationTaskFormState = ClientFormState;
export type CoreInfoFormState = ClientFormState;
export type LocationDetailsFormState = ClientFormState;
export type CitationCampaignFormState = ClientFormState;
export type CitationStatusFormState = ClientFormState;

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

async function upsertLocationDetails(
  businessId: string,
  values: Record<string, unknown>
): Promise<LocationDetailsFormState> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { ok: false, message: "Supabase environment variables are missing or invalid." };
  }

  try {
    const { error } = await supabase
      .from("location_details")
      .upsert({
        business_id: businessId,
        ...values,
        updated_at: new Date().toISOString()
      });

    if (error) {
      return { ok: false, message: error.message };
    }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }

  revalidatePath(`/locations/${businessId}`);
  return { ok: true, message: "Saved." };
}

export async function addClient(_previousState: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) {
    return { ok: false, message: "Client name is required." };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    console.error("Supabase environment variables are missing or invalid.");
    return { ok: false, message: "Supabase environment variables are missing or invalid." };
  }

  try {
    const { error } = await supabase.from("clients").insert({
      name,
      email: email || null,
      phone: phone || null,
      notes: notes || null
    });

    if (error) {
      console.error(error.message);
      return { ok: false, message: error.message };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }

  revalidatePath("/");
  return { ok: true, message: "Client saved. Refresh the page if the table does not update immediately." };
}

export async function addBusiness(_previousState: BusinessFormState, formData: FormData): Promise<BusinessFormState> {
  const clientId = String(formData.get("client_id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const primaryCategory = String(formData.get("primary_category") || "").trim();
  const shortDescription = String(formData.get("short_description") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!clientId) {
    return { ok: false, message: "Select a client before adding a business." };
  }

  if (!name || !address) {
    return { ok: false, message: "Business name and address are required." };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return { ok: false, message: "Supabase environment variables are missing or invalid." };
  }

  try {
    const { error } = await supabase.from("businesses").insert({
      client_id: clientId,
      name,
      address,
      phone: phone || null,
      website: website || null,
      email: email || null,
      primary_category: primaryCategory || null,
      short_description: shortDescription || null,
      notes: notes || null
    });

    if (error) {
      return { ok: false, message: error.message };
    }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }

  revalidatePath("/");
  return { ok: true, message: "Business profile saved. Refresh the page if it does not appear immediately." };
}

export async function updateBusinessCoreInfo(
  _previousState: CoreInfoFormState,
  formData: FormData
): Promise<CoreInfoFormState> {
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const primaryCategory = String(formData.get("primary_category") || "").trim();

  if (!id) {
    return { ok: false, message: "Location ID is missing." };
  }

  if (!name || !address) {
    return { ok: false, message: "Location name and address are required." };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return { ok: false, message: "Supabase environment variables are missing or invalid." };
  }

  try {
    const { error } = await supabase
      .from("businesses")
      .update({
        name,
        address,
        phone: phone || null,
        website: website || null,
        primary_category: primaryCategory || null
      })
      .eq("id", id);

    if (error) {
      return { ok: false, message: error.message };
    }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }

  revalidatePath("/");
  revalidatePath(`/locations/${id}`);
  return { ok: true, message: "Core information saved." };
}

export async function updateLocationHours(
  _previousState: LocationDetailsFormState,
  formData: FormData
): Promise<LocationDetailsFormState> {
  const businessId = String(formData.get("business_id") || "").trim();

  if (!businessId) {
    return { ok: false, message: "Location ID is missing." };
  }

  const openingHours = Object.fromEntries(
    days.map((day) => [
      day,
      {
        status: String(formData.get(`${day}_status`) || "closed"),
        open: String(formData.get(`${day}_open`) || "").trim(),
        close: String(formData.get(`${day}_close`) || "").trim()
      }
    ])
  );

  return upsertLocationDetails(businessId, { opening_hours: openingHours });
}

export async function updateLocationImages(
  _previousState: LocationDetailsFormState,
  formData: FormData
): Promise<LocationDetailsFormState> {
  const businessId = String(formData.get("business_id") || "").trim();

  if (!businessId) {
    return { ok: false, message: "Location ID is missing." };
  }

  const images = {
    logo: String(formData.get("logo") || "").trim(),
    primary_1: String(formData.get("primary_1") || "").trim(),
    primary_2: String(formData.get("primary_2") || "").trim(),
    primary_3: String(formData.get("primary_3") || "").trim()
  };

  return upsertLocationDetails(businessId, { images });
}

export async function updateLocationCitationData(
  _previousState: LocationDetailsFormState,
  formData: FormData
): Promise<LocationDetailsFormState> {
  const businessId = String(formData.get("business_id") || "").trim();

  if (!businessId) {
    return { ok: false, message: "Location ID is missing." };
  }

  const citationData = {
    description: String(formData.get("description") || "").trim(),
    contact_first_name: String(formData.get("contact_first_name") || "").trim(),
    contact_last_name: String(formData.get("contact_last_name") || "").trim(),
    contact_email: String(formData.get("contact_email") || "").trim(),
    mobile_phone: String(formData.get("mobile_phone") || "").trim(),
    employees: String(formData.get("employees") || "").trim(),
    services: String(formData.get("services") || "").trim(),
    categories: String(formData.get("categories") || "").trim(),
    payments: formData.getAll("payments").map((value) => String(value))
  };

  return upsertLocationDetails(businessId, { citation_data: citationData });
}

export async function updateLocationSocialLinks(
  _previousState: LocationDetailsFormState,
  formData: FormData
): Promise<LocationDetailsFormState> {
  const businessId = String(formData.get("business_id") || "").trim();

  if (!businessId) {
    return { ok: false, message: "Location ID is missing." };
  }

  const socialLinks = {
    facebook: String(formData.get("facebook") || "").trim(),
    linkedin: String(formData.get("linkedin") || "").trim(),
    x: String(formData.get("x") || "").trim(),
    instagram: String(formData.get("instagram") || "").trim(),
    pinterest: String(formData.get("pinterest") || "").trim(),
    youtube: String(formData.get("youtube") || "").trim(),
    tiktok: String(formData.get("tiktok") || "").trim()
  };

  return upsertLocationDetails(businessId, { social_links: socialLinks });
}

export async function addDirectory(_previousState: DirectoryFormState, formData: FormData): Promise<DirectoryFormState> {
  const name = String(formData.get("name") || "").trim();
  const websiteUrl = String(formData.get("website_url") || "").trim();
  const submissionUrl = String(formData.get("submission_url") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const verificationType = String(formData.get("verification_type") || "").trim();
  const priorityScore = Number(formData.get("priority_score") || 50);
  const isPaid = formData.get("is_paid") === "on";
  const loginRequired = formData.get("login_required") === "on";
  const notes = String(formData.get("notes") || "").trim();

  if (!name) {
    return { ok: false, message: "Directory name is required." };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return { ok: false, message: "Supabase environment variables are missing or invalid." };
  }

  try {
    const { error } = await supabase.from("directories").insert({
      name,
      website_url: websiteUrl || null,
      submission_url: submissionUrl || null,
      type: type || null,
      country: country || null,
      is_paid: isPaid,
      login_required: loginRequired,
      verification_type: verificationType || null,
      priority_score: Number.isFinite(priorityScore) ? priorityScore : 50,
      notes: notes || null
    });

    if (error) {
      return { ok: false, message: error.message };
    }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }

  revalidatePath("/");
  return { ok: true, message: "Directory saved. Refresh the page if it does not appear immediately." };
}

export async function addCitationTask(
  _previousState: CitationTaskFormState,
  formData: FormData
): Promise<CitationTaskFormState> {
  const businessId = String(formData.get("business_id") || "").trim();
  const directoryId = String(formData.get("directory_id") || "").trim();
  const status = String(formData.get("status") || "not_started").trim();
  const listingUrl = String(formData.get("listing_url") || "").trim();
  const verificationNotes = String(formData.get("verification_notes") || "").trim();

  if (!businessId || !directoryId) {
    return { ok: false, message: "Select a business and directory before creating a task." };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return { ok: false, message: "Supabase environment variables are missing or invalid." };
  }

  try {
    const { error } = await supabase.from("citation_tasks").insert({
      business_id: businessId,
      directory_id: directoryId,
      status,
      listing_url: listingUrl || null,
      verification_notes: verificationNotes || null
    });

    if (error) {
      return { ok: false, message: error.message };
    }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }

  revalidatePath("/");
  return { ok: true, message: "Citation task created. Refresh the page if it does not appear immediately." };
}

export async function createCitationCampaign(
  _previousState: CitationCampaignFormState,
  formData: FormData
): Promise<CitationCampaignFormState> {
  const businessId = String(formData.get("business_id") || "").trim();
  const directoryIds = formData.getAll("directory_ids").map((value) => String(value)).filter(Boolean);

  if (!businessId) {
    return { ok: false, message: "Location ID is missing." };
  }

  if (!directoryIds.length) {
    return { ok: false, message: "Select at least one directory." };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return { ok: false, message: "Supabase environment variables are missing or invalid." };
  }

  try {
    const { data: existing, error: existingError } = await supabase
      .from("citation_tasks")
      .select("directory_id")
      .eq("business_id", businessId)
      .in("directory_id", directoryIds);

    if (existingError) {
      return { ok: false, message: existingError.message };
    }

    const existingDirectoryIds = new Set((existing ?? []).map((task) => task.directory_id));
    const newDirectoryIds = directoryIds.filter((directoryId) => !existingDirectoryIds.has(directoryId));

    if (!newDirectoryIds.length) {
      return { ok: true, message: "All selected directories already have citation tasks." };
    }

    const { error } = await supabase.from("citation_tasks").insert(
      newDirectoryIds.map((directoryId) => ({
        business_id: businessId,
        directory_id: directoryId,
        status: "not_started",
        verification_notes: "Created from Citation Builder campaign."
      }))
    );

    if (error) {
      return { ok: false, message: error.message };
    }

    revalidatePath("/");
    revalidatePath(`/locations/${businessId}`);
    return { ok: true, message: `${newDirectoryIds.length} citation tasks created.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateCitationTaskStatus(
  _previousState: CitationStatusFormState,
  formData: FormData
): Promise<CitationStatusFormState> {
  const taskId = String(formData.get("task_id") || "").trim();
  const businessId = String(formData.get("business_id") || "").trim();
  const status = String(formData.get("status") || "not_started").trim();
  const listingUrl = String(formData.get("listing_url") || "").trim();
  const verificationNotes = String(formData.get("verification_notes") || "").trim();

  if (!taskId || !businessId) {
    return { ok: false, message: "Citation task ID is missing." };
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return { ok: false, message: "Supabase environment variables are missing or invalid." };
  }

  try {
    const { error } = await supabase
      .from("citation_tasks")
      .update({
        status,
        listing_url: listingUrl || null,
        verification_notes: verificationNotes || null,
        submitted_at: ["submitted", "pending_verification", "live"].includes(status) ? new Date().toISOString() : null,
        live_at: status === "live" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", taskId);

    if (error) {
      return { ok: false, message: error.message };
    }

    revalidatePath("/");
    revalidatePath(`/locations/${businessId}`);
    return { ok: true, message: "Citation status saved." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}
