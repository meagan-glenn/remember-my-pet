const GELATO_API_BASE = "https://order.gelatoapis.com/v4";

function getApiKey(): string {
  const key = process.env.GELATO_API_KEY;
  if (!key) throw new Error("GELATO_API_KEY is not configured");
  return key;
}

function headers() {
  return {
    "Content-Type": "application/json",
    "X-API-KEY": getApiKey(),
  };
}

// Product UIDs — configure these in env or keep as defaults
// These should be updated with actual Gelato product UIDs from your catalog
export const PRODUCT_UIDS = {
  memory_book: process.env.GELATO_PHOTOBOOK_UID || "photobooks_pf_210x210-mm_pb_hardcover_170-gsm-coated-silk_cl_4-4_bt_glued-left_ct_matt-lamination_prt_1-0_cov_170-gsm-coated-silk_ccl_4-0_cct_matt-lamination",
  canvas_print: process.env.GELATO_CANVAS_UID || "canvas_pf_30x30-cm_pt_canvas_cl_4-0_wr_gallery-wrap_fr_none",
} as const;

export type ProductType = keyof typeof PRODUCT_UIDS;

export interface GelatoShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postCode: string;
  country: string; // ISO 3166-1 alpha-2
  email: string;
  phone?: string;
}

export interface GelatoOrderItem {
  itemReferenceId: string;
  productUid: string;
  files: { type: string; url: string }[];
  quantity: number;
}

export interface GelatoCreateOrderRequest {
  orderType: "order" | "draft";
  orderReferenceId: string;
  customerReferenceId: string;
  currency: string;
  items: GelatoOrderItem[];
  shippingAddress: GelatoShippingAddress;
  shipmentMethodUid?: string;
}

export interface GelatoOrder {
  id: string;
  orderReferenceId: string;
  fulfillmentStatus: string;
  items: { itemReferenceId: string; fulfillmentStatus: string }[];
}

export async function createOrder(
  request: GelatoCreateOrderRequest
): Promise<GelatoOrder> {
  const res = await fetch(`${GELATO_API_BASE}/orders`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gelato API error (${res.status}): ${body}`);
  }

  return res.json();
}

export async function getOrder(orderId: string): Promise<GelatoOrder> {
  const res = await fetch(`${GELATO_API_BASE}/orders/${orderId}`, {
    method: "GET",
    headers: headers(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gelato API error (${res.status}): ${body}`);
  }

  return res.json();
}

export async function createDraftOrder(
  request: Omit<GelatoCreateOrderRequest, "orderType">
): Promise<GelatoOrder> {
  return createOrder({ ...request, orderType: "draft" });
}
