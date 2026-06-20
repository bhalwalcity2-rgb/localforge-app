"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "@/lib/supabase-url";

export type ClientFormState = {
  ok: boolean;
  message: string | null;
};

function getSupabaseClient() {
  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
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
