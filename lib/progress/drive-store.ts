import type { UserProgress } from "../types";

const FILE_NAME = "mihu-progress.json";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";

async function findProgressFile(
  accessToken: string
): Promise<string | null> {
  const params = new URLSearchParams({
    spaces: "appDataFolder",
    q: `name='${FILE_NAME}'`,
    fields: "files(id)",
  });

  const res = await fetch(`${DRIVE_FILES_URL}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

export async function loadFromDrive(
  accessToken: string
): Promise<UserProgress | null> {
  try {
    const fileId = await findProgressFile(accessToken);
    if (!fileId) return null;

    const res = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return null;

    return (await res.json()) as UserProgress;
  } catch {
    return null;
  }
}

export async function saveToDrive(
  accessToken: string,
  progress: UserProgress
): Promise<void> {
  try {
    const fileId = await findProgressFile(accessToken);
    const body = JSON.stringify(progress);

    if (fileId) {
      // Update existing file
      await fetch(`${DRIVE_UPLOAD_URL}/${fileId}?uploadType=media`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body,
      });
    } else {
      // Create new file in appDataFolder
      const metadata = {
        name: FILE_NAME,
        parents: ["appDataFolder"],
      };

      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      form.append(
        "file",
        new Blob([body], { type: "application/json" })
      );

      await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });
    }
  } catch (err) {
    console.error("Drive save failed:", err);
  }
}
