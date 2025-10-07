---
title: Default module
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# Product Management – Company Products API (Aligned with Frontend)

Base URL namespace: `/api/v1/company/products`

Authentication:

- HTTP Bearer token in `Authorization: Bearer <token>`

## GET List Products

GET `/api/v1/company/products`

Query params (optional):

- `page`: number
- `q`: string (search)
- `sort`: string

Response body (simplified):

```json
{
  "data": [
    {
      "id": 1,
      "name": "...",
      "image": "https://...",
      "description": "...",
      "moq": 10,
      "rating": 4.5,
      "price_type": "range|tiered|sku",
      "is_active": true,
      "unit": "set",
      "inventory": 250,
      "is_rts": false,
      "shown_price": "9201.00 - 11065.00",
      "reviews_count": 12,
      "skus_count": 3,
      "category": { "id": 32, "name": "..." },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-02T00:00:00Z"
    }
  ]
}
```

## GET Show Product

GET `/api/v1/company/products/{id}`

Response body (simplified):

```json
{
  "id": 1,
  "name": "...",
  "description": "...",
  "moq": 10,
  "unit": "set",
  "price_type": "range|tiered|sku",
  "is_active": true,
  "category": { "id": 32, "name": "..." },
  "shown_price": "...",
  "rangePrices": { "minPrice": "100.00", "maxPrice": "350.00" },
  "tieredPrices": [{ "min_quantity": 30, "price": 100 }],
  "skus": [
    {
      "id": 2,
      "code": "SKU_2313",
      "price": "5120.00",
      "inventory": 110,
      "attributes": [
        { "type": "select", "name": "Size", "value": "L" },
        { "type": "color", "hexColor": "#FB5467" }
      ]
    }
  ],
  "media": [ { "id": 12, "name": "img1", "url": "https://...", "type": "image" } ]
}
```

## POST Create Product

POST `/api/v1/company/products`

Content-Type: `multipart/form-data`

Body fields (FormData keys):

- `product[name]`: string (required)
- `product[description]`: string (required)
- `product[moq]`: number (required)
- `product[product_unit_id]`: number (required)
- `product[price_type]`: `range|tiered|sku` (required)
- `product[is_active]`: `1|0` (required)
- `product[category_id]`: number (required)
- `product[content]` as JSON string OR expand nested arrays using:
  - `product[content][general][key]`
  - `product[content][specifications][i][name|value]`
  - `product[content][shipping][i][method|time|cost|description]`
  - `product[content][features][i]`, `product[content][whatsIncluded][i]`, `product[content][targetMarkets][i]`, `product[content][qualityAssurance][i]`
- Pricing by type:
  - range: `range_price[min_price]`, `range_price[max_price]`
  - tiered: `tiered_prices[i][min_quantity]`, `tiered_prices[i][price]`
  - sku: `skus[i][code]`, `skus[i][price]`, inventory by warehouses and attributes:
    - `skus[i][inventory][warehouses][j][warehouse_id|on_hand|reserved|reorder_point|restock_level|track_inventory]`
    - `skus[i][attributes][k][type]` with `type=select|color|image`
    - `skus[i][attributes][k][variation_value_id]` (required)
    - `skus[i][attributes][k][hex_color]` if `type=color`
    - `skus[i][attributes][k][image]` (File) if `type=image`
- Media uploads: `media[]` (File) — at least one file is required.

Validation notes:

- If `price_type=range`, both `min_price` and `max_price` are required and `max > min`.
- If `price_type=tiered`, provide one or more tiers.
- If `price_type=sku`, provide one or more `skus[]` each with inventory and attributes.
- Missing media returns 422 (backend may enforce this).

## PUT Update Product

PUT `/api/v1/company/products/{id}`

Content-Type: `multipart/form-data`

Body fields mirror Create with additional controls:

- If sending as FormData to a Laravel backend that expects PUT, support method override: `_method=PUT`.
- `media[remove][]`: IDs to remove
- `media[]`: new files to add
- `skus[add][]`: new SKUs (same shape as Create)
- `skus[remove][]`: array of SKU IDs to delete
- `skus[modify][i][id]` plus changed fields
- Pricing fields according to `price_type` as above

## DELETE Delete Product

DELETE `/api/v1/company/products/{id}`

Responses:

- 200: `{ "message": "Product deleted successfully" }`
- 404: `{ "message": "Record not found." }`
- 500: `{ "error": "Failed to delete product" }` — handle gracefully and allow retry.

---

Notes for UI flows (@products list and @new form):

- The list view uses `GET /v1/company/products` with `q` for search and displays `shown_price`, `is_active`, and `category`.
- The new/edit form submits `multipart/form-data` using the field names above; when editing, it appends `_method=PUT` with POST if the server requires it.
- Media: users must add at least one file on create; on edit, `media[remove][]` marks existing media for deletion.
- Pricing UI switches between range, tiered, and SKU managers and enforces required fields per type.


