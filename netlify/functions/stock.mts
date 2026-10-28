// Rokn stock + orders — single function, Netlify Blobs storage.
// GET  /api/stock                      → { stock:{id:qty}, updated }
// POST /api/stock {action:'reserve', ref, items:[{id,qty}], customer:{name,phone}}
//                                      → { ok:true, stock } | { ok:false, short:[{id,available}] }
// Admin (header x-admin-token = STOCK_ADMIN_TOKEN):
// POST {action:'set', stock:{id:qty}} | {action:'orders'} | {action:'confirm', ref} | {action:'cancel', ref}
import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

type Stock = Record<string, number>;
type Order = { ref: string; items: { id: string; qty: number }[]; customer?: { name?: string; phone?: string }; total?: number; status: "pending" | "confirmed" | "cancelled"; at: string; updatedAt?: string };

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const store = () => getStore({ name: "rokn-stock", consistency: "strong" });

async function readStock() {
  const r = await store().getWithMetadata("stock", { type: "json" });
  return { stock: ((r?.data as Stock) || {}), etag: r?.etag };
}

async function writeStock(stock: Stock, etag?: string) {
  const opts: any = etag ? { onlyIfMatch: etag } : { onlyIfNew: true };
  const res = await store().setJSON("stock", stock, opts);
  return res.modified;
}

function validItems(items: any): { id: string; qty: number }[] | null {
  if (!Array.isArray(items) || !items.length || items.length > 20) return null;
  const out: { id: string; qty: number }[] = [];
  for (const it of items) {
    const id = String(it?.id || "").replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
    const qty = Math.floor(Number(it?.qty));
    if (!id || !(qty >= 1 && qty <= 50)) return null;
    out.push({ id, qty });
  }
  return out;
}

export default async (req: Request, context: Context) => {
  if (req.method === "GET") {
    const { stock } = await readStock();
    return json({ stock, updated: Date.now() });
  }
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let body: any = {};
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const action = String(body.action || "");
  const token = Netlify.env.get("STOCK_ADMIN_TOKEN") || "";
  const isAdmin = !!token && req.headers.get("x-admin-token") === token;

  // ---------- public: reserve ----------
  if (action === "reserve") {
    const items = validItems(body.items);
    const ref = String(body.ref || "").replace(/[^A-Z0-9-]/g, "").slice(0, 24);
    if (!items || !ref) return json({ error: "bad request" }, 400);
    for (let attempt = 0; attempt < 4; attempt++) {
      const { stock, etag } = await readStock();
      const short = items.filter(it => it.id in stock && stock[it.id] < it.qty).map(it => ({ id: it.id, available: stock[it.id] }));
      if (short.length) return json({ ok: false, short, stock });
      const next = { ...stock };
      for (const it of items) if (it.id in next) next[it.id] -= it.qty; // untracked ids = unlimited
      const modified = await writeStock(next, etag);
      if (modified) {
        const order: Order = { ref, items, customer: { name: String(body.customer?.name || "").slice(0, 80), phone: String(body.customer?.phone || "").slice(0, 20) }, total: Number(body.total) || 0, status: "pending", at: new Date().toISOString() };
        await store().setJSON(`orders/${ref}`, order);
        return json({ ok: true, stock: next });
      }
      await new Promise(r => setTimeout(r, 120 * (attempt + 1)));
    }
    return json({ error: "busy, retry" }, 409);
  }

  // ---------- admin ----------
  if (!isAdmin) return json({ error: "unauthorized" }, 401);

  if (action === "set") {
    const incoming = body.stock || {};
    const { stock, etag } = await readStock();
    const next = { ...stock };
    for (const [k, v] of Object.entries(incoming)) {
      const id = String(k).replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
      if (!id) continue;
      if (v === null || v === "") { delete next[id]; continue; }
      const n = Math.floor(Number(v)); if (!(n >= 0 && n <= 9999)) continue;
      next[id] = n;
    }
    await writeStock(next, etag);
    return json({ ok: true, stock: next });
  }

  if (action === "orders") {
    const { blobs } = await store().list({ prefix: "orders/" });
    const keys = blobs.map(b => b.key).sort().reverse().slice(0, 60);
    const orders = (await Promise.all(keys.map(k => store().get(k, { type: "json" })))).filter(Boolean);
    const { stock } = await readStock();
    return json({ ok: true, orders, stock });
  }

  if (action === "confirm" || action === "cancel") {
    const ref = String(body.ref || "").replace(/[^A-Z0-9-]/g, "").slice(0, 24);
    const order = (await store().get(`orders/${ref}`, { type: "json" })) as Order | null;
    if (!order) return json({ error: "not found" }, 404);
    if (action === "cancel" && order.status !== "cancelled") {
      for (let attempt = 0; attempt < 4; attempt++) {
        const { stock, etag } = await readStock();
        const next = { ...stock };
        for (const it of order.items) if (it.id in next) next[it.id] += it.qty;
        if (await writeStock(next, etag)) break;
        await new Promise(r => setTimeout(r, 120 * (attempt + 1)));
      }
    }
    order.status = action === "confirm" ? "confirmed" : "cancelled";
    order.updatedAt = new Date().toISOString();
    await store().setJSON(`orders/${ref}`, order);
    const { stock } = await readStock();
    return json({ ok: true, order, stock });
  }

  return json({ error: "unknown action" }, 400);
};

export const config: Config = { path: "/api/stock", method: ["GET", "POST"] };
