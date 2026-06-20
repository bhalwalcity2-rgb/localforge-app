"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase-server";

export type ClientFormState = {
  ok: boolean;
  message: string | null;
};

export type BusinessFormState = ClientFormState;

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
