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

# Company/Profile

## POST Edit Company Profile

POST /api/v1/company/update

> Body Parameters

```yaml
_method: PUT
logo: file://C:\Users\Bodda\OneDrive\Desktop\2019_8_10_8_50_46_809.jpg
description: New Description
"contacts[0][id]": "11"
"contacts[0][phone]": "68655552213"
"contacts[0][email]": abdos309@gmail.com
"contacts[0][is_primary]": 1
"contacts[1][phone]": "4586321001"
"contacts[1][email]": abdos11066@gmail.com

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| no |none|
|» _method|body|string| no |none|
|» logo|body|string(binary)| yes |none|
|» description|body|string| no |none|
|» contacts[0][id]|body|string| no |to update a specific contact pass the id, if you want to create a new one don't pass the id|
|» contacts[0][phone]|body|string| no |none|
|» contacts[0][email]|body|string| no |none|
|» contacts[0][is_primary]|body|integer| no |none|
|» contacts[1][phone]|body|string| no |none|
|» contacts[1][email]|body|string| no |none|

> Response Examples

> 200 Response

```json
{
  "message": "Company updated successfully."
}
```

> 403 Response

```json
{
  "message": "You have to register a company first."
}
```

> 500 Response

```json
{
  "message": "Failed to update company."
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|none|Inline|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» message|string|true|none||none|

HTTP Status Code **500**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» message|string|true|none||none|

## GET List Factory Images

GET /api/v1/company/factory

> Body Parameters

```yaml
{}

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| no |none|

> Response Examples

> 200 Response

```json
{
  "data": [
    {
      "id": 1874,
      "file_name": "498205974_1108027954692871_7248669807573205471_n.jpg",
      "size": "image/jpeg",
      "human_readable_size": "40.89 KB",
      "url": "https://adilbaba.test/storage/1874/498205974_1108027954692871_7248669807573205471_n.jpg",
      "type": "image"
    },
    {
      "id": 1875,
      "file_name": "499712061_2430635967310455_5263708950995414591_n.jpg",
      "size": "image/jpeg",
      "human_readable_size": "6.47 KB",
      "url": "https://adilbaba.test/storage/1875/499712061_2430635967310455_5263708950995414591_n.jpg",
      "type": "image"
    },
    {
      "id": 1876,
      "file_name": "499917975_10161841770032839_6781769260546666968_n.jpg",
      "size": "image/jpeg",
      "human_readable_size": "167.67 KB",
      "url": "https://adilbaba.test/storage/1876/499917975_10161841770032839_6781769260546666968_n.jpg",
      "type": "image"
    },
    {
      "id": 1877,
      "file_name": "500226616_122104644938874413_4257923888398449160_n.jpg",
      "size": "image/jpeg",
      "human_readable_size": "50.97 KB",
      "url": "https://adilbaba.test/storage/1877/500226616_122104644938874413_4257923888398449160_n.jpg",
      "type": "image"
    },
    {
      "id": 1878,
      "file_name": "500248890_122164745468461777_264803281327777088_n.jpg",
      "size": "image/jpeg",
      "human_readable_size": "7.84 KB",
      "url": "https://adilbaba.test/storage/1878/500248890_122164745468461777_264803281327777088_n.jpg",
      "type": "image"
    }
  ]
}
```

> 403 Response

```json
{
  "message": "You have to register a company first."
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» data|[object]|true|none||none|
|»» id|integer|true|none||none|
|»» file_name|string|true|none||none|
|»» size|string|true|none||none|
|»» human_readable_size|string|true|none||none|
|»» url|string|true|none||none|
|»» type|string|true|none||none|

## POST Upload Factory Images

POST /api/v1/company/factory

> Body Parameters

```yaml
"media[remove][]":
  - "1874"
  - "1875"
"media[add][]":
  - file://C:\Users\Bodda\OneDrive\Desktop\498205974_1108027954692871_7248669807573205471_n.jpg
  - file://C:\Users\Bodda\OneDrive\Desktop\499712061_2430635967310455_5263708950995414591_n.jpg
  - file://C:\Users\Bodda\OneDrive\Desktop\499917975_10161841770032839_6781769260546666968_n.jpg
  - file://C:\Users\Bodda\OneDrive\Desktop\500226616_122104644938874413_4257923888398449160_n.jpg
  - file://C:\Users\Bodda\OneDrive\Desktop\500248890_122164745468461777_264803281327777088_n.jpg

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| no |none|
|» media[remove][]|body|[string]| no |To remove images by id|
|» media[add][]|body|string(binary)| no |To add images|

> Response Examples

> 200 Response

```json
{
  "message": "Factory images updated successfully."
}
```

> 403 Response

```json
{
  "message": "You have to register a company first."
}
```

> 500 Response

```json
{
  "message": "Failed to update factory images."
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|none|Inline|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» message|string|true|none||none|

HTTP Status Code **500**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» message|string|true|none||none|

# Data Schema

