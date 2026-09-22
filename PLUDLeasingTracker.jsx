import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Users, Building2, Plus, Pencil, Trash2, X,
  Search, ChevronDown, Phone, Mail, Calendar, MapPin, Check,
  AlertCircle, Loader2, LogOut, Settings, Wrench, FileText, Download, Printer,
} from "lucide-react";

const PROPERTIES = [
  "Vine Building", "Diaz Property", "Victoria Property",
  "Menakor Property", "Ruasol Property", "E&M Building", "Other / TBD",
];

const CATEGORY_CONCEPTS = {
  "Creative and Cultural": ["Art Gallery", "Art Studio", "Art Workshop", "Craft Store", "Bookstore", "Concept Store", "Makerspace", "Exhibition Space", "Creative Studio", "Design Studio"],
  "Food and Beverage": ["Café / Coffee Shop", "Specialty Drink", "Restaurant", "Bistro", "Bakery", "Dessert Shop", "Bar & Restaurant", "Cocktail Bar", "Wine Bar", "Specialty Food"],
  "Retail": ["Fashion", "Beauty", "Home & Lifestyle", "Specialty Retail", "Gift/ Souvenir", "Multi-brand Retail"],
  "Wellness": ["Fitness Studio", "Yoga/ Pilates", "Salon", "Spa", "Wellness Center"],
  "Office": ["Coworking Space", "Private Office"],
  "Entertainment": ["Live Music", "Performance Space", "Event Venue", "Gaming/ Hobby", "Experience Space"],
};
const CATEGORIES = Object.keys(CATEGORY_CONCEPTS);

const STATUSES = ["Inquired", "Pending Requirements", "Under Evaluation", "Awarded/ Leased", "Lost/ Inactive"];

