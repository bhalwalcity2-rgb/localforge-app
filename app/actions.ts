"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "@/lib/supabase-url";

function getSupabaseClient() {
  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function addClient(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) {
    return;
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    console.error("Supabase environment variables are missing or invalid.");
    redirect("/?client_error=supabase_env");
  }

  let saveError: string | null = null;

  try {
    const { error } = await supabase.from("clients").insert({
      name,
      email: email || null,
      phone: phone || null,
      notes: notes || null
    });

    if (error) {
      console.error(error.message);
      saveError = error.message;
    }
  } catch (error) {
    console.error(error);
    saveError = error instanceof Error ? error.message : "save_failed";
  }

  if (saveError) {
    redirect(`/?client_error=${encodeURIComponent(saveError)}`);
  }

  revalidatePath("/");
  redirect("/?client_saved=1");
}
