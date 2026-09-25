import { createClient } from "@supabase/supabase-js";

function getClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
}

export async function saveNote(text) {
  const { data, error } = await getClient()
    .from("notes")
    .insert({ text })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function saveDraft(noteId, text) {
  const { data, error } = await getClient()
    .from("drafts")
    .insert({ note_id: noteId, text, status: "pending" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateLatestDraftStatus(status) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("drafts")
    .select("id")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return false;

  await supabase
    .from("drafts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", data.id);
  return true;
}
