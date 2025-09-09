Supplier Onboarding & Product Management — API Integration Guide

This file is meant for your AI integration agent. It documents each endpoint you’ll hit during the supplier onboarding (profile, factory images, certificates, first product) and the product management flow.
Replace {{API_BASE}} with your base URL (e.g., https://test.hgallerycandles.com/api/v1).
Unless noted, requests expect a valid company auth session (cookie) or Bearer token.

Conventions

Base URL: {{API_BASE}}

Auth: send cookies (credentials: 'include') or Authorization: Bearer <token>

Formats: JSON unless the endpoint explicitly requires multipart/form-data

Method override: some update endpoints accept POST with _method=PUT

fetch (JS)

await fetch(`${API_BASE}/company/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include'
});


Response (typical)

200 with session cookie and/or JSON payload (may include company info).

2) Company Profile

Note: In the current collection there is no explicit GET endpoint for fetching the company profile. If your backend exposes one later (e.g., GET /company/profile or /me), call it to prefill. For now, only update is documented.

POST /company/update (with _method=PUT)

Update company profile (logo + contacts). multipart/form-data.

Body (multipart)

_method: PUT (string, required)

logo: (file, optional)

contacts[0][id]: string/int (include when updating a specific row)

contacts[0][phone]: string

contacts[0][email]: string
(Repeat contacts[n][...] for multiple rows)

..etc of company details

cURL

curl -X POST "{{API_BASE}}/company/update" \
  -H "Accept: application/json" \
  -F "_method=PUT" \
  -F "logo=@./logo.png" \
  -F "contacts[0][id]=11" \
  -F "contacts[0][phone]=+20 123456789" \
  -F "contacts[0][email]=ops@example.com" \
  -b cookie.txt -c cookie.txt


fetch (JS)

const fd = new FormData();
fd.set('_method', 'PUT');
if (logoFile) fd.set('logo', logoFile);
contacts.forEach((c,i) => {
  if (c.id)    fd.set(`contacts[${i}][id]`, String(c.id));
  if (c.phone) fd.set(`contacts[${i}][phone]`, c.phone);
  if (c.email) fd.set(`contacts[${i}][email]`, c.email);
});

await fetch(`${API_BASE}/company/update`, {
  method: 'POST',
  body: fd,
  credentials: 'include'
});


Response

200 JSON (updated company object) or 204 no-content (varies by backend)

4xx on validation errors

3) Factory Images (Company Media)
GET /company/factory

List existing factory images.

cURL

curl "{{API_BASE}}/company/factory" -H "Accept: application/json" -b cookie.txt


fetch (JS)

const res = await fetch(`${API_BASE}/company/factory`, { credentials: 'include' });
const data = await res.json();
// data is typically an array of images


Response (example)

[
  {
    "id": 101,
    "file_name": "img1.jpg",
    "size": 123456,
    "human_readable_size": "120KB",
    "url": "https://cdn/.../img1.jpg",
    "type": "image/jpeg"
  }
]

POST /company/factory

Upload one or more factory images. multipart/form-data.

Body (multipart)

files[]: image files (repeatable)

cURL

curl -X POST "{{API_BASE}}/company/factory" \
  -F "files[]=@./factory-1.jpg" \
  -F "files[]=@./factory-2.jpg" \
  -b cookie.txt -c cookie.txt


fetch (JS)

const fd = new FormData();
files.forEach(f => fd.append('files[]', f));
await fetch(`${API_BASE}/company/factory`, {
  method: 'POST',
  body: fd,
  credentials: 'include'
});


Response

201 with uploaded media objects

4) Certificates
GET /company/certificates

List certificates.

cURL

curl "{{API_BASE}}/company/certificates" -H "Accept: application/json" -b cookie.txt


fetch (JS)

const res = await fetch(`${API_BASE}/company/certificates`, { credentials: 'include' });
const { data } = await res.json();


Response (example)

{
  "data": [
    {
      "id": "cert_1",
      "name": "ISO 9001",
      "issuer": "ISO",
      "issue_date": "2024-01-10",
      "expiry_date": "2027-01-10",
      "file_url": "https://cdn/cert_1.pdf"
    }
  ]
}

GET /company/certificates/{id}

Show a single certificate.

cURL

curl "{{API_BASE}}/company/certificates/123" -H "Accept: application/json" -b cookie.txt


fetch (JS)

const res = await fetch(`${API_BASE}/company/certificates/${id}`, { credentials: 'include' });
const { data } = await res.json();

POST /company/certificates

Create/add a certificate. multipart/form-data.

Body (multipart)

certificate_type_id: string/int (required)

issued_at: YYYY-MM-DD

expires_at: YYYY-MM-DD

documents[]: one or more files (pdf, doc/x, xls/x, ppt/x, txt, csv, rtf, odt)

cURL

curl -X POST "{{API_BASE}}/company/certificates" \
  -F "certificate_type_id=1" \
  -F "issued_at=2025-05-01" \
  -F "expires_at=2027-05-01" \
  -F "documents[]=@./iso-9001.pdf" \
  -b cookie.txt -c cookie.txt


fetch (JS)

const fd = new FormData();
fd.set('certificate_type_id', String(typeId));
fd.set('issued_at', issuedAt);
fd.set('expires_at', expiresAt);
docs.forEach(d => fd.append('documents[]', d));

await fetch(`${API_BASE}/company/certificates`, {
  method: 'POST',
  body: fd,
  credentials: 'include'
});

5) Product Management (Company)
GET /company/products

List products (may be paginated depending on backend).

cURL

curl "{{API_BASE}}/company/products" -H "Accept: application/json" -b cookie.txt


fetch (JS)

const res = await fetch(`${API_BASE}/company/products`, { credentials: 'include' });
const data = await res.json();

GET /company/products/{id}

Show a product.

cURL

curl "{{API_BASE}}/company/products/101" -H "Accept: application/json" -b cookie.txt


fetch (JS)

const res = await fetch(`${API_BASE}/company/products/${id}`, { credentials: 'include' });
const { data } = await res.json();

POST /company/products

Create a product.
Supports multiple pricing models and optional media. If you need to attach images on create, use multipart (payload + files). If not, send JSON.

A) JSON-Only Create

Body (JSON)

{
  "product": {
    "name": "Cotton T-Shirt",
    "description": "Premium 180gsm cotton tee",
    "moq": 10,
    "product_unit_id": 9,
    "price_type": "sku",              // "sku" | "range" | "tiered"
    "is_active": true,
    "category_id": 32
  },
  "skus": [
    {
      "code": "TSHIRT-BLACK-L",
      "price": 1599,
      "inventory": {
        "warehouses": [
          {
            "warehouse_id": 31,
            "on_hand": 250,
            "reserved": 12,
            "reorder_point": 20,
            "restock_level": 50,
            "track_inventory": true
          }
        ]
      }
    }
  ],
  "attributes": [
    { "type": "select", "variation_value_id": 8 },
    { "type": "color",  "variation_value_id": 7, "hex_color": "#000000" }
  ]
}


cURL

curl -X POST "{{API_BASE}}/company/products" \
  -H "Content-Type: application/json" \
  -d @payload.json \
  -b cookie.txt -c cookie.txt


fetch (JS)

await fetch(`${API_BASE}/company/products`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
  credentials: 'include'
});

B) Multipart Create (with images)

Body (multipart)

payload: stringified JSON of the body above (excluding file blobs)

media[]: product image files (repeatable)

(If any attribute uses type="image") also send attribute_images[] in the same order you expect to map

cURL

curl -X POST "{{API_BASE}}/company/products" \
  -F 'payload={"product":{"name":"Cotton T-Shirt","price_type":"sku","product_unit_id":9,"category_id":32},"skus":[{"code":"TSHIRT-BLACK-L","price":1599}]};type=application/json' \
  -F "media[]=@./p1.jpg" \
  -F "media[]=@./p2.jpg" \
  -b cookie.txt -c cookie.txt


fetch (JS)

const fd = new FormData();
fd.set('payload', JSON.stringify(payload));
mediaFiles.forEach(f => fd.append('media[]', f));
attrImageFiles.forEach(f => fd.append('attribute_images[]', f));

await fetch(`${API_BASE}/company/products`, {
  method: 'POST',
  body: fd,
  credentials: 'include'
});


Response (example)

{
  "message": "created",
  "data": {
    "id": "p_101",
    "name": "Cotton T-Shirt",
    "price_type": "sku",
    "skus": [
      { "id": "sku_1", "code": "TSHIRT-BLACK-L", "price": 1599 }
    ]
  }
}

PUT /company/products/{id}

Update a product (JSON). If you need to add images during update, prefer multipart with the same payload + files pattern used for create.

cURL (JSON)

curl -X PUT "{{API_BASE}}/company/products/101" \
  -H "Content-Type: application/json" \
  -d '{"product":{"name":"Cotton T-Shirt (Updated)","price_type":"sku","product_unit_id":9,"category_id":32}}' \
  -b cookie.txt -c cookie.txt


fetch (JS)

await fetch(`${API_BASE}/company/products/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
  credentials: 'include'
});

