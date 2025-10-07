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

# Company/Shipments/Carriers

## GET List Carriers

GET /api/v1/company/shipments/carriers

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|page|query|string| no |Page Number, Default = 1|
|per_page|query|string| no |Results Per Page, Default = 20|

> Response Examples

> 200 Response

```json
[
  {
    "carrier": "sendle",
    "object_id": "749d28a2742342dc979fd1e1f4663fa2",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_sendle_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "Sendle",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/sendle.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/sendle.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "ups",
    "object_id": "19021d389059482ab6f8888653ce83fe",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_ups_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "US",
    "carrier_name": "UPS",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/UPS.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/UPS.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "ups",
    "object_id": "5fb3a8cf2f1b417ca46dcf6f82872981",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_ups_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "CA",
    "carrier_name": "UPS",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/UPS.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/UPS.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "usps",
    "object_id": "ba0ca3dfc01a4493b29dfe5f0decd3a7",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_usps_account",
    "parameters": {
      "is_commercial": "******"
    },
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "USPS",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/USPS.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/USPS.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "canada_post",
    "object_id": "415ae6b7242d48d79d8b70df0a530810",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_canada_post_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "Canada Post",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/canada_post.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/canada_post.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "chronopost",
    "object_id": "5288c7fffe4b4e36b70450af233bd680",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_chronopost_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "Chronopost",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/chronopost.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/chronopost.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "colissimo",
    "object_id": "21cacc6eed5e4ab19bf01ef0f1ce35aa",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_colissimo_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "Colissimo",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/colissimo.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/colissimo.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "couriersplease",
    "object_id": "7708f352df8a46c4b7dd9a5b5a53dc38",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_couriersplease_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "CouriersPlease",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/couriersplease.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/couriersplease.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "correos",
    "object_id": "5bb608cdc4044caa8ff0dcd38b26ff1c",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_correos_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "Correos",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/correos.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/correos.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "deutsche_post",
    "object_id": "6b06bdab240f4a1ba18fc64508dad97a",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_deutsche_post_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "Deutsche Post",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/Deutsche_Post.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/Deutsche_Post.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "dhl_express",
    "object_id": "36240723cce54eaeb48164b5e281cba8",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_dhlexpress_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "DHL Express",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/DHL.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/DHL.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "dpd_de",
    "object_id": "06116781e57b4810b35ff432ec870868",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_dpd_de_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "DPD DE",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/dpd_de.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/dpd_de.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "dpd_uk",
    "object_id": "c9b1eee30d15456887f0c3881d82969c",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_dpd_uk_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "DPD UK",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/DPD.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/DPD.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "hermes_uk",
    "object_id": "8fd427212f48437eaea1b5b87a3a828f",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_hermes_uk_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "Hermes UK",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/myHermes.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/myHermes.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  },
  {
    "carrier": "lso",
    "object_id": "b23a76e1131a4bc9bf8f6b78d4a9087e",
    "object_owner": "abdos1166@gmail.com",
    "account_id": "shippo_shippocommon_account",
    "parameters": [],
    "test": true,
    "active": true,
    "is_shippo_account": true,
    "metadata": "",
    "carrier_name": "LSO",
    "carrier_images": {
      "75": "https://shippo-static-v2.s3.amazonaws.com/providers/75/lso.png",
      "200": "https://shippo-static-v2.s3.amazonaws.com/providers/200/lso.png"
    },
    "object_info": {
      "authentication": {
        "type": "default"
      }
    }
  }
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» carrier|string|true|none||none|
|» object_id|string|true|none||none|
|» object_owner|string|true|none||none|
|» account_id|string|true|none||none|
|» parameters|[string]|true|none||none|
|»» is_commercial|string|true|none||none|
|» test|boolean|true|none||none|
|» active|boolean|true|none||none|
|» is_shippo_account|boolean|true|none||none|
|» metadata|string|true|none||none|
|» carrier_name|string|true|none||none|
|» carrier_images|object|true|none||none|
|»» 75|string|true|none||none|
|»» 200|string|true|none||none|
|» object_info|object|true|none||none|
|»» authentication|object|true|none||none|
|»»» type|string|true|none||none|

## POST Setup Carriers

POST /api/v1/company/shipments/carriers

> Body Parameters

```json
"{\n    \"carriers\": [\"749d28a2742342dc979fd1e1f4663fa2\", \"19021d389059482ab6f8888653ce83fe\"] // object_id from List Carriers endpoint\n}"
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| no |none|

> Response Examples

> 200 Response

```json
{
  "message": "Carriers saved successfully."
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» message|string|true|none||none|

## GET List Saved Carriers Object IDs

GET /api/v1/company/shipments/carriers/saved

> Response Examples

> 200 Response

```json
[
  "749d28a2742342dc979fd1e1f4663fa2",
  "19021d389059482ab6f8888653ce83fe"
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

# Data Schema

