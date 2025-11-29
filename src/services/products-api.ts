import apiClient from "@/lib/axios";
import { ProductListItem, ProductDetail } from "./types/product-types";

// Based on PRODUCTS_API_INTEGRATION_GUID.md

const BASE_URL = "/v1/company/products";

/**
 * 1) List Products
 * Fetches a paginated list of company products.
 */
export const listProducts = async (params: {
  page?: number;
  q?: string;
  sort?: string;
}): Promise<{ data: ProductListItem[] }> => {
  const response = await apiClient.get(BASE_URL, { params });
  return response.data;
};

/**
 * 2) Show Product
 * Fetches the full details for a single product.
 */
export const getProduct = async (id: number | string): Promise<ProductDetail> => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

/**
 * 3) Create Product
 * Creates a new product.
 * The data should be sent as FormData since it includes files.
 */
export const createProduct = async (productData: FormData): Promise<ProductDetail> => {
  const response = await apiClient.post(BASE_URL, productData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const body = response.data;
  // Some endpoints return { data: {...} }, others may return the product directly.
  return (body?.data ?? body) as ProductDetail;
};

/**
 * 4) Update Product
 * Updates an existing product.
 * Note: The guide specifies PUT, but for sending FormData with file uploads,
 * POST is often used with a _method=PUT field. We'll use a function that
 * constructs FormData correctly.
 */
export const updateProduct = async (id: number | string, productData: FormData): Promise<ProductDetail> => {
  // The API might expect POST with a _method field for FormData, a common Laravel pattern.
  productData.append("_method", "PUT");
  const response = await apiClient.post(`${BASE_URL}/${id}`, productData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};


/**
 * 5) Delete Product
 * Deletes a product by its ID.
 */
export const deleteProduct = async (id: number | string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};

/**
 * 6) List All Products (non-paginated)
 * Useful for dropdowns/selections
 */
export const listAllProducts = async (): Promise<{ data: ProductListItem[] }> => {
  const response = await apiClient.get(`${BASE_URL}/all`);
  return response.data;
};

/**
 * 7) List Product SKUs
 * Get all SKUs for a specific product
 */
export const listProductSkus = async (id: number | string): Promise<{ data: any[] }> => {
  const response = await apiClient.get(`${BASE_URL}/all/${id}`);
  return response.data;
};