DELETE /company/products/{id}

Delete a product.

cURL

curl -X DELETE "{{API_BASE}}/company/products/101" -b cookie.txt -c cookie.txt


fetch (JS)

await fetch(`${API_BASE}/company/products/${id}`, {
  method: 'DELETE',
  credentials: 'include'
});

6) Reference Data (for Product Forms)

Used to populate selects during product creation. Endpoints exist in your collection; below are the ones that are explicitly visible.

GET /admin/units

List units (e.g., box, piece).

cURL

curl "{{API_BASE}}/admin/units" -H "Accept: application/json" -b cookie.txt

GET /admin/variations

List variations (e.g., Color, Size).
(Variation values are available under the “Variations Values” subfolder in your collection.)

cURL

curl "{{API_BASE}}/admin/variations" -H "Accept: application/json" -b cookie.txt


Note: Also check your Company → Inventory → Warehouses and Categories folders to wire warehouse and category selectors (paths may vary in your collection).

7) Validation & Business Rules (enforce client-side)

Profile update: must send _method=PUT in multipart form.

Certificates: issued_at / expires_at format is YYYY-MM-DD. documents[] allows many doc types (pdf/doc/xls/ppt/txt/csv/rtf/odt).

Products:

price_type="sku" → require skus[] (each with code, price; optional inventory by warehouse).

price_type="range" or tiered (if present in your backend) → send respective fields; hide mutually exclusive sections in UI.

Attributes:

type="color" → require hex_color.

type="select" → require variation_value_id.

type="image" → upload a file (via multipart).

Inventory per SKU (optional): warehouses[] with warehouse_id, on_hand, reserved, reorder_point, restock_level, track_inventory.

8) Error Handling (pattern)

422 / 400 → parse JSON and map field-level errors to your forms.

401 / 403 → show session/permission errors, redirect to sign-in if needed.

5xx → toast + retry UI.

Example handler (JS)

async function handle(res) {
  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    const body = ct.includes('application/json') ? await res.json() : await res.text();
    throw new Error(typeof body === 'string' ? body : JSON.stringify(body));
  }
  return res.headers.get('content-type')?.includes('application/json') ? res.json() : null;
}