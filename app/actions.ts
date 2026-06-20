"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith("http")) {
    throw new Error("Supabase environment variables are missing.");
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

  const { error } = await supabase.from("clients").insert({
    name,
    email: email || null,
    phone: phone || null,
    notes: notes || null
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}
