import apiClient from "@/lib/axios";

const BASE_URL = "/v1/categories";

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface CategoryResponse {
  data: Category[];
}

/**
 * List Root Categories
 */
export const listRootCategories = async (): Promise<CategoryResponse> => {
  const response = await apiClient.get(BASE_URL);
  return response.data;
};

/**
 * List Category Children
 */
export const listCategoryChildren = async (parentId: number): Promise<CategoryResponse> => {
  const response = await apiClient.get(`${BASE_URL}/${parentId}/children`);
  return response.data;
};

/**
 * Get Featured Categories
 */
export const getFeaturedCategories = async (): Promise<CategoryResponse> => {
  const response = await apiClient.get(`${BASE_URL}/featured`);
  return response.data;
};

/**
 * Get Nested Categories (full tree)
 */
export const getNestedCategories = async (): Promise<CategoryResponse> => {
  const response = await apiClient.get(`${BASE_URL}/nested`);
  return response.data;
};

