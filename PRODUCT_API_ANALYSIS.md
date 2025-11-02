# Product API Integration Analysis

## Date: November 2, 2025

---

## Executive Summary

After analyzing the backend OpenAPI specification and the current frontend implementation, I've identified **critical issues** with product creation, specifically around **SKU handling** and **tier pricing**. This document outlines all findings and required fixes.

---

## 🔴 Critical Issues Found

### 1. **SKUs Are Conditionally Sent (MAJOR BUG)**

**Problem:**
- The current implementation only sends SKUs when `price_type === 'sku'`
- However, according to the API specification, **SKUs should ALWAYS be included** in product creation

**Current Code (ProductForm.tsx, lines 534-578):**
```typescript
// SKUs: Only append when price_type is 'sku' and we have valid SKUs
if (priceType === 'sku' && enhancedSkus && enhancedSkus.length > 0) {
  // ... SKU processing
}
```

**API Requirement:**
According to `/api/v1/company/products` POST endpoint (line 4182 in OpenAPI):
```json
{
  "product": {...},
  "media": [...],
  "skus": [...]  // ALWAYS included, not conditional
}
```

**Impact:** 
- Products with `price_type='range'` or `price_type='tiered'` are created WITHOUT any SKUs
- This can cause inventory tracking issues since inventory is tied to SKUs
- May cause errors when trying to create orders

**Solution Required:**
- Always include at least one SKU, regardless of price type
- For 'range' and 'tiered' pricing: create a default/generic SKU
- For 'sku' pricing: use the user-defined SKUs

---

### 2. **SKU Structure is Mostly Correct**

**Good News:** The SKU structure implementation matches the API requirements:

✅ **Required Fields Present:**
- `code` - SKU code
- `price` - SKU price
- `package_details` - with all sub-fields (mass_unit, weight, distance_unit, height, length, width)
- `inventory.warehouses` - array with warehouse_id, on_hand, reserved, reorder_point, restock_level, track_inventory
- `attributes` - array with type, variation_value_id, hex_color (for color type), image (for image type)

**API Example from OpenAPI (lines 4201-4238):**
```json
{
  "code": "SKU_23123213",
  "price": 5120,
  "package_details": {
    "mass_unit": "lb",
    "weight": "1",
    "distance_unit": "in",
    "height": "1",
    "length": "1",
    "width": "1"
  },
  "inventory": {
    "warehouses": [{
      "warehouse_id": 31,
      "on_hand": 100,
      "reserved": 10,
      "reorder_point": 5,
      "restock_level": 20,
      "track_inventory": true
    }]
  },
  "attributes": [{
    "type": "select",
    "variation_value_id": 5
  }]
}
```

---

### 3. **Tier Pricing Implementation is Correct**

✅ **Tier pricing is properly implemented:**
- Sent as `tiered_prices` array
- Contains `min_quantity` and `price` fields
- Only sent when `price_type === 'tiered'`

**Current Implementation (lines 527-532):**
```typescript
if (priceType === 'tiered') {
  tieredPrices.forEach((tier, index) => {
    fd.append(`tiered_prices[${index}][min_quantity]`, String(tier.min_quantity))
    fd.append(`tiered_prices[${index}][price]`, String(tier.price))
  })
}
```

**API Requirement Match:** ✅
```json
"tiered_prices": [
  { "min_quantity": 30, "price": 100 },
  { "min_quantity": 50, "price": 90 }
]
```

---

## 📊 API Endpoint Structure

### Create Product: `POST /api/v1/company/products`

**Request Format:**
```json
{
  "product": {
    "name": "Product Name",
    "description": "Product Description",
    "content": {...},  // Nullable
    "moq": 45,
    "product_unit_id": 9,
    "price_type": "range",  // sku || tiered || range
    "is_active": true,
    "category_id": 32
  },
  "media": [/* files */],  // Required
  "skus": [{...}],  // Should always be present
  
  // Conditional based on price_type:
  "range_price": {  // If price_type = "range"
    "min_price": 100,
    "max_price": 350
  },
  "tiered_prices": [{...}]  // If price_type = "tiered"
}
```

---

## 🔧 Required Fixes

### Fix 1: Always Include SKUs

**File:** `components/pages/dashboard/products/components/ProductForm.tsx`

**Change:** Modify the SKU appending logic (around line 534):

