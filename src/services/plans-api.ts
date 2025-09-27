import apiClient from "@/lib/axios";

export type PlanFeatureType = "bool" | "int" | "decimal" | "string";

export interface PlanFeature {
  key: string;
  name: string;
  type: PlanFeatureType;
  value_bool?: boolean;
  value_int?: number;
  value_decimal?: number;
  value_string?: string;
}

export interface CompanyPlan {
  id: number | string;
  name: string;
  price: number | string;
  currency?: string;
  period?: string;
  payment_rate?: string; // e.g., yearly, monthly
  duration_in_days?: number | string;
  level?: string;
  badge?: string;
  color?: string;
  popular?: boolean;
  features?: PlanFeature[];
}

export interface PlansListResponse {
  data: CompanyPlan[];
}

export interface CurrentPlanResponse {
  data: {
    id: number | string;
    status: "active" | "expired" | "pending" | string;
    started_at?: string;
    expires_at?: string;
    plan: CompanyPlan;
  };
}

const PLANS_BASE_URL = "/v1/company/plans";

export async function listCompanyPlans(): Promise<CompanyPlan[]> {
  const response = await apiClient.get<PlansListResponse>(PLANS_BASE_URL);
  // Some APIs may return array directly without { data }
  const body: any = response.data as any;
  if (Array.isArray(body)) return body as CompanyPlan[];
  if (Array.isArray(body?.data)) return body.data as CompanyPlan[];
  if (Array.isArray(body?.plans)) return body.plans as CompanyPlan[];
  if (Array.isArray(body?.data?.plans)) return body.data.plans as CompanyPlan[];
  return [] as CompanyPlan[];
}

export async function getCurrentCompanyPlan(): Promise<CurrentPlanResponse["data"]> {
  const response = await apiClient.get<CurrentPlanResponse>(`${PLANS_BASE_URL}/current`);
  const body: any = response.data as any;
  return (body.data ?? body) as CurrentPlanResponse["data"];
}


