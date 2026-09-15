import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Users, Building2, Plus, Pencil, Trash2, X,
  Search, ChevronDown, Phone, Mail, Calendar, MapPin, Check,
  AlertCircle, Loader2, LogOut, Lock,
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

const STORAGE_KEY = "plud-leasing-tracker-data";
const USER_STORAGE_KEY = "plud-leasing-tracker-user";
const ACCOUNT_KEY = "plud-leasing-tracker-account";
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

function Badge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE["Inquired"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold ${accent || "text-stone-900"}`}>{value}</p>
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

const inputCls = "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600";

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
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="text-base font-semibold text-stone-900">
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
          <button onClick={handleSave} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            {initial ? "Save changes" : "Add inquiry"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ListingModal({ listing, onClose, onSave }) {
  const [floorArea, setFloorArea] = useState(listing.floorArea ?? "");
  const [askingRate, setAskingRate] = useState(listing.askingRate ?? "");
  const [notes, setNotes] = useState(listing.notes ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="text-base font-semibold text-stone-900">{listing.property} · {listing.unit}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
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
          <button
            onClick={() => onSave({ ...listing, floorArea: floorArea === "" ? "" : Number(floorArea), askingRate: askingRate === "" ? "" : Number(askingRate), notes })}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, body, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-base font-semibold text-stone-900">{title}</h2>
        <p className="mt-2 text-sm text-stone-600">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ account, onSignup, onLoginWithPassword, onForgotPassword }) {
  const hasAccount = !!account;
  const [name, setName] = useState(hasAccount ? account.name : "");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Enter a username."); return; }
    if (!password) { setError("Enter a password."); return; }

    setSubmitting(true);
    try {
      if (hasAccount) {
        const ok = await onLoginWithPassword(name, password);
        if (!ok) setError("Incorrect username or password.");
      } else {
        if (password.length < 4) { setError("Password must be at least 4 characters."); setSubmitting(false); return; }
        if (password !== password2) { setError("Passwords don't match."); setSubmitting(false); return; }
        await onSignup(name, role, password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
            <Lock size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">PLUD</p>
            <h1 className="text-base font-semibold text-stone-900">Leasing tracker</h1>
          </div>
        </div>

        <p className="mb-5 text-sm text-stone-600">
          {hasAccount ? "Sign in to view and manage the leasing pipeline." : "Create a sign-in for this leasing tracker."}
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="space-y-4">
          <Field label="Username">
            <input
              autoFocus={!hasAccount}
              readOnly={hasAccount}
              className={inputCls}
              placeholder="e.g. sbouteldja"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
            />
          </Field>
          {!hasAccount && (
            <Field label="Role (optional)">
              <input
                className={inputCls}
                placeholder="e.g. Leasing Manager"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </Field>
          )}
          <Field label="Password">
            <input
              autoFocus={hasAccount}
              type="password"
              autoComplete={hasAccount ? "current-password" : "new-password"}
              className={inputCls}
              placeholder={hasAccount ? "Enter your password" : "Create a password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
            />
          </Field>
          {!hasAccount && (
            <Field label="Confirm password">
              <input
                type="password"
                autoComplete="new-password"
                className={inputCls}
                placeholder="Re-enter password"
                value={password2}
                onChange={(e) => { setPassword2(e.target.value); setError(""); }}
              />
            </Field>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {hasAccount ? "Sign in" : "Create account & sign in"}
        </button>
        {hasAccount && (
          <button
            type="button"
            onClick={onForgotPassword}
            className="mt-3 w-full text-center text-xs font-medium text-teal-700 hover:underline"
          >
            Forgot password? Reset sign-in
          </button>
        )}
      </form>
    </div>
  );
}

export default function PLUDLeasingTracker() {
  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");

  const [editingTenant, setEditingTenant] = useState(null);
  const [showNewTenant, setShowNewTenant] = useState(false);
  const [deletingTenantId, setDeletingTenantId] = useState(null);
  const [editingListing, setEditingListing] = useState(null);

  const [tenantSearch, setTenantSearch] = useState("");
  const [tenantStatusFilter, setTenantStatusFilter] = useState("All");
  const [tenantPropertyFilter, setTenantPropertyFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const accRes = await window.storage.get(ACCOUNT_KEY, false);
        if (!cancelled && accRes && accRes.value) setAccount(JSON.parse(accRes.value));
      } catch {
        // no account saved yet
      }
      try {
        const result = await window.storage.get(USER_STORAGE_KEY, false);
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

  const handleSignup = useCallback(async (name, role, password) => {
    const salt = randomSalt();
    const passwordHash = await hashPassword(password, salt);
    const acc = { name: name.trim(), role: (role || "").trim(), salt, passwordHash };
    setAccount(acc);
    try { await window.storage.set(ACCOUNT_KEY, JSON.stringify(acc), false); } catch { /* ignore */ }
    const u = { name: acc.name, role: acc.role };
    setUser(u);
    try { await window.storage.set(USER_STORAGE_KEY, JSON.stringify(u), false); } catch { /* ignore */ }
  }, []);

  const handleLoginWithPassword = useCallback(async (name, password) => {
    if (!account || account.name.toLowerCase() !== name.trim().toLowerCase()) return false;
    const hash = await hashPassword(password, account.salt);
    if (hash !== account.passwordHash) return false;
    const u = { name: account.name, role: account.role };
    setUser(u);
    try { await window.storage.set(USER_STORAGE_KEY, JSON.stringify(u), false); } catch { /* ignore */ }
    return true;
  }, [account]);

  const handleLogout = useCallback(async () => {
    setUser(null);
    try {
      await window.storage.delete(USER_STORAGE_KEY, false);
    } catch {
      // ignore
    }
  }, []);

  const handleForgotPassword = useCallback(async () => {
    if (!window.confirm("This clears your saved sign-in (username + password) but keeps your tenant and listing data. Continue?")) return;
    setAccount(null);
    setUser(null);
    try { await window.storage.delete(ACCOUNT_KEY, false); } catch { /* ignore */ }
    try { await window.storage.delete(USER_STORAGE_KEY, false); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, false);
        if (cancelled) return;
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          setTenants(parsed.tenants || SEED_TENANTS);
          setListings(parsed.listings || SEED_LISTINGS);
        } else {
          setTenants(SEED_TENANTS);
          setListings(SEED_LISTINGS);
        }
      } catch {
        setTenants(SEED_TENANTS);
        setListings(SEED_LISTINGS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(async () => {
      try {
        const res = await window.storage.set(STORAGE_KEY, JSON.stringify({ tenants, listings }), false);
        if (!res) setSaveError("Changes aren't saving right now — they'll stay for this session.");
        else setSaveError("");
      } catch {
        setSaveError("Changes aren't saving right now — they'll stay for this session.");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [tenants, listings, loading]);

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
  }, []);

  const deleteTenant = useCallback((id) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
    setDeletingTenantId(null);
  }, []);

  const saveListing = useCallback((l) => {
    setListings((prev) => prev.map((p) => (p.id === l.id ? l : p)));
    setEditingListing(null);
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

    return {
      totalInquiries, awarded, lost, active, conversionRate,
      totalUnits, available, occupied, occupancyRate,
      byStage, byProperty, pipeline, needsFollowUp, upcoming: upcoming.slice(0, 6),
    };
  }, [tenants, listingsComputed]);

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

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-teal-700" size={28} />
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        account={account}
        onSignup={handleSignup}
        onLoginWithPassword={handleLoginWithPassword}
        onForgotPassword={handleForgotPassword}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-teal-700" size={28} />
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tenants", label: "Prospective tenants", icon: Users },
    { id: "listings", label: "PLUD listings", icon: Building2 },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900">
      <aside className="flex w-64 shrink-0 flex-col border-r border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">PLUD</p>
          <h1 className="text-lg font-semibold text-stone-900">Leasing tracker</h1>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                tab === id ? "bg-teal-700 text-white" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-stone-200 px-4 py-4">
          <div className="mb-3 min-w-0">
            <p className="truncate text-sm font-medium text-stone-900">{user.name}</p>
            {user.role ? <p className="truncate text-xs text-stone-500">{user.role}</p> : null}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {saveError && (
          <div className="flex items-center gap-1.5 border-b border-amber-200 bg-amber-50 px-6 py-2 text-xs text-amber-700">
            <AlertCircle size={14} /> {saveError}
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold text-stone-900">Dashboard</h1>
                <p className="text-sm text-stone-500">Pipeline health and listings inventory at a glance.</p>
              </div>
              <button
                onClick={() => { setShowNewTenant(true); }}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                <Plus size={16} /> New inquiry
              </button>
            </div>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-stone-700">Leasing pipeline</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Total inquiries" value={stats.totalInquiries} />
                <StatCard label="Active pipeline" value={stats.active} accent="text-blue-700" />
                <StatCard label="Awarded / leased" value={stats.awarded} accent="text-emerald-700" />
                <StatCard label="Conversion rate" value={`${Math.round(stats.conversionRate * 100)}%`} sub={`${stats.awarded} of ${stats.totalInquiries} inquiries`} />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-stone-700">Listings inventory</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Total units" value={stats.totalUnits} />
                <StatCard label="Available" value={stats.available} accent="text-emerald-700" />
                <StatCard label="Occupied" value={stats.occupied} accent="text-stone-900" />
                <StatCard label="Occupancy rate" value={`${Math.round(stats.occupancyRate * 100)}%`} />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-stone-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-stone-700">Pipeline by stage</h2>
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

              <section className="rounded-xl border border-stone-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-stone-700">Occupancy by property</h2>
                <div className="space-y-3">
                  {stats.byProperty.map((p) => (
                    <div key={p.property}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-700">{p.property}</span>
                        <span className="text-stone-500">{p.occupied}/{p.total} occupied · {p.available} avail.</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                        <div className="h-full rounded-full bg-teal-700" style={{ width: `${Math.round(p.occupancyPct * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-stone-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-stone-700">Needs follow-up</h2>
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

              <section className="rounded-xl border border-stone-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-stone-700">Upcoming this week</h2>
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

            <section className="rounded-xl border border-stone-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-stone-700">Active pipeline, most recent first</h2>
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
                className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                <Plus size={16} /> New inquiry
              </button>
            </div>

            {filteredTenants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-300 bg-white py-14 text-center">
                <p className="text-sm font-medium text-stone-700">No inquiries match these filters.</p>
                <p className="mt-1 text-xs text-stone-500">Try clearing search or filters, or add a new inquiry.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
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
                              <button onClick={() => setEditingTenant(t)} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-teal-700" aria-label="Edit">
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
            {PROPERTIES.filter((p) => listingsComputed.some((l) => l.property === p)).map((property) => (
              <section key={property}>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-700">
                  <MapPin size={14} className="text-teal-700" /> {property}
                </h2>
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                      <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
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
                            <td className="px-4 py-3 text-right text-stone-600">{l.count}</td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => setEditingListing(l)} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-teal-700" aria-label="Edit">
                                <Pencil size={15} />
                              </button>
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

      {editingListing && (
        <ListingModal listing={editingListing} onClose={() => setEditingListing(null)} onSave={saveListing} />
      )}

      {deletingTenantId && (
        <ConfirmDialog
          title="Delete this inquiry?"
          body="This removes the tenant inquiry permanently. This can't be undone."
          onCancel={() => setDeletingTenantId(null)}
          onConfirm={() => deleteTenant(deletingTenantId)}
        />
      )}
    </div>
  );
}
