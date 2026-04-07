import { google } from "googleapis";
import { NextResponse } from "next/server";

export const revalidate = 0; // no cache — random selection each request

export async function GET() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const folderId = process.env.GOOGLE_DRIVE_GALLERY_FOLDER_ID;

  if (!email || !key || !folderId) {
    return NextResponse.json({ error: "Missing config" }, { status: 500 });
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: key,
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: "files(id, name, thumbnailLink)",
    pageSize: 100,
  });

  const all = (res.data.files ?? []).filter((f) => f.thumbnailLink);

  // Shuffle and pick up to 8
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  const photos = all.slice(0, 8).map((f) => ({
    id: f.id,
    name: f.name,
    src: f.thumbnailLink!.replace(/=s\d+$/, "=s1600"),
  }));

  return NextResponse.json(photos);
}
