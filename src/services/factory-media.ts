import apiClient from "@/lib/axios"

export interface FactoryImage {
  id: number | string
  file_name: string
  size?: number
  human_readable_size?: string
  url: string
  type?: string
}

export class FactoryMediaService {
  static async list(): Promise<FactoryImage[]> {
    const res = await apiClient.get("/v1/company/factory", { params: { _t: Date.now() } })
    // API may return an array directly
    return Array.isArray(res.data) ? res.data : res.data?.data || []
  }

  /**
   * Generic update operation for factory media. Accepts files to add and/or ids to remove.
   */
  static async update(
    params: { add?: File[]; remove?: Array<number | string> },
    options?: { onUploadProgress?: (e: any) => void; signal?: AbortSignal }
  ): Promise<FactoryImage[]> {
    const fd = new FormData()
    if (params.add && params.add.length) {
      params.add.forEach((f) => fd.append("media[add][]", f))
    }
    if (params.remove && params.remove.length) {
      params.remove.forEach((id) => fd.append("media[remove][]", String(id)))
    }

    const res = await apiClient.post("/v1/company/factory", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      // Large image uploads can exceed the default client timeout
      timeout: 120000, // 120s
      // These are ignored by XHR but safe to set for Node adapters
      maxBodyLength: Infinity as any,
      maxContentLength: Infinity as any,
      onUploadProgress: options?.onUploadProgress,
      signal: options?.signal as any,
    })

    const data = res.data
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    return []
  }

  static async upload(files: File[]): Promise<FactoryImage[]> {
    return this.update({ add: files })
  }

  static async remove(ids: Array<number | string>): Promise<FactoryImage[]> {
    return this.update({ remove: ids })
  }
}

export const factoryMediaApi = {
  list: FactoryMediaService.list,
  upload: FactoryMediaService.upload,
  remove: FactoryMediaService.remove,
  update: FactoryMediaService.update,
}
