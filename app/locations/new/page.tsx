import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase-server";
import { AddLocationPanel } from "../../add-location-panel";

export const dynamic = "force-dynamic";

type Client = {
  id: string;
  name: string;
};

async function getClients(): Promise<Client[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("clients")
    .select("id,name")
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data ?? [];
}

export default async function AddLocationPage() {
  const clients = await getClients();

  return (
    <main className="standalonePage">
      <section className="pageHead">
        <div>
          <Link className="backLink" href="/">
            <ArrowLeft size={16} />
            All Locations
          </Link>
          <h1>Add Location(s)</h1>
          <p>Import from GBP later, or add a manual NAP profile now.</p>
        </div>
      </section>

      <section className="addLocationPageGrid">
        <AddLocationPanel clients={clients} defaultOpen />
      </section>
    </main>
  );
}
