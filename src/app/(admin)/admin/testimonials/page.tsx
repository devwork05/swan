"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquareQuote, Plus, Loader2, X, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { api, qk, type Testimonial, type TestimonialInput } from "@/lib/api";
import { AdminCard, PageHeader } from "@/components/dashboard/AdminUI";
import { FileUploader } from "@/components/FileUploader";

const empty = (): TestimonialInput => ({
  name: "",
  role: "",
  avatarUrl: "",
  username: "",
  quote: "",
  rating: 5,
  displayOrder: 0,
  published: true,
});

export default function AdminTestimonialsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: qk.admin.testimonials,
    queryFn: () => api.admin.testimonials.list(),
    refetchInterval: 30_000,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.admin.testimonials });
    qc.invalidateQueries({ queryKey: qk.testimonials });
  };

  const removeMutation = useMutation({
    mutationFn: (id: number) => api.admin.testimonials.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Testimonial deleted");
    },
    onError: (e: Error) => toast.error(e.message || "Delete failed"),
  });

  const togglePublished = useMutation({
    mutationFn: ({ id, published }: { id: number; published: boolean }) =>
      api.admin.testimonials.update(id, { published }),
    onSuccess: invalidate,
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Testimonials"
        icon={MessageSquareQuote}
        subtitle="Investor quotes rendered on the marketing home page."
        right={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-darkred"
          >
            <Plus className="h-4 w-4" />
            New Testimonial
          </button>
        }
      />

      <AdminCard className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border text-muted">
                <th className="pb-3 font-medium">Investor</th>
                <th className="pb-3 font-medium">Quote</th>
                <th className="pb-3 font-medium">Rating</th>
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Published</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" />
                  </td>
                </tr>
              )}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-subtle">
                    No testimonials yet. Add one to have it appear on the home page.
                  </td>
                </tr>
              )}
              {items.map((t) => (
                <tr key={t.id} className="border-b border align-top">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {t.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={t.avatarUrl} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/10 text-[11px] font-bold text-brand-red">
                          {t.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-primary">{t.name}</p>
                        <p className="text-[11px] text-subtle">
                          {t.role || "—"}
                          {t.username ? ` · ${t.username.startsWith("@") ? t.username : `@${t.username}`}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-secondary">
                    <p className="line-clamp-2 max-w-[380px]">{t.quote}</p>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-subtle"}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-secondary">{t.displayOrder}</td>
                  <td className="py-3">
                    <button
                      onClick={() => togglePublished.mutate({ id: t.id, published: !t.published })}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        t.published ? "bg-emerald-500/10 text-emerald-500" : "bg-subtle/20 text-subtle"
                      }`}
                    >
                      {t.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {t.published ? "Live" : "Hidden"}
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditing(t)}
                        className="inline-flex items-center gap-1 rounded-md border bg-page px-2.5 py-1 text-[11.5px] text-secondary hover:border-brand-red hover:text-brand-red"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete testimonial from ${t.name}?`)) removeMutation.mutate(t.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border bg-page px-2.5 py-1 text-[11.5px] text-secondary hover:border-red-500 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {(creating || editing) && (
        <Editor
          initial={editing ?? empty()}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function Editor({ initial, onClose }: { initial: Testimonial | TestimonialInput; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = "id" in initial;
  const [form, setForm] = useState<TestimonialInput>(
    isEdit
      ? {
          name: (initial as Testimonial).name,
          role: (initial as Testimonial).role ?? "",
          avatarUrl: (initial as Testimonial).avatarUrl ?? "",
          username: (initial as Testimonial).username ?? "",
          quote: (initial as Testimonial).quote,
          rating: (initial as Testimonial).rating,
          displayOrder: (initial as Testimonial).displayOrder,
          published: (initial as Testimonial).published,
        }
      : (initial as TestimonialInput),
  );
  const patch = <K extends keyof TestimonialInput>(k: K, v: TestimonialInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: () =>
      isEdit
        ? api.admin.testimonials.update((initial as Testimonial).id, form)
        : api.admin.testimonials.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.testimonials });
      qc.invalidateQueries({ queryKey: qk.testimonials });
      toast.success(isEdit ? "Testimonial updated" : "Testimonial created");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message || "Save failed"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="font-montserrat text-[18px] font-bold text-primary">
            {isEdit ? "Edit Testimonial" : "New Testimonial"}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[12px] text-muted">Name</label>
            <input
              value={form.name}
              onChange={(e) => patch("name", e.target.value)}
              placeholder="Jane Doe"
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="text-[12px] text-muted">Role</label>
            <input
              value={form.role ?? ""}
              onChange={(e) => patch("role", e.target.value)}
              placeholder="First-time Investor"
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>

          <div>
            <label className="text-[12px] text-muted">Username</label>
            <input
              value={form.username ?? ""}
              onChange={(e) => patch("username", e.target.value)}
              placeholder="@jane"
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="text-[12px] text-muted">Display order</label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => patch("displayOrder", Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>

          <div className="sm:col-span-2">
            <FileUploader
              label="Avatar (optional)"
              value={form.avatarUrl ?? undefined}
              onChange={(url) => patch("avatarUrl", url)}
              folder="testimonials"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[12px] text-muted">Quote</label>
            <textarea
              value={form.quote}
              onChange={(e) => patch("quote", e.target.value)}
              rows={4}
              placeholder="What a customer service..."
              className="mt-1 w-full rounded-md border bg-page px-3 py-2 text-[13px] text-primary outline-none focus:border-brand-red"
            />
          </div>

          <div>
            <label className="text-[12px] text-muted">Rating</label>
            <div className="mt-1 flex items-center gap-1 rounded-md border bg-page px-3 py-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => patch("rating", n)}
                  className="p-0.5"
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={`h-5 w-5 transition-colors ${n <= form.rating ? "fill-amber-400 text-amber-400" : "text-subtle hover:text-amber-400"}`}
                  />
                </button>
              ))}
              <span className="ml-2 text-[12px] text-muted">{form.rating}/5</span>
            </div>
          </div>

          <label className="mt-6 flex items-center gap-2 text-[13px] text-secondary">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => patch("published", e.target.checked)}
              className="h-4 w-4 accent-brand-red"
            />
            Publish on home page
          </label>
        </div>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !form.name.trim() || !form.quote.trim()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand-red py-2.5 text-[13px] font-semibold text-white hover:bg-brand-darkred disabled:opacity-60"
        >
          {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save changes" : "Create testimonial"}
        </button>
      </div>
    </div>
  );
}
