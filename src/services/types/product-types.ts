/**
 * Based on the data models from PRODUCTS_API_INTEGRATION_GUID.md
 */

export type ProductContentBlock = {
  general?: Record<string, string>;
  specifications?: Array<{ name: string; value: string }>;
  shipping?: Array<{ method: string; time: string; cost: string }>;
  [key: string]: any;
};

export type ProductSkuAttribute = {
  type: 'select' | 'color' | 'image';
  name?: string;
  value?: string;
  variation_value_id?: number;
  hex_color?: string;
  hexColor?: string;
  image?: File | string;
};

export type ProductSkuWarehouse = {
  warehouse_id: number;
  on_hand: number;
  reserved: number;
  reorder_point: number;
  restock_level: number;
  track_inventory: boolean;
};

export type ProductSkuPackageDetails = {
  mass_unit?: string;
  weight?: number | string;
  distance_unit?: string;
  height?: number | string;
  length?: number | string;
  width?: number | string;
};

export type ProductSkuInventory = {
  warehouses: ProductSkuWarehouse[];
};

export type ProductSku = {
  id?: number;
  code: string;
  price: number | string;
  inventory?: number | ProductSkuInventory;
  package_details?: ProductSkuPackageDetails;
  attributes: ProductSkuAttribute[];
};

/**
 * 2.1 Product (abbreviated in List)
 */
export type ProductListItem = {
  id: number;
  name: string;
  image: string; // Main image URL
  description: string;
  content?: ProductContentBlock | null;
  label?: string | null;
  video?: string | null;
  moq: number;
  rating: number | null;
  price_type: 'range' | 'tiered' | 'sku';
  is_active: boolean;
  unit: string; // e.g., "set"
  inventory: number;
  is_rts: boolean; // ready-to-ship
  shown_price: string; // e.g., "9201.00 - 11065.00", display-ready
  reviews_count: number;
  skus_count: number;
  category: { id: number; name: string; icon?: string; image?: string };
  created_at: string;
  updated_at: string;
};

/**
 * 2.2 Product (full detail in Show)
 */
export type ProductDetail = ProductListItem & {
  rangePrices?: { minPrice: string; maxPrice: string };
  skus: ProductSku[];
  tieredPrices: Array<{
    min_quantity?: number;
    minQuantity?: number;
    price: number | string;
  }>;
  media: Array<{ id: number; name: string; url: string; type: string }>;
};