```typescript
// OLD CODE - WRONG:
if (priceType === 'sku' && enhancedSkus && enhancedSkus.length > 0) {
  // append SKUs
}

// NEW CODE - CORRECT:
// SKUs are ALWAYS required, regardless of price_type
if (priceType === 'sku' && enhancedSkus && enhancedSkus.length > 0) {
  // Use user-defined SKUs
  enhancedSkus.forEach((sku: any, skuIndex: number) => {
    // ... existing SKU appending logic
  })
} else if (priceType === 'range' || priceType === 'tiered') {
  // Create a default/generic SKU for range/tiered pricing
  const defaultSku = {
    code: `SKU-${name.substring(0, 10).replace(/\s/g, '-').toUpperCase()}-DEFAULT`,
    price: priceType === 'range' ? parseFloat(rangePrice.min_price || '0') : tieredPrices[0]?.price || 0,
    package_details: {
      mass_unit: 'lb',
      weight: 1,
      distance_unit: 'in',
      height: 1,
      length: 1,
      width: 1
    },
    inventory: {
      warehouses: warehouses.length > 0 ? [{
        warehouse_id: warehouses[0].id,
        on_hand: 0,
        reserved: 0,
        reorder_point: 5,
        restock_level: 20,
        track_inventory: true
      }] : []
    },
    attributes: []  // Empty for default SKU
  }
  
  // Append default SKU
  fd.append('skus[0][code]', defaultSku.code)
  fd.append('skus[0][price]', String(defaultSku.price))
  // ... append other fields
}
```

---

### Fix 2: Update Form Validation

**File:** `components/pages/dashboard/products/components/ProductForm.tsx`

**Change:** Update validation logic (around line 348):

```typescript
// Remove this validation since SKUs will always be created:
// if (priceType === "sku" && enhancedSkus.length === 0) {
//   newErrors.pricing = "At least one SKU is required for SKU pricing"
// }

// Keep validation only for user-defined SKUs:
if (priceType === "sku" && enhancedSkus.length === 0) {
  newErrors.pricing = "At least one SKU variant is required for SKU pricing"
}

// Add validation for warehouses:
if (warehouses.length === 0 && priceType !== 'sku') {
  // Warn but don't block: "No warehouses available. Please add a warehouse first."
}
```

---

## 🔍 Inventory & Warehouse Relationship

### Key Insights:

1. **Inventory is tied to SKUs, not Products directly**
   - Each SKU has its own inventory across multiple warehouses
   - Structure: `sku.inventory.warehouses[]`

2. **Warehouse Fields:**
   - `warehouse_id` - ID of the warehouse
   - `on_hand` - Available quantity
   - `reserved` - Reserved for orders
   - `reorder_point` - Minimum before reorder
   - `restock_level` - Target restock quantity
   - `track_inventory` - Boolean flag

3. **No Separate Inventory API Call for Product Creation**
   - Inventory is created as part of the product creation
   - Subsequent inventory updates use `/api/v1/company/inventory/operate`

---

## 📝 Additional Endpoints Related to Products

### Inventory Operations:
```
POST /api/v1/company/inventory/operate
```
Types: receive, ship, reserve, release_reservation, adjust, count, return, damage, loss, transfer

### List Product SKUs:
```
GET /api/v1/company/products/all/{id}
```
Returns all SKUs for a specific product

### List SKU History:
```
GET /api/v1/company/inventory/history?sku_id={sku_id}
```
Returns inventory movement history for a SKU

---

## ✅ What's Already Correct

1. ✅ **Media Upload** - Properly sends `media[]` as multipart/form-data
2. ✅ **Range Pricing** - Correctly sends `range_price.min_price` and `range_price.max_price`
3. ✅ **Tier Pricing** - Correctly sends `tiered_prices[]` array
4. ✅ **SKU Structure** - All required fields are present when SKUs are sent
5. ✅ **Product Content** - Properly serializes nested content structure
6. ✅ **Update Logic** - Uses `_method=PUT` for FormData updates
7. ✅ **Warehouse Loading** - Fetches warehouses for SKU inventory selection

---

## 🎯 Testing Checklist

After implementing fixes, test:

- [ ] Create product with `price_type='range'` - verify default SKU is created
- [ ] Create product with `price_type='tiered'` - verify default SKU is created
- [ ] Create product with `price_type='sku'` - verify user-defined SKUs are created
- [ ] Verify inventory is properly linked to SKUs
- [ ] Test with multiple warehouses
- [ ] Test with color attributes (hex_color field)
- [ ] Test with image attributes (file upload)
- [ ] Verify tier pricing displays correctly
- [ ] Test product update (add/remove/modify SKUs)

---

## 📌 Recommendations

1. **Immediate:** Fix the conditional SKU sending (Fix 1)
2. **Short-term:** Add warehouse management check before product creation
3. **Medium-term:** Consider adding SKU bulk edit/generation tools
4. **Long-term:** Implement inventory forecasting based on reorder points

---

## 🔗 Related Files

- `/components/pages/dashboard/products/components/ProductForm.tsx` - Main form
- `/components/pages/dashboard/products/components/EnhancedSkuManager.tsx` - SKU management
- `/src/services/products-api.ts` - API client
- `/src/services/types/product-types.ts` - Type definitions
- `PRODUCTS_API_INTEGRATION_GUID.md` - Integration guide

---

## Contact & Support

If you have questions about these findings or need clarification, please review:
1. The OpenAPI specification: `Company api .openapi.json`
2. The integration guide: `PRODUCTS_API_INTEGRATION_GUID.md`
3. The Laravel API documentation

---

**Analysis completed by:** AI Assistant
**Date:** November 2, 2025
**Status:** ⚠️ Critical fixes required before production use

