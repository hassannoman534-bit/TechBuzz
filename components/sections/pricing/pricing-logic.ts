import type { PricingContent } from "./pricing.config";

/** Package slot key: one package can be picked per service sub tab ("serviceIndex-subIndex") */
export const slotKey = (si: number, bi: number): string => `${si}-${bi}`;
/** Add-on key: "serviceIndex-subIndex-groupIndex-itemIndex" */
export const addonKey = (si: number, bi: number, ci: number, ai: number): string => `${si}-${bi}-${ci}-${ai}`;

export type PricingState = {
  /** slot key -> picked package index */
  picked: Record<string, number>;
  /** slot keys in the order they were first picked (drives the bundle discount) */
  order: string[];
  /** add-on key -> quantity */
  qty: Record<string, number>;
};

export const emptyState: PricingState = { picked: {}, order: [], qty: {} };

export type PricingAction =
  | { type: "toggle"; key: string; index: number }
  | { type: "qty"; key: string; delta: number }
  | { type: "remove"; key: string; kind: "pkg" | "addon" }
  | { type: "reset" };

export function pricingReducer(state: PricingState, action: PricingAction): PricingState {
  switch (action.type) {
    case "toggle": {
      const { key, index } = action;
      if (state.picked[key] === index) {
        const picked = { ...state.picked };
        delete picked[key];
        return { ...state, picked, order: state.order.filter((k) => k !== key) };
      }
      return {
        ...state,
        picked: { ...state.picked, [key]: index },
        order: state.order.includes(key) ? state.order : [...state.order, key],
      };
    }
    case "qty": {
      const next = Math.max(0, (state.qty[action.key] ?? 0) + action.delta);
      const qty = { ...state.qty };
      if (next === 0) delete qty[action.key];
      else qty[action.key] = next;
      return { ...state, qty };
    }
    case "remove":
      if (action.kind === "addon") {
        const qty = { ...state.qty };
        delete qty[action.key];
        return { ...state, qty };
      }
      return pricingReducer(state, { type: "toggle", key: action.key, index: state.picked[action.key] });
    case "reset":
      return emptyState;
  }
}

/** Discount for the package in this pick position: 1st 0%, 2nd tier1 (20%), 3rd and later tier2 (50%) */
export function discountForIndex(idx: number, d: PricingContent["discount"]): number {
  if (idx <= 0) return 0;
  if (idx === 1) return d.tier1;
  return d.tier2;
}

export type CartItem = {
  key: string;
  kind: "pkg" | "addon";
  name: string;
  /** null = custom quote */
  price: number | null;
  /** original price when discounted */
  original: number | null;
  discount: number;
  qty?: number;
};

export type CartSummary = {
  items: CartItem[];
  total: number;
  savings: number;
  beforeDiscount: number;
  hasCustom: boolean;
};

/** Label for a picked slot, e.g. "YouTube › Long Videos: Explore" (same format as the current site) */
export function planLabel(content: PricingContent, key: string, pkgIndex: number): string {
  const [si, bi] = key.split("-").map(Number);
  const svc = content.services[si];
  const sub = svc.subs[bi];
  return `${svc.label}${svc.subs.length > 1 ? ` › ${sub.label}` : ""}: ${sub.pkgs[pkgIndex].name}`;
}

/** Same maths as the current site: packages discounted by pick order, add-ons at full price. */
export function buildCart(content: PricingContent, state: PricingState): CartSummary {
  const items: CartItem[] = [];
  let total = 0;
  let savings = 0;
  let hasCustom = false;

  state.order.forEach((key, idx) => {
    const pi = state.picked[key];
    if (pi === undefined) return;
    const [si, bi] = key.split("-").map(Number);
    const pkg = content.services[si].subs[bi].pkgs[pi];
    const name = planLabel(content, key, pi);
    if (pkg.price === null) {
      hasCustom = true;
      items.push({ key, kind: "pkg", name, price: null, original: null, discount: 0 });
      return;
    }
    const discount = discountForIndex(idx, content.discount);
    const price = discount > 0 ? Math.round(pkg.price * (1 - discount)) : pkg.price;
    savings += pkg.price - price;
    total += price;
    items.push({ key, kind: "pkg", name, price, original: discount > 0 ? pkg.price : null, discount });
  });

  content.services.forEach((svc, si) =>
    svc.subs.forEach((sub, bi) =>
      sub.addons.forEach((group, ci) =>
        group.items.forEach((a, ai) => {
          const key = addonKey(si, bi, ci, ai);
          const q = state.qty[key] ?? 0;
          if (q <= 0) return;
          total += q * a.price;
          items.push({ key, kind: "addon", name: `${a.name} ×${q}`, price: q * a.price, original: null, discount: 0, qty: q });
        }),
      ),
    ),
  );

  return { items, total, savings, beforeDiscount: total + savings, hasCustom };
}

export const money = (n: number): string => `$${n.toLocaleString("en-US")}`;
