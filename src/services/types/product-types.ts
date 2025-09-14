/**
 * Based on the data models from PRODUCTS_API_INTEGRATION_GUID.md
 */

/**
 * 2.1 Product (abbreviated in List)
 */
export type ProductListItem = {
  id: number;
  name: string;
  image: string; // Main image URL
  description: string;
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
  skus: Array<{
    id: number;
    code: string;
    price: string;
    inventory: number; // Aggregated or from nested structures
    attributes: Array<{
      type: 'select' | 'color' | 'image';
      name?: string;
      value?: string;
      hexColor?: string;
    }>;
  }>;
  tieredPrices: Array<{ min_quantity: number; price: number }>;
  media: Array<{ id: number; name: string; url: string; type: string }>;
};
