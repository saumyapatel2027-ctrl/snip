"use client";
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Uploads images to the public `snip` bucket under `<userId>/<folder>/…`
 * and keeps the resulting URLs in a hidden input (one URL per line) named `name`.
 */
export function PhotoUploader({
  userId,
  folder,
  name,
  initial = [],
  max = 8,
}: {
  userId: string;
  folder: string;
  name: string;
  initial?: string[];
  max?: number;
}) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const next = [...urls];
    for (const file of Array.from(files).slice(0, max - urls.length)) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is over 5 MB.`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("snip").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
      });
      if (upErr) {
        setError(upErr.message);
        continue;
      }
      next.push(supabase.storage.from("snip").getPublicUrl(path).data.publicUrl);
    }
    setUrls(next);
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {urls.map((u) => (
          <div key={u} className="relative h-24 w-24 overflow-hidden rounded-xl border border-ink/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setUrls(urls.filter((x) => x !== u))}
              className="absolute right-1 top-1 rounded-full bg-ink/70 p-1 text-ivory"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {urls.length < max && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="grid h-24 w-24 place-items-center rounded-xl border border-dashed border-ink/25 text-ink-500 hover:border-maroon hover:text-maroon"
          >
            <span className="flex flex-col items-center gap-1 text-xs">
              <ImagePlus className="h-5 w-5" />
              {busy ? "Uploading…" : "Add photo"}
            </span>
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />
      <input type="hidden" name={name} value={urls.join("\n")} />
      {error && <p className="mt-2 text-xs text-maroon">{error}</p>}
    </div>
  );
}
