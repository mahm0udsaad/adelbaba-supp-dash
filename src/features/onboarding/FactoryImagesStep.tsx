"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Camera, Eye, Plus, Trash2 } from "lucide-react"

type FactoryImage = {
  id: string | number
  file_name: string
  url: string
}

type UploadItem = any

type Props = {
  factoryImages: FactoryImage[]
  uploading: UploadItem[]
  loading: boolean
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveOrCancel: (img: any) => Promise<void>
}

export default function FactoryImagesStep({ factoryImages, uploading, loading, onFileInputChange, onRemoveOrCancel }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Factory Images</h3>
        <p className="text-gray-600">Upload authentic production photos to build buyer confidence</p>
      </div>

      {factoryImages.length === 0 && uploading.filter(u => u.status === 'queued' || u.status === 'uploading' || u.status === 'done').length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-orange-400 transition-colors">
          <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No images yet</h4>
          <p className="text-gray-600 mb-4">Add images to showcase your factory and production capabilities</p>
          <Button onClick={() => document.getElementById("factory-upload")?.click()} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Uploading..." : "Add Images"}
          </Button>
          <input
            id="factory-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={onFileInputChange}
            className="hidden"
          />
          <p className="text-sm text-gray-500 mt-4">JPEG/PNG/WebP, ≤ 10 MB each, up to 10 images</p>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">{factoryImages.length} image(s) uploaded</p>
            <Button
              variant="outline"
              onClick={() => document.getElementById("factory-upload")?.click()}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              {loading ? "Uploading..." : "Add More"}
            </Button>
            <input
              id="factory-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={onFileInputChange}
              className="hidden"
            />
          </div>

          {(() => {
            // Build combined list: optimistic uploads first, then remote (avoiding duplicates)
            const optimistic = uploading
              .filter((u: any) => u.status === 'queued' || u.status === 'uploading' || u.status === 'done')
              .map((u: any) => ({
                id: u.id,
                file_name: u.name,
                url: u.previewUrl,
                __temp: true,
                __progress: u.progress,
                __status: u.status,
              }))
            const combined: Array<any> = [...optimistic, ...factoryImages]

            return (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {combined.map((img: any, index: number) => (
                  <div key={String(img.id ?? index)} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={img.url || "/placeholder.svg"}
                        alt={`Factory image ${index + 1}`}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full"
                      />
                      {img.__temp && (img.__status === 'queued' || img.__status === 'uploading') && (
                        <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                          <div className="w-full">
                            <Progress value={img.__progress || 0} className="h-2 [&>div]:bg-orange-600" />
                          </div>
                        </div>
                      )}
                      {img.__temp && img.__status === 'done' && (
                        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded max-w-full truncate">
                      {img.file_name}
                    </div>

                    {/* Remove or Cancel */}
                    <button
                      type="button"
                      title={img.__temp ? 'Cancel upload' : 'Remove image'}
                      onClick={() => onRemoveOrCancel(img)}
                      className="absolute top-2 right-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-black/70 text-white hover:bg-black"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