const STATUS_STYLE = {
  "Inquired": { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
  "Pending Requirements": { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
  "Under Evaluation": { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
  "Awarded/ Leased": { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
  "Lost/ Inactive": { bg: "bg-rose-100", text: "text-rose-800", dot: "bg-rose-500" },
};

const SEED_LISTINGS = [
  ["Vine Building", "V101"], ["Vine Building", "V102"], ["Vine Building", "V103"],
  ["Vine Building", "V201"], ["Vine Building", "V202"], ["Vine Building", "V301"],
  ["Vine Building", "V302"], ["Vine Building", "V303"], ["Vine Building", "V304"],
  ["Vine Building", "V401"], ["Vine Building", "V402"], ["Vine Building", "V501"],
  ["Vine Building", "V502A"], ["Vine Building", "V502B"],
  ["Diaz Property", "Diaz Property"],
  ["Victoria Property", "Victoria Property"],
  ["Menakor Property", "Men- Unit A&B"], ["Menakor Property", "Men- Unit C"], ["Menakor Property", "Men- Unit D"],
  ["Ruasol Property", "Ruasol Property"],
].map(([property, unit], i) => ({
  id: `L${i + 1}`, property, unit, floorArea: "", askingRate: "", notes: "",
}));

const SEED_TENANTS = [
  {
    id: "T1", dateInquired: "2026-02-07", brand: "(New Concept: Shisha Lounge Bar)",
    category: "Food and Beverage", concept: "Bar & Restaurant", contact: 'Oussama "Sam" Bouteldja',
    mobile: "97433665760", email: "Belliniluca314@gmail.com", sqm: "41-60 sq.m",
    property: "Vine Building", unit: "V202",
    remarks: "07/24 - Emailed Sam the requirements for application",
    unitViewing: "", foodTasting: "", status: "Inquired",
  },
  {
    id: "T2", dateInquired: "2026-03-17", brand: "Vito's BBQ",
    category: "Food and Beverage", concept: "Specialty Food", contact: "Natalia Rivera",
    mobile: "9173100172", email: "vbbq.natalia@gmail.com", sqm: "25-40 sq.m",
    property: "Vine Building", unit: "V102",
    remarks: "Pending submission of application requirements c/o Ms. Nat",
    unitViewing: "2026-03-17", foodTasting: "2026-03-17", status: "Pending Requirements",
  },
  {
    id: "T3", dateInquired: "2026-03-26", brand: "(New Concept: Café)",
    category: "Food and Beverage", concept: "Café / Coffee Shop", contact: "Abhishek Chaturvedi",
    mobile: "9616400581", email: "Abhishek28feb1995@gmail.com", sqm: "41-60 sq.m",
    property: "Vine Building", unit: "V202",
    remarks: "07/24 For confirmation with friends. Follow up on July 30.",
    unitViewing: "", foodTasting: "", status: "Pending Requirements",
  },
  {
    id: "T4", dateInquired: "2026-08-14", brand: "(New Concept: Korean Cuisine)",
    category: "Food and Beverage", concept: "Specialty Food", contact: "Marco Calderon",
    mobile: "9276227621", email: "marco112922.cclim@gmail.com", sqm: "120 sq.m",
    property: "Victoria Property", unit: "Victoria Property",
    remarks: "To schedule ocular inspection - August 14",
    unitViewing: "", foodTasting: "", status: "Inquired",
  },
];

const MAINT_STATUSES = ["Open", "In Progress", "Resolved", "Cancelled"];
const MAINT_PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const MAINT_STATUS_STYLE = {
  "Open": { bg: "bg-rose-100", text: "text-rose-800", dot: "bg-rose-600" },
  "In Progress": { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
  "Resolved": { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
  "Cancelled": { bg: "bg-stone-100", text: "text-stone-700", dot: "bg-stone-400" },
};
const MAINT_PRIORITY_STYLE = {
  "Low": { bg: "bg-stone-100", text: "text-stone-700", dot: "bg-stone-400" },
  "Medium": { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
  "High": { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
  "Urgent": { bg: "bg-rose-100", text: "text-rose-800", dot: "bg-rose-600" },
};

const SEED_MAINTENANCE = [
  {
    id: "M1", property: "Vine Building", unit: "V301", issue: "Aircon unit not cooling, needs refill/service",
    priority: "High", status: "Open", reportedDate: "2026-09-02", assignedTo: "Building Engineering",
    resolvedDate: "", notes: "Tenant reported warm air only since Monday.",
  },
  {
    id: "M2", property: "Vine Building", unit: "V102", issue: "Leaking pipe under kitchen sink",
    priority: "Urgent", status: "In Progress", reportedDate: "2026-09-10", assignedTo: "Plumbing contractor",
    resolvedDate: "", notes: "Contractor scheduled for site visit.",
  },
  {
    id: "M3", property: "Diaz Property", unit: "Diaz Property", issue: "Flickering hallway lights",
    priority: "Low", status: "Resolved", reportedDate: "2026-08-20", assignedTo: "In-house maintenance",
    resolvedDate: "2026-08-22", notes: "Replaced ballast, confirmed fixed.",
  },
];

const REPORT_TYPES = [
  { id: "pipeline", label: "Leasing Pipeline" },
  { id: "occupancy", label: "Occupancy" },
  { id: "maintenance", label: "Maintenance" },
];

function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const STORAGE_KEY = "plud-leasing-tracker-data"; // legacy key, no longer used for tenants/listings
const USER_STORAGE_KEY = "plud-leasing-tracker-user";
const SUPABASE_URL = "https://bgciayhxvkqhmgcdfvco.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnY2lheWh4dmtxaG1nY2RmdmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjU4NTIsImV4cCI6MjEwNDYwMTg1Mn0.nzt3RSE65MrR_Y3lqPiGFwYgdoBnsYDC8ket3GifYuk";

// Talks to Supabase's REST API directly with fetch, rather than importing
// the @supabase/supabase-js SDK, since the artifact sandbox only allows a
// fixed set of importable packages and that SDK isn't one of them.
async function sbRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase ${options.method || "GET"} ${path} failed: ${res.status} ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}
const sbSelect = (table) => sbRequest(`${table}?select=*`);
const sbUpsert = (table, rows) => sbRequest(table, {
  method: "POST",
  headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify(rows),
});
const sbDelete = (table, id) => sbRequest(`${table}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });

function tenantRowToState(r) {
  return {
    id: r.id, dateInquired: r.date_inquired || "", brand: r.brand || "", category: r.category || "",
    concept: r.concept || "", contact: r.contact || "", mobile: r.mobile || "", email: r.email || "",
    sqm: r.sqm || "", property: r.property || "", unit: r.unit || "", remarks: r.remarks || "",
    unitViewing: r.unit_viewing || "", foodTasting: r.food_tasting || "", status: r.status || "Inquired",
  };
}
function tenantStateToRow(t) {
  return {
    id: t.id, date_inquired: t.dateInquired || null, brand: t.brand || "", category: t.category || "",
    concept: t.concept || "", contact: t.contact || "", mobile: t.mobile || "", email: t.email || "",
    sqm: t.sqm || "", property: t.property || "", unit: t.unit || "", remarks: t.remarks || "",
    unit_viewing: t.unitViewing || null, food_tasting: t.foodTasting || null, status: t.status || "Inquired",
  };
}
function listingRowToState(r) {
  return {
    id: r.id, property: r.property, unit: r.unit,
    floorArea: r.floor_area === null ? "" : r.floor_area,
    askingRate: r.asking_rate === null ? "" : r.asking_rate,
    notes: r.notes || "",
    createdAt: r.created_at ? r.created_at.slice(0, 10) : "",
  };
}
function listingStateToRow(l) {
  return {
    id: l.id, property: l.property, unit: l.unit,
    floor_area: l.floorArea === "" || l.floorArea === undefined ? null : Number(l.floorArea),
    asking_rate: l.askingRate === "" || l.askingRate === undefined ? null : Number(l.askingRate),
    notes: l.notes || "",
  };
}

function maintRowToState(r) {
  return {
    id: r.id, property: r.property || "", unit: r.unit || "", issue: r.issue || "",
    priority: r.priority || "Medium", status: r.status || "Open",
    reportedDate: r.reported_date || "", assignedTo: r.assigned_to || "",
    resolvedDate: r.resolved_date || "", notes: r.notes || "",
  };
}
function maintStateToRow(m) {
  return {
    id: m.id, property: m.property || "", unit: m.unit || "", issue: m.issue || "",
    priority: m.priority || "Medium", status: m.status || "Open",
    reported_date: m.reportedDate || null, assigned_to: m.assignedTo || "",
    resolved_date: m.resolvedDate || null, notes: m.notes || "",
  };
}

// Session storage: uses window.storage when available (Claude artifact
// preview), falls back to plain localStorage otherwise, so sign-in
// survives a reload in both environments.
const sessionStore = {
  async get(key) {
    if (typeof window !== "undefined" && window.storage) {
      try { return await window.storage.get(key, false); } catch (e) { /* fall through */ }
    }
    try {
      const v = localStorage.getItem(key);
      return v != null ? { key, value: v } : null;
    } catch (e) { return null; }
  },
  async set(key, value) {
    if (typeof window !== "undefined" && window.storage) {
      try { return await window.storage.set(key, value, false); } catch (e) { /* fall through */ }
    }
    try { localStorage.setItem(key, value); return { key, value }; } catch (e) { return null; }
  },
  async delete(key) {
    if (typeof window !== "undefined" && window.storage) {
      try { return await window.storage.delete(key, false); } catch (e) { /* fall through */ }
    }
    try { localStorage.removeItem(key); return { key, deleted: true }; } catch (e) { return null; }
  },
};

const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const keyOf = (property, unit) => (property && unit ? `${property}|${unit}` : "");
const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const fmtMoney = (n) => (n || n === 0 ? `₱${Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—");

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randomSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function computeListingStatus(listingKey, tenants) {
  const matches = tenants.filter((t) => keyOf(t.property, t.unit) === listingKey);
  if (matches.some((t) => t.status === "Awarded/ Leased")) return { label: "Occupied", kind: "occupied", count: matches.length };
  const active = matches.filter((t) => ["Inquired", "Pending Requirements", "Under Evaluation"].includes(t.status)).length;
  if (active > 0) return { label: `${active} Active Inquir${active === 1 ? "y" : "ies"}`, kind: "active", count: matches.length, active };
  return { label: "Available", kind: "available", count: matches.length };
}

function Badge({ status, styleMap }) {
  const map = styleMap || STATUS_STYLE;
  const s = map[status] || map["Inquired"] || Object.values(map)[0];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-lg border border-t-2 border-stone-200 border-t-amber-700 bg-white p-4">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className={`mt-1.5 font-serif text-2xl font-semibold ${accent || "text-stone-900"}`}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-stone-500">{sub}</p> : null}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-600">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600";

function TenantModal({ initial, onClose, onSave, existingUnitsByProperty }) {
  const [form, setForm] = useState(
    initial || {
      dateInquired: new Date().toISOString().slice(0, 10),
      brand: "", category: CATEGORIES[0], concept: "",
      contact: "", mobile: "", email: "", sqm: "",
      property: "", unit: "", remarks: "", unitViewing: "", foodTasting: "",
      status: "Inquired",
    }
  );
  const [error, setError] = useState("");

  const concepts = CATEGORY_CONCEPTS[form.category] || [];
  const units = existingUnitsByProperty[form.property] || [];

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = () => {
    if (!form.contact.trim()) {
      setError("Enter a contact person before saving.");
      return;
    }
    if (!form.property || !form.unit) {
      setError("Select a property and unit before saving.");
      return;
    }
    onSave({ ...form, id: form.id || uid("T") });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="font-serif text-base font-semibold text-stone-900">
            {initial ? "Edit inquiry" : "New inquiry"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date inquired">
              <input type="date" className={inputCls} value={form.dateInquired} onChange={(e) => set({ dateInquired: e.target.value })} />
            </Field>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={(e) => set({ status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Brand / tenant name">
            <input className={inputCls} placeholder="e.g. Vito's BBQ, or (New Concept: Café)" value={form.brand} onChange={(e) => set({ brand: e.target.value })} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select className={inputCls} value={form.category} onChange={(e) => set({ category: e.target.value, concept: "" })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Concept">
              <select className={inputCls} value={form.concept} onChange={(e) => set({ concept: e.target.value })}>
                <option value="">Select concept</option>
                {concepts.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact person">
              <input className={inputCls} value={form.contact} onChange={(e) => set({ contact: e.target.value })} />
            </Field>
            <Field label="Space requirement">
              <input className={inputCls} placeholder="e.g. 41-60 sq.m" value={form.sqm} onChange={(e) => set({ sqm: e.target.value })} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mobile number">
              <input className={inputCls} value={form.mobile} onChange={(e) => set({ mobile: e.target.value })} />
            </Field>
            <Field label="Email address">
              <input type="email" className={inputCls} value={form.email} onChange={(e) => set({ email: e.target.value })} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Property">
              <select className={inputCls} value={form.property} onChange={(e) => set({ property: e.target.value, unit: "" })}>
                <option value="">Select property</option>
                {PROPERTIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Unit">
              <select className={inputCls} value={form.unit} onChange={(e) => set({ unit: e.target.value })} disabled={!form.property}>
                <option value="">Select unit</option>
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Unit viewing date">
              <input type="date" className={inputCls} value={form.unitViewing} onChange={(e) => set({ unitViewing: e.target.value })} />
            </Field>
            <Field label="Food tasting date">
              <input type="date" className={inputCls} value={form.foodTasting} onChange={(e) => set({ foodTasting: e.target.value })} />
            </Field>
          </div>

          <Field label="Status and remarks">
            <textarea className={inputCls} rows={3} placeholder="Budget, preferred unit, notes..." value={form.remarks} onChange={(e) => set({ remarks: e.target.value })} />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-200 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            Cancel
          </button>
          <button onClick={handleSave} className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800">
            {initial ? "Save changes" : "Add inquiry"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MaintModal({ initial, onClose, onSave, existingUnitsByProperty }) {
  const [form, setForm] = useState(
    initial || {
      property: "", unit: "", issue: "", priority: "Medium", status: "Open",
      reportedDate: new Date().toISOString().slice(0, 10), assignedTo: "", resolvedDate: "", notes: "",
    }
  );
  const [error, setError] = useState("");

  const units = existingUnitsByProperty[form.property] || [];
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = () => {
    if (!form.property) { setError("Select a property before saving."); return; }
    if (!form.issue.trim()) { setError("Describe the issue before saving."); return; }
    onSave({ ...form, id: form.id || uid("M") });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="font-serif text-base font-semibold text-stone-900">
            {initial ? "Edit maintenance request" : "New maintenance request"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Property">
              <select className={inputCls} value={form.property} onChange={(e) => set({ property: e.target.value, unit: "" })}>
                <option value="">Select property</option>
                {PROPERTIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Unit">
              <select className={inputCls} value={form.unit} onChange={(e) => set({ unit: e.target.value })} disabled={!form.property}>
                <option value="">Select unit</option>
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Issue description">
            <textarea className={inputCls} rows={2} placeholder="What's wrong, and where?" value={form.issue} onChange={(e) => set({ issue: e.target.value })} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              <select className={inputCls} value={form.priority} onChange={(e) => set({ priority: e.target.value })}>
                {MAINT_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={(e) => set({ status: e.target.value })}>
                {MAINT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Reported date">
              <input type="date" className={inputCls} value={form.reportedDate} onChange={(e) => set({ reportedDate: e.target.value })} />
            </Field>
            <Field label="Assigned to">
              <input className={inputCls} placeholder="e.g. Building Engineering" value={form.assignedTo} onChange={(e) => set({ assignedTo: e.target.value })} />
            </Field>
          </div>

          <Field label="Resolved date (if applicable)">
            <input type="date" className={inputCls} value={form.resolvedDate} onChange={(e) => set({ resolvedDate: e.target.value })} />
          </Field>

          <Field label="Notes">
            <textarea className={inputCls} rows={3} placeholder="Follow-up notes, contractor details..." value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-200 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            Cancel
          </button>
          <button onClick={handleSave} className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800">
            {initial ? "Save changes" : "Add request"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ListingModal({ listing, isNew, onClose, onSave, existingListings }) {
  const [property, setProperty] = useState(listing.property || "");
  const [unit, setUnit] = useState(listing.unit || "");
  const [floorArea, setFloorArea] = useState(listing.floorArea ?? "");
  const [askingRate, setAskingRate] = useState(listing.askingRate ?? "");
  const [notes, setNotes] = useState(listing.notes ?? "");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (isNew) {
      if (!property) { setError("Select a property."); return; }
      if (!unit.trim()) { setError("Enter a unit name."); return; }
      if (existingListings.some((p) => p.property === property && p.unit.toLowerCase() === unit.trim().toLowerCase())) {
        setError("That property/unit combination already exists.");
        return;
      }
    }
    onSave({
      ...listing,
      id: listing.id || uid("L"),
      property, unit: unit.trim() || unit,
      floorArea: floorArea === "" ? "" : Number(floorArea),
      askingRate: askingRate === "" ? "" : Number(askingRate),
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="font-serif text-base font-semibold text-stone-900">
            {isNew ? "Add listing" : `${listing.property} · ${listing.unit}`}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {isNew && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Property">
                <select className={inputCls} value={property} onChange={(e) => { setProperty(e.target.value); setError(""); }}>
                  <option value="">Select property</option>
                  {PROPERTIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Unit">
                <input className={inputCls} placeholder="e.g. V601" value={unit} onChange={(e) => { setUnit(e.target.value); setError(""); }} />
              </Field>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Floor area (sqm)">
              <input type="number" min="0" className={inputCls} value={floorArea} onChange={(e) => setFloorArea(e.target.value)} />
            </Field>
            <Field label="Asking rate (PHP/sqm)">
              <input type="number" min="0" className={inputCls} value={askingRate} onChange={(e) => setAskingRate(e.target.value)} />
            </Field>
          </div>
          <p className="text-sm text-stone-500">
            Est. monthly rent: <span className="font-medium text-stone-800">
              {floorArea && askingRate ? fmtMoney(Number(floorArea) * Number(askingRate)) : "—"}
            </span>
          </p>
          <Field label="Notes">
            <textarea className={inputCls} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-stone-200 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            Cancel
          </button>
          <button onClick={handleSave} className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800">
            {isNew ? "Add listing" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserModal({ onClose, onSave }) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    setSubmitting(true);
    const result = await onSave({ username, name, role, password, password2 });
    setSubmitting(false);
    if (result && result.error) setError(result.error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="font-serif text-base font-semibold text-stone-900">Add user</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <Field label="Username">
            <input autoFocus className={inputCls} placeholder="e.g. sam" value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} />
          </Field>
          <Field label="Name (optional)">
            <input className={inputCls} placeholder="e.g. Sam Bouteldja" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Role (optional)">
            <input className={inputCls} placeholder="e.g. Leasing Manager" value={role} onChange={(e) => setRole(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Password">
              <input type="password" autoComplete="new-password" className={inputCls} placeholder="Create a password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} />
            </Field>
            <Field label="Confirm password">
              <input type="password" autoComplete="new-password" className={inputCls} placeholder="Re-enter password" value={password2} onChange={(e) => { setPassword2(e.target.value); setError(""); }} />
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-stone-200 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
          >
            Add user
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, body, onCancel, onConfirm, confirmLabel = "Delete" }) {  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="font-serif text-base font-semibold text-stone-900">{title}</h2>
        <p className="mt-2 text-sm text-stone-600">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLoginWithPassword }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Enter a username."); return; }
    if (!password) { setError("Enter a password."); return; }

    setSubmitting(true);
    try {
      const ok = await onLoginWithPassword(name, password);
      if (!ok) setError("Incorrect username or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-amber-700 font-serif text-base text-amber-700">
            P
          </div>
          <div>
            <h1 className="font-serif text-base font-semibold text-stone-900">PLUD</h1>
            <p className="text-xs text-stone-500">Leasing Tracker</p>
          </div>
        </div>

        <p className="mb-5 text-sm text-stone-600">Sign in to view and manage the leasing pipeline.</p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="space-y-4">
          <Field label="Username">
            <input
              autoFocus
              className={inputCls}
              placeholder="e.g. admin"
              autoComplete="username"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              autoComplete="current-password"
              className={inputCls}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="relative mt-6 w-full overflow-hidden rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-90"
        >
          {submitting ? "Signing in" : "Sign in"}
          {submitting && (
            <span className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-white/25">
              <style>{"@keyframes btn-indeterminate{0%{left:-35%;}100%{left:100%;}}"}</style>
              <span
                className="absolute inset-y-0 w-1/3 rounded bg-white"
                style={{ animation: "btn-indeterminate 1.1s ease-in-out infinite" }}
              />
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

export default function PLUDLeasingTracker() {
  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");

  const [editingTenant, setEditingTenant] = useState(null);
  const [showNewTenant, setShowNewTenant] = useState(false);
  const [deletingTenantId, setDeletingTenantId] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [showNewListing, setShowNewListing] = useState(false);

  const [tenantSearch, setTenantSearch] = useState("");
  const [tenantStatusFilter, setTenantStatusFilter] = useState("All");
  const [tenantPropertyFilter, setTenantPropertyFilter] = useState("All");

  const [showNewUser, setShowNewUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const [maintenance, setMaintenance] = useState([]);
  const [editingMaint, setEditingMaint] = useState(null);
  const [showNewMaint, setShowNewMaint] = useState(false);
  const [deletingMaintId, setDeletingMaintId] = useState(null);
  const [maintStatusFilter, setMaintStatusFilter] = useState("All");
  const [maintPropertyFilter, setMaintPropertyFilter] = useState("All");

  const [reportType, setReportType] = useState("pipeline");
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [reportSearch, setReportSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await sessionStore.get(USER_STORAGE_KEY);
        if (cancelled) return;
        if (result && result.value) {
          setUser(JSON.parse(result.value));
        }
      } catch {
        // no stored session; stay logged out
      } finally {
        if (!cancelled) setUserLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLoginWithPassword = useCallback(async (name, password) => {
    try {
      const rows = await sbRequest(`plud_users?username=eq.${encodeURIComponent(name.trim().toLowerCase())}&select=*`);
      const row = rows[0];
      if (!row) return false;
      const hash = await hashPassword(password, row.salt);
      if (hash !== row.password_hash) return false;
      const u = { id: row.id, name: row.username, role: row.role || "" };
      setUser(u);
      try { await sessionStore.set(USER_STORAGE_KEY, JSON.stringify(u)); } catch { /* ignore */ }
      return true;
    } catch (e) {
      console.error("Supabase login failed:", e);
      return false;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setUser(null);
    try {
      await sessionStore.delete(USER_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Tenants, listings, users and maintenance requests live in Supabase so
  // they persist across browsers and devices, and work on the published
  // static site too.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const [tenantRows, listingRows, userRows, maintRows] = await Promise.all([
          sbSelect("plud_tenants"),
          sbSelect("plud_listings"),
          sbRequest("plud_users?select=id,username,name,role,created_at&order=created_at"),
          sbSelect("plud_maintenance"),
        ]);
        if (cancelled) return;
        if (tenantRows.length === 0 && listingRows.length === 0) {
          await Promise.all([
            sbUpsert("plud_tenants", SEED_TENANTS.map(tenantStateToRow)),
            sbUpsert("plud_listings", SEED_LISTINGS.map(listingStateToRow)),
          ]);
          setTenants(SEED_TENANTS);
          setListings(SEED_LISTINGS);
        } else {
          setTenants(tenantRows.map(tenantRowToState));
          setListings(listingRows.map(listingRowToState));
        }
        if (maintRows.length === 0) {
          await sbUpsert("plud_maintenance", SEED_MAINTENANCE.map(maintStateToRow));
          setMaintenance(SEED_MAINTENANCE);
        } else {
          setMaintenance(maintRows.map(maintRowToState));
        }
        setUsers(userRows);
        setSaveError("");
      } catch (e) {
        console.error("Supabase load failed:", e);
        setTenants(SEED_TENANTS);
        setListings(SEED_LISTINGS);
        setMaintenance(SEED_MAINTENANCE);
        setUsers([]);
        setSaveError("Couldn't reach the database — showing local sample data, changes won't be saved.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const addUser = useCallback(async (form) => {
    const username = form.username.trim().toLowerCase();
    if (!username) return { error: "Enter a username." };
    if (!form.password || form.password.length < 4) return { error: "Password must be at least 4 characters." };
    if (form.password !== form.password2) return { error: "Passwords don't match." };
    if (users.some((u) => u.username.toLowerCase() === username)) return { error: "That username is already taken." };

    const salt = randomSalt();
    const passwordHash = await hashPassword(form.password, salt);
    const row = { id: uid("U"), username, salt, password_hash: passwordHash, name: form.name.trim(), role: form.role.trim() };
    try {
      await sbRequest("plud_users", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(row) });
      setUsers((prev) => [...prev, { id: row.id, username, name: row.name, role: row.role, created_at: new Date().toISOString() }]);
      setShowNewUser(false);
      return { error: null };
    } catch (e) {
      console.error("Supabase add user failed:", e);
      return { error: "Couldn't save this user — try again." };
    }
  }, [users]);

  const deleteUser = useCallback(async (id) => {
    const wasSelf = user && user.id === id;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeletingUserId(null);
    try {
      await sbDelete("plud_users", id);
    } catch (e) {
      console.error("Supabase delete user failed:", e);
    }
    if (wasSelf) await handleLogout();
  }, [user, handleLogout]);

  const unitsByProperty = useMemo(() => {
    const map = {};
    listings.forEach((l) => {
      if (!map[l.property]) map[l.property] = [];
      if (!map[l.property].includes(l.unit)) map[l.property].push(l.unit);
    });
    return map;
  }, [listings]);

  const listingsComputed = useMemo(
    () => listings.map((l) => ({ ...l, ...computeListingStatus(keyOf(l.property, l.unit), tenants) })),
    [listings, tenants]
  );

  const saveTenant = useCallback((t) => {
    setTenants((prev) => {
      const exists = prev.some((p) => p.id === t.id);
      return exists ? prev.map((p) => (p.id === t.id ? t : p)) : [t, ...prev];
    });
    setEditingTenant(null);
    setShowNewTenant(false);
    sbUpsert("plud_tenants", [tenantStateToRow(t)])
      .then(() => setSaveError(""))
      .catch((e) => { console.error("Supabase save (tenant) failed:", e); setSaveError("Changes aren't saving to the database right now."); });
  }, []);

  const deleteTenant = useCallback((id) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
    setDeletingTenantId(null);
    sbDelete("plud_tenants", id)
      .then(() => setSaveError(""))
      .catch((e) => { console.error("Supabase delete (tenant) failed:", e); setSaveError("Changes aren't saving to the database right now."); });
  }, []);

  const saveListing = useCallback((l) => {
    setListings((prev) => {
      const exists = prev.some((p) => p.id === l.id);
      return exists ? prev.map((p) => (p.id === l.id ? l : p)) : [...prev, l];
    });
    setEditingListing(null);
    setShowNewListing(false);
    sbUpsert("plud_listings", [listingStateToRow(l)])
      .then(() => setSaveError(""))
      .catch((e) => { console.error("Supabase save (listing) failed:", e); setSaveError("Changes aren't saving to the database right now."); });
  }, []);

  const saveMaint = useCallback((m) => {
    setMaintenance((prev) => {
      const exists = prev.some((p) => p.id === m.id);
      return exists ? prev.map((p) => (p.id === m.id ? m : p)) : [m, ...prev];
    });
    setEditingMaint(null);
    setShowNewMaint(false);
    sbUpsert("plud_maintenance", [maintStateToRow(m)])
      .then(() => setSaveError(""))
      .catch((e) => { console.error("Supabase save (maintenance) failed:", e); setSaveError("Changes aren't saving to the database right now."); });
  }, []);

  const deleteMaint = useCallback((id) => {
    setMaintenance((prev) => prev.filter((m) => m.id !== id));
    setDeletingMaintId(null);
    sbDelete("plud_maintenance", id)
      .then(() => setSaveError(""))
      .catch((e) => { console.error("Supabase delete (maintenance) failed:", e); setSaveError("Changes aren't saving to the database right now."); });
  }, []);

  const stats = useMemo(() => {
    const totalInquiries = tenants.length;
    const awarded = tenants.filter((t) => t.status === "Awarded/ Leased").length;
    const lost = tenants.filter((t) => t.status === "Lost/ Inactive").length;
    const active = totalInquiries - awarded - lost;
    const conversionRate = totalInquiries ? awarded / totalInquiries : 0;

    const totalUnits = listingsComputed.length;
    const available = listingsComputed.filter((l) => l.kind === "available").length;
    const occupied = listingsComputed.filter((l) => l.kind === "occupied").length;
    const occupancyRate = totalUnits ? occupied / totalUnits : 0;

    const byStage = STATUSES.map((s) => ({ stage: s, count: tenants.filter((t) => t.status === s).length }));

    const byProperty = PROPERTIES.filter((p) => listingsComputed.some((l) => l.property === p)).map((p) => {
      const units = listingsComputed.filter((l) => l.property === p);
      const total = units.length;
      const avail = units.filter((l) => l.kind === "available").length;
      const act = units.filter((l) => l.kind === "active").length;
      const occ = units.filter((l) => l.kind === "occupied").length;
      return { property: p, total, available: avail, active: act, occupied: occ, occupancyPct: total ? occ / total : 0 };
    });

    const pipeline = tenants
      .filter((t) => t.status !== "Awarded/ Leased" && t.status !== "Lost/ Inactive")
      .slice()
      .sort((a, b) => (b.dateInquired || "").localeCompare(a.dateInquired || ""))
      .slice(0, 8);

    const todayMs = new Date(new Date().toDateString()).getTime();
    const ACTIVE_STATUSES = ["Inquired", "Pending Requirements", "Under Evaluation"];
    const needsFollowUp = tenants
      .filter((t) => ACTIVE_STATUSES.includes(t.status) && t.dateInquired)
      .map((t) => {
        const inquired = new Date(t.dateInquired + "T00:00:00").getTime();
        const daysWaiting = Math.floor((todayMs - inquired) / 86400000);
        return { ...t, daysWaiting };
      })
      .filter((t) => t.daysWaiting >= 14)
      .sort((a, b) => b.daysWaiting - a.daysWaiting)
      .slice(0, 6);

    const upcoming = [];
    tenants.forEach((t) => {
      [["unitViewing", "Unit viewing"], ["foodTasting", "Food tasting"]].forEach(([field, label]) => {
        const dateStr = t[field];
        if (!dateStr) return;
        const eventMs = new Date(dateStr + "T00:00:00").getTime();
        const daysOut = Math.round((eventMs - todayMs) / 86400000);
        if (daysOut >= 0 && daysOut <= 7) upcoming.push({ tenant: t, label, dateStr, daysOut });
      });
    });
    upcoming.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    const maintOpen = maintenance.filter((m) => m.status === "Open").length;
    const maintInProgress = maintenance.filter((m) => m.status === "In Progress").length;
    const maintUrgent = maintenance.filter((m) => (m.status === "Open" || m.status === "In Progress") && m.priority === "Urgent").length;
    const maintNeedsAttention = maintenance
      .filter((m) => m.status === "Open" || m.status === "In Progress")
      .map((m) => {
        const dMs = m.reportedDate ? new Date(m.reportedDate + "T00:00:00").getTime() : todayMs;
        const daysOpen = Math.max(0, Math.floor((todayMs - dMs) / 86400000));
        return { ...m, daysOpen };
      })
      .sort((a, b) => {
        const rank = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
        if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
        return b.daysOpen - a.daysOpen;
      })
      .slice(0, 6);

    return {
      totalInquiries, awarded, lost, active, conversionRate,
      totalUnits, available, occupied, occupancyRate,
      byStage, byProperty, pipeline, needsFollowUp, upcoming: upcoming.slice(0, 6),
      maintTotal: maintenance.length, maintOpen, maintInProgress, maintUrgent, maintNeedsAttention,
    };
  }, [tenants, listingsComputed, maintenance]);

  const filteredTenants = useMemo(() => {
    return tenants
      .filter((t) => (tenantStatusFilter === "All" ? true : t.status === tenantStatusFilter))
      .filter((t) => (tenantPropertyFilter === "All" ? true : t.property === tenantPropertyFilter))
      .filter((t) => {
        if (!tenantSearch.trim()) return true;
        const q = tenantSearch.toLowerCase();
        return [t.brand, t.contact, t.concept, t.property, t.unit, t.email].some((v) => (v || "").toLowerCase().includes(q));
      })
      .slice()
      .sort((a, b) => (b.dateInquired || "").localeCompare(a.dateInquired || ""));
  }, [tenants, tenantStatusFilter, tenantPropertyFilter, tenantSearch]);

  const filteredMaintenance = useMemo(() => {
    return maintenance
      .filter((m) => (maintStatusFilter === "All" ? true : m.status === maintStatusFilter))
      .filter((m) => (maintPropertyFilter === "All" ? true : m.property === maintPropertyFilter))
      .slice()
      .sort((a, b) => (b.reportedDate || "").localeCompare(a.reportedDate || ""));
  }, [maintenance, maintStatusFilter, maintPropertyFilter]);

  const inReportDateRange = useCallback((dateStr) => {
    if (!reportFrom && !reportTo) return true;
    if (!dateStr) return false;
    if (reportFrom && dateStr < reportFrom) return false;
    if (reportTo && dateStr > reportTo) return false;
    return true;
  }, [reportFrom, reportTo]);

  const matchesReportSearch = useCallback((fields) => {
    if (!reportSearch.trim()) return true;
    const q = reportSearch.toLowerCase();
    return fields.some((v) => (v || "").toString().toLowerCase().includes(q));
  }, [reportSearch]);

  const reportPipelineRows = useMemo(() => {
    return tenants
      .filter((t) => inReportDateRange(t.dateInquired))
      .filter((t) => matchesReportSearch([t.brand, t.concept, t.contact, t.property, t.unit, t.email, t.category, t.status]))
      .slice()
      .sort((a, b) => (b.dateInquired || "").localeCompare(a.dateInquired || ""));
  }, [tenants, inReportDateRange, matchesReportSearch]);

  const reportMaintenanceRows = useMemo(() => {
    return maintenance
      .filter((m) => inReportDateRange(m.reportedDate))
      .filter((m) => matchesReportSearch([m.issue, m.property, m.unit, m.assignedTo, m.priority, m.status, m.notes]))
      .slice()
      .sort((a, b) => (b.reportedDate || "").localeCompare(a.reportedDate || ""));
  }, [maintenance, inReportDateRange, matchesReportSearch]);

  const reportOccupancyRows = useMemo(() => {
    return listingsComputed
      .filter((l) => inReportDateRange(l.createdAt))
      .filter((l) => matchesReportSearch([l.property, l.unit, l.label, l.notes]));
  }, [listingsComputed, inReportDateRange, matchesReportSearch]);

  const exportReportCsv = useCallback(() => {
    if (reportType === "pipeline") {
      const header = ["Date inquired", "Brand/tenant", "Category", "Concept", "Property", "Unit", "Contact", "Mobile", "Email", "Status", "Remarks"];
      const data = reportPipelineRows.map((t) => [t.dateInquired, t.brand, t.category, t.concept, t.property, t.unit, t.contact, t.mobile, t.email, t.status, t.remarks]);
      downloadCsv("plud-leasing-pipeline.csv", [header, ...data]);
    } else if (reportType === "maintenance") {
      const header = ["Reported date", "Property", "Unit", "Issue", "Priority", "Status", "Assigned to", "Resolved date", "Notes"];
      const data = reportMaintenanceRows.map((m) => [m.reportedDate, m.property, m.unit, m.issue, m.priority, m.status, m.assignedTo, m.resolvedDate, m.notes]);
      downloadCsv("plud-maintenance.csv", [header, ...data]);
    } else {
      const header = ["Property", "Unit", "Floor area (sqm)", "Asking rate (PHP/sqm)", "Est. monthly rent", "Status", "Active inquiries"];
      const data = reportOccupancyRows.map((l) => [
        l.property, l.unit, l.floorArea, l.askingRate,
        l.floorArea && l.askingRate ? Number(l.floorArea) * Number(l.askingRate) : "",
        l.label, l.count,
      ]);
      downloadCsv("plud-occupancy.csv", [header, ...data]);
    }
  }, [reportType, reportPipelineRows, reportMaintenanceRows, reportOccupancyRows]);

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-amber-700" size={28} />
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        onLoginWithPassword={handleLoginWithPassword}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-amber-700" size={28} />
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tenants", label: "Prospective tenants", icon: Users },
    { id: "listings", label: "PLUD listings", icon: Building2 },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900">
      <style>{"@media print{.no-print{display:none !important;}}"}</style>
      <aside className="no-print flex w-64 shrink-0 flex-col bg-slate-900">
        <div className="flex items-center gap-2.5 border-b border-slate-800 px-5 py-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-amber-500 font-serif text-sm text-amber-500">
            P
          </div>
          <div>
            <h1 className="font-serif text-base font-semibold leading-tight text-stone-100">PLUD</h1>
            <p className="text-xs text-slate-400">Leasing Tracker</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-4">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex w-full items-center gap-2.5 rounded-md border-l-4 px-3 py-2.5 text-left text-sm font-medium transition ${
                tab === id
                  ? "border-amber-500 bg-slate-800 text-stone-100"
                  : "border-transparent text-slate-400 hover:bg-slate-800 hover:text-stone-100"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-800 px-4 py-4">
          <div className="mb-3 min-w-0">
            <p className="truncate text-sm font-medium text-stone-100">{user.name}</p>
            {user.role ? <p className="truncate text-xs text-slate-400">{user.role}</p> : null}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {saveError && (
          <div className="no-print flex items-center gap-1.5 border-b border-amber-200 bg-amber-50 px-6 py-2 text-xs text-amber-700">
            <AlertCircle size={14} /> {saveError}
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-lg font-semibold text-stone-900">Dashboard</h1>
              <p className="text-sm text-stone-500">Pipeline health and listings inventory at a glance.</p>
            </div>

            <section>
              <h2 className="mb-3 font-serif text-sm font-semibold text-stone-900">Leasing pipeline</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Total inquiries" value={stats.totalInquiries} />
                <StatCard label="Active pipeline" value={stats.active} accent="text-blue-700" />
                <StatCard label="Awarded / leased" value={stats.awarded} accent="text-emerald-700" />
                <StatCard label="Conversion rate" value={`${Math.round(stats.conversionRate * 100)}%`} sub={`${stats.awarded} of ${stats.totalInquiries} inquiries`} />
              </div>
            </section>

            <section>
              <h2 className="mb-3 font-serif text-sm font-semibold text-stone-900">Listings inventory</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Total units" value={stats.totalUnits} />
                <StatCard label="Available" value={stats.available} accent="text-emerald-700" />
                <StatCard label="Occupied" value={stats.occupied} accent="text-stone-900" />
                <StatCard label="Occupancy rate" value={`${Math.round(stats.occupancyRate * 100)}%`} />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="rounded-lg border border-stone-200 bg-white p-4">
                <h2 className="mb-3 font-serif text-sm font-semibold text-stone-900">Pipeline by stage</h2>
                <div className="space-y-2.5">
                  {stats.byStage.map(({ stage, count }) => {
                    const max = Math.max(1, ...stats.byStage.map((s) => s.count));
                    const s = STATUS_STYLE[stage];
                    return (
                      <div key={stage} className="flex items-center gap-3">
                        <span className="w-40 shrink-0 text-xs text-stone-600">{stage}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                          <div className={`h-full rounded-full ${s.dot}`} style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                        <span className="w-6 shrink-0 text-right text-xs font-medium text-stone-700">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-lg border border-stone-200 bg-white p-4">
                <h2 className="mb-3 font-serif text-sm font-semibold text-stone-900">Occupancy by property</h2>
                <div className="space-y-3">
                  {stats.byProperty.map((p) => (
                    <div key={p.property}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-700">{p.property}</span>
                        <span className="text-stone-500">{p.occupied}/{p.total} occupied · {p.available} avail.</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                        <div className="h-full rounded-full bg-amber-700" style={{ width: `${Math.round(p.occupancyPct * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="rounded-lg border border-stone-200 bg-white p-4">
                <h2 className="mb-3 font-serif text-sm font-semibold text-stone-900">Needs follow-up</h2>
                {stats.needsFollowUp.length === 0 ? (
                  <p className="py-6 text-center text-sm text-stone-500">Nothing stale — every active inquiry has moved in the last two weeks.</p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {stats.needsFollowUp.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setEditingTenant(t)}
                        className="flex w-full items-center justify-between gap-4 py-2.5 text-left hover:bg-stone-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-stone-900">{t.brand || t.concept || "(no brand/concept yet)"}</p>
                          <p className="mt-0.5 truncate text-xs text-stone-500">{t.property}{t.unit ? ` · ${t.unit}` : ""} · {t.contact}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                          {t.daysWaiting}d waiting
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-stone-200 bg-white p-4">
                <h2 className="mb-3 font-serif text-sm font-semibold text-stone-900">Upcoming this week</h2>
                {stats.upcoming.length === 0 ? (
                  <p className="py-6 text-center text-sm text-stone-500">No viewings or tastings scheduled in the next 7 days.</p>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {stats.upcoming.map((u, i) => (
                      <button
                        key={i}
                        onClick={() => setEditingTenant(u.tenant)}
                        className="flex w-full items-center justify-between gap-4 py-2.5 text-left hover:bg-stone-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-stone-900">{u.tenant.brand || u.tenant.concept || "(no brand/concept yet)"}</p>
                          <p className="mt-0.5 truncate text-xs text-stone-500">{u.label} · {u.tenant.property}{u.tenant.unit ? ` · ${u.tenant.unit}` : ""}</p>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-stone-700">
                          {u.daysOut === 0 ? "Today" : u.daysOut === 1 ? "Tomorrow" : fmtDate(u.dateStr)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section>
              <h2 className="mb-3 font-serif text-sm font-semibold text-stone-900">Maintenance</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Total requests" value={stats.maintTotal} />
                <StatCard label="Open" value={stats.maintOpen} accent="text-rose-700" />
                <StatCard label="In progress" value={stats.maintInProgress} accent="text-blue-700" />
                <StatCard label="Urgent priority" value={stats.maintUrgent} accent="text-rose-700" />
              </div>
            </section>

            <section className="rounded-lg border border-stone-200 bg-white p-4">
              <h2 className="mb-3 font-serif text-sm font-semibold text-stone-900">Needs attention (maintenance)</h2>
              {stats.maintNeedsAttention.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-500">No open or in-progress maintenance requests.</p>
              ) : (
                <div className="divide-y divide-stone-100">
                  {stats.maintNeedsAttention.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setTab("maintenance"); setEditingMaint(m); }}
                      className="flex w-full items-center justify-between gap-4 py-2.5 text-left hover:bg-stone-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-stone-900">{m.issue || "(no description)"}</p>
                        <p className="mt-0.5 truncate text-xs text-stone-500">
                          {m.property}{m.unit ? ` · ${m.unit}` : ""} · {m.daysOpen}d open
                        </p>
                      </div>
                      <Badge status={m.priority} styleMap={MAINT_PRIORITY_STYLE} />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-lg border border-stone-200 bg-white p-4">
              <h2 className="mb-3 font-serif text-sm font-semibold text-stone-900">Active pipeline, most recent first</h2>
              {stats.pipeline.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-500">No active inquiries right now.</p>
              ) : (
                <div className="divide-y divide-stone-100">
                  {stats.pipeline.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setEditingTenant(t)}
                      className="flex w-full items-center justify-between gap-4 py-3 text-left hover:bg-stone-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-stone-900">{t.brand || t.concept || "(no brand/concept yet)"}</p>
                        <p className="mt-0.5 truncate text-xs text-stone-500">
                          {t.property}{t.unit ? ` · ${t.unit}` : ""} · {t.contact} · {fmtDate(t.dateInquired)}
                        </p>
                      </div>
                      <Badge status={t.status} />
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {tab === "tenants" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  className={`${inputCls} pl-9`}
                  placeholder="Search brand, contact, unit..."
                  value={tenantSearch}
                  onChange={(e) => setTenantSearch(e.target.value)}
                />
              </div>
              <select className={`${inputCls} w-auto`} value={tenantStatusFilter} onChange={(e) => setTenantStatusFilter(e.target.value)}>
                <option value="All">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className={`${inputCls} w-auto`} value={tenantPropertyFilter} onChange={(e) => setTenantPropertyFilter(e.target.value)}>
                <option value="All">All properties</option>
                {PROPERTIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <button
                onClick={() => setShowNewTenant(true)}
                className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-amber-800"
              >
                <Plus size={16} /> New inquiry
              </button>
            </div>

            {filteredTenants.length === 0 ? (
              <div className="rounded-lg border border-dashed border-stone-300 bg-white py-14 text-center">
                <p className="text-sm font-medium text-stone-700">No inquiries match these filters.</p>
                <p className="mt-1 text-xs text-stone-500">Try clearing search or filters, or add a new inquiry.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="border-b border-stone-200 text-xs font-semibold text-stone-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Brand / tenant</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Property / unit</th>
                        <th className="px-4 py-3 font-medium">Contact</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredTenants.map((t) => (
                        <tr key={t.id} className="hover:bg-stone-50">
                          <td className="whitespace-nowrap px-4 py-3 text-stone-600">{fmtDate(t.dateInquired)}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-stone-900">{t.brand || t.concept || "(no brand/concept yet)"}</p>
                            <p className="text-xs text-stone-500">{t.concept}</p>
                          </td>
                          <td className="px-4 py-3 text-stone-600">{t.category}</td>
                          <td className="px-4 py-3 text-stone-600">{t.property}{t.unit ? ` · ${t.unit}` : ""}</td>
                          <td className="px-4 py-3">
                            <p className="text-stone-800">{t.contact}</p>
                            <p className="text-xs text-stone-500">{t.mobile}</p>
                          </td>
                          <td className="px-4 py-3"><Badge status={t.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setEditingTenant(t)} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-amber-700" aria-label="Edit">
                                <Pencil size={15} />
                              </button>
                              <button onClick={() => setDeletingTenantId(t.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-rose-600" aria-label="Delete">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "listings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowNewListing(true)}
                className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800"
              >
                <Plus size={16} /> Add listing
              </button>
            </div>
            {PROPERTIES.filter((p) => listingsComputed.some((l) => l.property === p)).map((property) => (
              <section key={property}>
                <h2 className="mb-2 flex items-center gap-2 font-serif text-sm font-semibold text-stone-900">
                  <MapPin size={14} className="text-amber-700" /> {property}
                </h2>
                <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                      <thead className="border-b border-stone-200 text-xs font-semibold text-stone-600">
                        <tr>
                          <th className="px-4 py-3 font-medium">Unit</th>
                          <th className="px-4 py-3 font-medium">Floor area</th>
                          <th className="px-4 py-3 font-medium">Asking rate</th>
                          <th className="px-4 py-3 font-medium">Est. monthly rent</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium text-right">Inquiries</th>
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {listingsComputed.filter((l) => l.property === property).map((l) => (
                          <tr key={l.id} className="hover:bg-stone-50">
                            <td className="px-4 py-3 font-medium text-stone-900">{l.unit}</td>
                            <td className="px-4 py-3 text-stone-600">{l.floorArea ? `${l.floorArea} sqm` : "—"}</td>
                            <td className="px-4 py-3 text-stone-600">{l.askingRate ? `₱${Number(l.askingRate).toLocaleString()}/sqm` : "—"}</td>
                            <td className="px-4 py-3 text-stone-600">
                              {l.floorArea && l.askingRate ? fmtMoney(Number(l.floorArea) * Number(l.askingRate)) : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                l.kind === "available" ? "bg-emerald-100 text-emerald-800" :
                                l.kind === "occupied" ? "bg-stone-200 text-stone-700" :
                                "bg-amber-100 text-amber-800"
                              }`}>
                                {l.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-stone-600">
                              {l.count > 0 ? (
                                <button
                                  onClick={() => {
                                    setTab("tenants");
                                    setTenantPropertyFilter(l.property);
                                    setTenantStatusFilter("All");
                                    setTenantSearch(l.unit);
                                  }}
                                  className="font-semibold text-amber-700 underline decoration-1 underline-offset-2 hover:text-amber-800"
                                >
                                  {l.count}
                                </button>
                              ) : (
                                <span className="text-stone-400">0</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {(!l.floorArea && !l.askingRate) ? (
                                <button
                                  onClick={() => setEditingListing(l)}
                                  className="inline-flex items-center gap-1 rounded-md border border-amber-700 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                                >
                                  <Plus size={13} /> Add details
                                </button>
                              ) : (
                                <button onClick={() => setEditingListing(l)} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-amber-700" aria-label="Edit">
                                  <Pencil size={15} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
        {tab === "maintenance" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <select className={`${inputCls} w-auto`} value={maintStatusFilter} onChange={(e) => setMaintStatusFilter(e.target.value)}>
                <option value="All">All statuses</option>
                {MAINT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className={`${inputCls} w-auto`} value={maintPropertyFilter} onChange={(e) => setMaintPropertyFilter(e.target.value)}>
                <option value="All">All properties</option>
                {PROPERTIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="flex-1" />
              <button
                onClick={() => setShowNewMaint(true)}
                className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800"
              >
                <Plus size={16} /> New request
              </button>
            </div>

            {filteredMaintenance.length === 0 ? (
              <div className="rounded-lg border border-dashed border-stone-300 bg-white px-4 py-14 text-center">
                <p className="text-sm font-medium text-stone-700">No maintenance requests match these filters.</p>
                <p className="mt-1 text-xs text-stone-500">Try clearing filters, or log a new request.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-stone-200 text-xs font-semibold text-stone-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Reported</th>
                        <th className="px-4 py-3 font-medium">Property / unit</th>
                        <th className="px-4 py-3 font-medium">Issue</th>
                        <th className="px-4 py-3 font-medium">Priority</th>
                        <th className="px-4 py-3 font-medium">Assigned to</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredMaintenance.map((m) => (
                        <tr key={m.id} className="hover:bg-stone-50">
                          <td className="whitespace-nowrap px-4 py-3 text-stone-600">{fmtDate(m.reportedDate)}</td>
                          <td className="px-4 py-3 text-stone-600">{m.property}{m.unit ? ` · ${m.unit}` : ""}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-stone-900">{m.issue || "(no description)"}</p>
                            {m.resolvedDate && <p className="text-xs text-stone-500">Resolved {fmtDate(m.resolvedDate)}</p>}
                          </td>
                          <td className="px-4 py-3"><Badge status={m.priority} styleMap={MAINT_PRIORITY_STYLE} /></td>
                          <td className="px-4 py-3 text-stone-600">{m.assignedTo || "—"}</td>
                          <td className="px-4 py-3"><Badge status={m.status} styleMap={MAINT_STATUS_STYLE} /></td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setEditingMaint(m)} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-amber-700" aria-label="Edit">
                                <Pencil size={15} />
                              </button>
                              <button onClick={() => setDeletingMaintId(m.id)} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-rose-600" aria-label="Delete">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        {tab === "reports" && (
          <div>
            <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-serif text-lg font-semibold text-stone-900">Reports</h1>
                <p className="text-sm text-stone-500">Export or print a snapshot of your leasing, occupancy, or maintenance data.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
                  <Printer size={16} /> Print
                </button>
                <button onClick={exportReportCsv} className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800">
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>

            <div className="no-print mb-4 flex flex-wrap gap-1.5">
              {REPORT_TYPES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setReportType(r.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                    reportType === r.id ? "border-amber-700 bg-amber-700 text-white" : "border-stone-300 bg-white text-stone-600"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="no-print mb-4 flex flex-wrap items-center gap-4">
              <div className="relative min-w-[200px] flex-1">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  className={`${inputCls} pl-9`}
                  placeholder="Search this report..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-stone-600">
                From
                <input type="date" className={`${inputCls} w-auto`} value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} />
              </label>
              <label className="flex items-center gap-2 text-xs text-stone-600">
                To
                <input type="date" className={`${inputCls} w-auto`} value={reportTo} onChange={(e) => setReportTo(e.target.value)} />
              </label>
            </div>

            {reportType === "pipeline" && (
              <>
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Total inquiries" value={reportPipelineRows.length} />
                  <StatCard
                    label="Active"
                    value={reportPipelineRows.length - reportPipelineRows.filter((r) => r.status === "Awarded/ Leased" || r.status === "Lost/ Inactive").length}
                    accent="text-blue-700"
                  />
                  <StatCard label="Awarded / leased" value={reportPipelineRows.filter((r) => r.status === "Awarded/ Leased").length} accent="text-emerald-700" />
                  <StatCard label="Lost / inactive" value={reportPipelineRows.filter((r) => r.status === "Lost/ Inactive").length} accent="text-rose-700" />
                </div>
                <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-stone-200 text-xs font-semibold text-stone-600">
                        <tr>
                          <th className="px-4 py-3 font-medium">Date</th>
                          <th className="px-4 py-3 font-medium">Brand / tenant</th>
                          <th className="px-4 py-3 font-medium">Category</th>
                          <th className="px-4 py-3 font-medium">Property / unit</th>
                          <th className="px-4 py-3 font-medium">Contact</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {reportPipelineRows.length === 0 ? (
                          <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-stone-500">No records in this date range.</td></tr>
                        ) : reportPipelineRows.map((t) => (
                          <tr key={t.id} className="hover:bg-stone-50">
                            <td className="whitespace-nowrap px-4 py-3 text-stone-600">{fmtDate(t.dateInquired)}</td>
                            <td className="px-4 py-3 text-stone-900">{t.brand || t.concept || "(no brand/concept yet)"}</td>
                            <td className="px-4 py-3 text-stone-600">{t.category}</td>
                            <td className="px-4 py-3 text-stone-600">{t.property}{t.unit ? ` · ${t.unit}` : ""}</td>
                            <td className="px-4 py-3 text-stone-600">{t.contact}</td>
                            <td className="px-4 py-3"><Badge status={t.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {reportType === "maintenance" && (
              <>
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Total requests" value={reportMaintenanceRows.length} />
                  <StatCard
                    label="Open / in progress"
                    value={reportMaintenanceRows.filter((r) => r.status === "Open" || r.status === "In Progress").length}
                    accent="text-blue-700"
                  />
                  <StatCard label="Resolved" value={reportMaintenanceRows.filter((r) => r.status === "Resolved").length} accent="text-emerald-700" />
                  <StatCard label="Urgent priority" value={reportMaintenanceRows.filter((r) => r.priority === "Urgent").length} accent="text-rose-700" />
                </div>
                <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-stone-200 text-xs font-semibold text-stone-600">
                        <tr>
                          <th className="px-4 py-3 font-medium">Reported</th>
                          <th className="px-4 py-3 font-medium">Property / unit</th>
                          <th className="px-4 py-3 font-medium">Issue</th>
                          <th className="px-4 py-3 font-medium">Priority</th>
                          <th className="px-4 py-3 font-medium">Assigned to</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {reportMaintenanceRows.length === 0 ? (
                          <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-stone-500">No records in this date range.</td></tr>
                        ) : reportMaintenanceRows.map((m) => (
                          <tr key={m.id} className="hover:bg-stone-50">
                            <td className="whitespace-nowrap px-4 py-3 text-stone-600">{fmtDate(m.reportedDate)}</td>
                            <td className="px-4 py-3 text-stone-600">{m.property}{m.unit ? ` · ${m.unit}` : ""}</td>
                            <td className="px-4 py-3 text-stone-900">{m.issue}</td>
                            <td className="px-4 py-3"><Badge status={m.priority} styleMap={MAINT_PRIORITY_STYLE} /></td>
                            <td className="px-4 py-3 text-stone-600">{m.assignedTo || "—"}</td>
                            <td className="px-4 py-3"><Badge status={m.status} styleMap={MAINT_STATUS_STYLE} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {reportType === "occupancy" && (
              <>
                <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Total units" value={reportOccupancyRows.length} />
                  <StatCard label="Available" value={reportOccupancyRows.filter((r) => r.kind === "available").length} accent="text-emerald-700" />
                  <StatCard label="Occupied" value={reportOccupancyRows.filter((r) => r.kind === "occupied").length} />
                  <StatCard
                    label="Occupancy rate"
                    value={`${reportOccupancyRows.length ? Math.round((reportOccupancyRows.filter((r) => r.kind === "occupied").length / reportOccupancyRows.length) * 100) : 0}%`}
                  />
                </div>
                <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-stone-200 text-xs font-semibold text-stone-600">
                        <tr>
                          <th className="px-4 py-3 font-medium">Property</th>
                          <th className="px-4 py-3 font-medium">Unit</th>
                          <th className="px-4 py-3 font-medium">Floor area</th>
                          <th className="px-4 py-3 font-medium">Asking rate</th>
                          <th className="px-4 py-3 font-medium">Est. monthly rent</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {reportOccupancyRows.map((l) => (
                          <tr key={l.id} className="hover:bg-stone-50">
                            <td className="px-4 py-3 text-stone-900">{l.property}</td>
                            <td className="px-4 py-3 text-stone-600">{l.unit}</td>
                            <td className="px-4 py-3 text-stone-600">{l.floorArea ? `${l.floorArea} sqm` : "—"}</td>
                            <td className="px-4 py-3 text-stone-600">{l.askingRate ? `₱${Number(l.askingRate).toLocaleString()}/sqm` : "—"}</td>
                            <td className="px-4 py-3 text-stone-600">{l.floorArea && l.askingRate ? fmtMoney(Number(l.floorArea) * Number(l.askingRate)) : "—"}</td>
                            <td className="px-4 py-3 text-stone-600">{l.label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {tab === "settings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="font-serif text-lg font-semibold text-stone-900">Settings</h1>
                <p className="text-sm text-stone-500">Manage who can sign in to this tracker.</p>
              </div>
              <button
                onClick={() => setShowNewUser(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800"
              >
                <Plus size={16} /> Add user
              </button>
            </div>

            <section className="rounded-lg border border-stone-200 bg-white p-4">
              <h2 className="mb-3 font-serif text-sm font-semibold text-stone-900">Quick actions</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowNewTenant(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  <Plus size={16} /> Add tenant
                </button>
                <button
                  onClick={() => setShowNewListing(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  <Plus size={16} /> Add listing
                </button>
              </div>
              <p className="mt-2.5 text-xs text-stone-500">Opens the same forms used on the Prospective tenants and PLUD listings tabs.</p>
            </section>

            <section className="rounded-lg border border-stone-200 bg-white p-4">
              <h2 className="mb-3 font-serif text-sm font-semibold text-stone-900">Users</h2>
              {users.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-500">No users found.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-stone-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-stone-200 text-xs font-semibold text-stone-600">
                        <tr>
                          <th className="px-4 py-3 font-medium">Username</th>
                          <th className="px-4 py-3 font-medium">Name</th>
                          <th className="px-4 py-3 font-medium">Role</th>
                          <th className="px-4 py-3 font-medium">Added</th>
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-stone-50">
                            <td className="px-4 py-3 font-medium text-stone-900">{u.username}</td>
                            <td className="px-4 py-3 text-stone-600">{u.name || "—"}</td>
                            <td className="px-4 py-3 text-stone-600">{u.role || "—"}</td>
                            <td className="px-4 py-3 text-stone-600">{fmtDate(u.created_at ? u.created_at.slice(0, 10) : "")}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => setDeletingUserId(u.id)}
                                disabled={users.length <= 1}
                                title={users.length <= 1 ? "At least one user must remain" : undefined}
                                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-rose-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-stone-400"
                                aria-label="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
        </main>
      </div>

      {(showNewTenant || editingTenant) && (
        <TenantModal
          initial={editingTenant}
          onClose={() => { setEditingTenant(null); setShowNewTenant(false); }}
          onSave={saveTenant}
          existingUnitsByProperty={unitsByProperty}
        />
      )}

      {(editingListing || showNewListing) && (
        <ListingModal
          listing={editingListing || { property: "", unit: "", floorArea: "", askingRate: "", notes: "" }}
          isNew={showNewListing}
          existingListings={listings}
          onClose={() => { setEditingListing(null); setShowNewListing(false); }}
          onSave={saveListing}
        />
      )}

      {deletingTenantId && (
        <ConfirmDialog
          title="Delete this inquiry?"
          body="This removes the tenant inquiry permanently. This can't be undone."
          onCancel={() => setDeletingTenantId(null)}
          onConfirm={() => deleteTenant(deletingTenantId)}
        />
      )}

      {showNewUser && (
        <UserModal onClose={() => setShowNewUser(false)} onSave={addUser} />
      )}

      {deletingUserId && (
        <ConfirmDialog
          title="Remove this user?"
          body="They won't be able to sign in anymore. This can't be undone."
          confirmLabel="Remove"
          onCancel={() => setDeletingUserId(null)}
          onConfirm={() => deleteUser(deletingUserId)}
        />
      )}

      {(showNewMaint || editingMaint) && (
        <MaintModal
          initial={editingMaint}
          onClose={() => { setEditingMaint(null); setShowNewMaint(false); }}
          onSave={saveMaint}
          existingUnitsByProperty={unitsByProperty}
        />
      )}

      {deletingMaintId && (
        <ConfirmDialog
          title="Delete this request?"
          body="This removes the maintenance record permanently. This can't be undone."
          onCancel={() => setDeletingMaintId(null)}
          onConfirm={() => deleteMaint(deletingMaintId)}
        />
      )}
    </div>
  );
}
