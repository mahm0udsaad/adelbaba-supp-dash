import apiClient from "@/lib/axios"

export interface CertificateItem {
  id: string | number
  name?: string
  type?: string
  issuer?: string
  issue_date?: string
  expiry_date?: string
  status?: string
  certificate_number?: string
  scope?: string
  document_url?: string
  verification_url?: string
  applicable_products?: string[]
  description?: string
  file_url?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    path: string
    per_page: number
    to: number | null
    total: number
  }
}

export interface CreateCertificatePayload {
  name?: string
  certificate_type_id: string | number
  issuer?: string
  issued_at: string // YYYY-MM-DD
  expires_at: string // YYYY-MM-DD
  certificate_number?: string
  scope?: string
  verification_url?: string
  applicable_products?: string[]
  description?: string
  documents: File[]
}

export class CertificatesService {
  static async list(page = 1): Promise<PaginatedResponse<CertificateItem>> {
    const res = await apiClient.get("/v1/company/certificates", { params: { page } })
    const body = res.data
    // Handle case where body might be just the array or different structure
    // The JSON says response contains data, links, meta directly
    if (body && body.data) {
        return body
    }
    // Fallback if structure is different or just array
    if (Array.isArray(body)) {
      return {
        data: body,
        links: { first: "", last: "", prev: null, next: null },
        meta: {
          current_page: page,
          from: body.length > 0 ? 1 : 0,
          last_page: 1,
          path: "",
          per_page: body.length,
          to: body.length,
          total: body.length,
        },
      }
    }
    return body as PaginatedResponse<CertificateItem>
  }

  static async get(id: string | number): Promise<CertificateItem | null> {
    const res = await apiClient.get(`/v1/company/certificates/${id}`)
    const body = res.data
    return body?.data || body || null
  }

  static async create(payload: CreateCertificatePayload): Promise<void> {
    const fd = new FormData()
    if (payload.name) fd.set("name", payload.name)
    fd.set("certificate_type_id", String(payload.certificate_type_id))
    if (payload.issuer) fd.set("issuer", payload.issuer)
    fd.set("issued_at", payload.issued_at)
    fd.set("expires_at", payload.expires_at)
    if (payload.certificate_number) fd.set("certificate_number", payload.certificate_number)
    if (payload.scope) fd.set("scope", payload.scope)
    if (payload.verification_url) fd.set("verification_url", payload.verification_url)
    if (payload.description) fd.set("description", payload.description)
    if (payload.applicable_products) {
        // Send as array or comma separated? Usually array for FormData requires repeating key or JSON string
        payload.applicable_products.forEach(p => fd.append("applicable_products[]", p))
    }
    
    payload.documents.forEach((d) => fd.append("documents[]", d))

    await apiClient.post("/v1/company/certificates", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  }
}

export const certificatesApi = {
  list: CertificatesService.list,
  get: CertificatesService.get,
  create: CertificatesService.create,
}
