import apiClient from "@/lib/axios"

export interface CertificateItem {
  id: string | number
  name?: string
  issuer?: string
  issue_date?: string
  expiry_date?: string
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
  certificate_type_id: string | number
  issued_at: string // YYYY-MM-DD
  expires_at: string // YYYY-MM-DD
  documents: File[]
}

export class CertificatesService {
  static async list(page = 1): Promise<PaginatedResponse<CertificateItem>> {
    const res = await apiClient.get("/v1/company/certificates", { params: { page } })
    const body = res.data
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
    fd.set("certificate_type_id", String(payload.certificate_type_id))
    fd.set("issued_at", payload.issued_at)
    fd.set("expires_at", payload.expires_at)
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
