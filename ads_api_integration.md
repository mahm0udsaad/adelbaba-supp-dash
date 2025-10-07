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

# Default module

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer

# Company/Ads

## GET List Ads

GET /api/v1/company/ads

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|per_page|query|string| no |default = 15|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## POST Create Ad

POST /api/v1/company/ads

> Body Parameters

```json
"{\n    // The type of advertisement: must be either \"banner\" or \"product\"\n    \"ad_type\": \"product\", // banner || product\n    \"ad\": {\n        \"title\": \"Summer Sale Banner\",\n\n        // Banner-specific\n        \"banner_type\": \"banner\", // banner || slideshow\n        \"banner_location\": \"header\", // header || footer\n        \"target_url\": \"https://example.com/sale\",\n\n        \"starts_at\": \"2025-10-01\", // must be today or later\n        \"ends_at\": \"2025-12-31\", // must be after starts_at\n\n        \"budget_type\": \"daily\", // daily || monthly\n        \"budget_amount\": 100.00,\n\n        // Array of at least 3 keywords to target\n        \"target_keywords\": [\n            \"summer\",\n            \"sale\",\n            \"discount\"\n        ],\n        // Product-specific: required if ad_type is \"product\"\n        \"product_id\": 1\n    },\n\n    // Array of image files for the banner (required if ad_type is \"banner\")\n    // Each file should be an image, max 5MB (5120 KB)\n    \"media\": [\n        /* file upload: banner1.jpg */ ,\n        /* file upload: banner2.png */\n    ]\n}"
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| no |none|

> Response Examples

> 201 Response

```json
{
  "message": "Ad created successfully.",
  "ad": {
    "id": 55,
    "title": "Summer Sale Banner",
    "status": "pending",
    "banner_type": "banner",
    "banner_location": "header",
    "target_url": "https://example.com/sale",
    "starts_at": "2025-10-01T00:00:00.000000Z",
    "ends_at": "2025-12-31T00:00:00.000000Z",
    "budget_type": "daily",
    "budget_amount": "100.00",
    "spent_amount": "0.00",
    "target_keywords": [
      "summer",
      "sale",
      "discount"
    ],
    "target_id": 1,
    "target_type": "products",
    "created_at": "2025-09-29T14:11:09.000000Z",
    "updated_at": "2025-09-29T14:11:09.000000Z",
    "ctr": 0,
    "daily_budget": 3.33,
    "days_remaining": 1.7939814814814815e-9,
    "is_active": false,
    "remaining_budget": 100,
    "clicks_count": null,
    "impressions_count": null,
    "media": []
  }
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|none|Inline|

### Responses Data Schema

HTTP Status Code **201**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» message|string|true|none||none|
|» ad|object|true|none||none|
|»» id|integer|true|none||none|
|»» title|string|true|none||none|
|»» status|string|true|none||none|
|»» banner_type|string|true|none||none|
|»» banner_location|string|true|none||none|
|»» target_url|string|true|none||none|
|»» starts_at|string|true|none||none|
|»» ends_at|string|true|none||none|
|»» budget_type|string|true|none||none|
|»» budget_amount|string|true|none||none|
|»» spent_amount|string|true|none||none|
|»» target_keywords|[string]|true|none||none|
|»» target_id|integer|true|none||none|
|»» target_type|string|true|none||none|
|»» created_at|string|true|none||none|
|»» updated_at|string|true|none||none|
|»» ctr|integer|true|none||none|
|»» daily_budget|number|true|none||none|
|»» days_remaining|number|true|none||none|
|»» is_active|boolean|true|none||none|
|»» remaining_budget|integer|true|none||none|
|»» clicks_count|null|true|none||none|
|»» impressions_count|null|true|none||none|
|»» media|[string]|true|none||none|

## GET Show Ad Details

GET /api/v1/company/ads/39

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
| data;   final Links? links;   final Meta? meta;    AdsResponse({this.data, this.links, this.meta});    factory AdsResponse.fromJson(Map<String, dynamic> json) |query|string| no |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## DELETE Delete Pending Ad

DELETE /api/v1/company/ads/{id}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|string| yes |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## POST Export Ads

POST /api/v1/company/ads/export

> Body Parameters

```json
"{\n    \"date_from\": \"2025-02-01\",\n    \"date_to\": \"2025-12-30\",\n    // \"starts_at\": \"2025-12-30\", // Ad Start Date\n    // \"ends_at\": \"2025-02-30\", Ad End Date\n    // \"status\": \"active\", // pending || active || in_active || finished\n    \"format\": \"xlsx\" // csv || xlsx\n}"
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| no |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## POST Export Ad Reports

POST /api/v1/company/ads/{id}/export

> Body Parameters

```json
"{\n    \"date_from\": \"2025-02-01\",\n    \"date_to\": \"2025-12-30\",\n    \"format\": \"xlsx\" // csv || xlsx\n}"
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|string| yes |none|
|body|body|object| no |none|

> Response Examples

> 200 Response

```json
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

# Data Schema

