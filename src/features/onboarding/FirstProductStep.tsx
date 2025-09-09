"use client"

import { Button } from "@/components/ui/button"
import { Package, Plus } from "lucide-react"

export default function FirstProductStep() {
  return (
    <div className="text-center space-y-6">
      <div>
        <Package className="h-16 w-16 mx-auto text-orange-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Add Your First Product</h3>
        <p className="text-gray-600 mb-6">Add a clear title, images, and minimum order to start selling</p>
      </div>

      <div className="max-w-md mx-auto">
        <a href="/dashboard/products/new">
          <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700">
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        </a>
        <p className="text-sm text-gray-500 mt-3">This will take you to the product creation page</p>
      </div>
    </div>
  )
}

