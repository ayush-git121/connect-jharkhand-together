import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Crosshair, Info } from "lucide-react";
import { toast } from "sonner";
import { PageHead } from "@/components/civic/shell";
import { useCivic } from "@/lib/civic-store";
import { BLOCKS, DISTRICTS } from "@/lib/civic-data";
import { CATEGORIES, type Category } from "@/lib/civic-types";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a civic issue — Jharkhand Civic Connect" },
      {
        name: "description",
        content:
          "File a local problem with photographs, GPS location and household impact. Your Panchayat verifies it before it enters the solution pipeline.",
      },
      { property: "og:title", content: "Report a civic issue — Jharkhand Civic Connect" },
      {
        property: "og:description",
        content: "Photo, location and description — your Panchayat verifies it next.",
      },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { addIssue, role } = useCivic();
  const navigate = useNavigate();
  const [district, setDistrict] = useState("Dumka");
  const [photos, setPhotos] = useState<string[]>([]);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [anonymous, setAnonymous] = useState(false);

  const blocks = BLOCKS[district] ?? [];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!pin) {
      toast.error("Add a location pin before submitting");
      return;
    }
    const id = addIssue({
      title: String(f.get("title")),
      category: String(f.get("category")) as Category,
      description: String(f.get("description")),
      district,
      block: String(f.get("block")),
      panchayat: String(f.get("panchayat")),
      village: String(f.get("village")),
      lat: pin.lat,
      lng: pin.lng,
      reporterName: String(f.get("name") || "Citizen"),
      reporterKind: role === "ngo" ? "ngo" : "citizen",
      reporterPhone: String(f.get("phone") || "+91 9xxxxxxxxx"),
      anonymous,
      peopleAffected: Number(f.get("affected") || 0),
      photos,
    });
    toast.success(`Report filed as ${id}. Sent to the Panchayat for verification.`);
    navigate({ to: "/issues/$issueId", params: { issueId: id } });
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Report a civic issue"
        intro="Describe what is broken, where it is, and who it affects. A Panchayat official will visit the site and record a verification outcome."
      />
      <p className="flex items-start gap-2 border-l-2 border-primary bg-surface p-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>
          Nothing is published to universities or industry partners until your Panchayat verifies the report. You
          can file anonymously; your name and phone number are then never shown to anyone outside the verifying
          official.
        </span>
      </p>

      <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-4 rule-top bg-card p-5">
          <Field label="What is the problem?" hint="One line, as specific as possible">
            <input
              name="title"
              required
              maxLength={140}
              placeholder="Only handpump in the tola has been dry for weeks"
              className="w-full border border-input bg-background px-3 py-2 text-sm"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select name="category" className="w-full border border-input bg-background px-3 py-2 text-sm">
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="People affected">
              <input
                name="affected"
                type="number"
                min={0}
                defaultValue={50}
                className="w-full border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>
          <Field label="Describe it in detail" hint="Since when, what has been tried, who is worst affected">
            <textarea
              name="description"
              required
              rows={5}
              className="w-full border border-input bg-background px-3 py-2 text-sm"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="District">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full border border-input bg-background px-3 py-2 text-sm"
              >
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Block">
              <select name="block" className="w-full border border-input bg-background px-3 py-2 text-sm">
                {blocks.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="Panchayat">
              <input
                name="panchayat"
                required
                className="w-full border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Village / tola / ward">
              <input
                name="village"
                required
                className="w-full border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <section className="rule-top bg-card p-5">
            <h2 className="font-serif text-lg">Photographs</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Attach up to three photos. Photos speed up field verification.
            </p>
            <button
              type="button"
              onClick={() =>
                setPhotos((p) =>
                  p.length >= 3 ? p : [...p, `Field photo ${p.length + 1} (attached from device)`],
                )
              }
              className="mt-3 inline-flex items-center gap-2 border border-input px-3 py-1.5 text-sm hover:bg-secondary"
            >
              <Camera className="size-4" aria-hidden /> Attach photo
            </button>
            <ul className="mt-3 space-y-1 text-sm">
              {photos.map((p) => (
                <li key={p} className="border border-border bg-surface px-3 py-2">
                  {p}
                </li>
              ))}
              {photos.length === 0 ? <li className="text-sm text-muted-foreground">None attached yet.</li> : null}
            </ul>
          </section>

          <section className="rule-top bg-card p-5">
            <h2 className="font-serif text-lg">Location</h2>
            <button
              type="button"
              onClick={() =>
                setPin({
                  lat: 22 + Math.random() * 3.2,
                  lng: 83.5 + Math.random() * 4.2,
                })
              }
              className="mt-2 inline-flex items-center gap-2 border border-input px-3 py-1.5 text-sm hover:bg-secondary"
            >
              <Crosshair className="size-4" aria-hidden /> Use my current location
            </button>
            <p className="mt-2 text-sm" aria-live="polite">
              {pin
                ? `Pinned at ${pin.lat.toFixed(4)}°N, ${pin.lng.toFixed(4)}°E`
                : "No pin yet — required before submitting."}
            </p>
          </section>

          <section className="rule-top bg-card p-5">
            <h2 className="font-serif text-lg">Your details</h2>
            <label className="mt-3 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="mt-0.5"
              />
              <span>File anonymously (your name is hidden from every role view)</span>
            </label>
            <div className="mt-3 grid gap-3">
              <Field label="Name">
                <input
                  name="name"
                  className="w-full border border-input bg-background px-3 py-2 text-sm"
                  placeholder={role === "ngo" ? "Organisation name" : "Your name"}
                />
              </Field>
              <Field label="Phone" hint="Used only by the verifying official">
                <input name="phone" className="w-full border border-input bg-background px-3 py-2 text-sm" />
              </Field>
            </div>
          </section>

          <button
            type="submit"
            className="w-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Submit for Panchayat verification
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
