# Adil-Baba GraphQL API Queries Documentation

This document provides a reference for integrating the **GraphQL analytics endpoints** available at  
`https://api.adil-baba.com/graphiql`.

Each query can be used to retrieve business insights for your dashboard — including inventory, orders, products, shipments, and wallet summaries.

---

## 🔹 1. inventorySummary

**Description:** Fetches data about your stock and inventory health.

**Fields:**
- `inStock`: Number of products currently in stock.
- `lowStock`: Products nearing depletion.
- `outOfStock`: Products currently unavailable.
- `totalValue`: Total monetary value of the inventory.

**Example Query:**
```graphql
query {
  inventorySummary {
    inStock
    lowStock
    outOfStock
    totalValue
  }
}
```

---

## 🔹 2. orderAnalyticsSummary

**Description:** Aggregates order data within a date range.

**Arguments:**
- `startDate`: String (required)
- `endDate`: String (required)

**Fields:**
- `averageOrderValue`
- `ordersByDate { date, count, totalAmount }`
- `paymentStatus`
- `revenueTrend { date, totalAmount }`
- `totalOrders`
- `totalRevenue`

**Example Query:**
```graphql
query {
  orderAnalyticsSummary(startDate: "2025-10-01", endDate: "2025-10-31") {
    totalOrders
    totalRevenue
    averageOrderValue
    revenueTrend {
      date
      totalAmount
    }
  }
}
```

---

## 🔹 3. productAnalyticsSummary

**Description:** Provides product-level analytics (optionally filtered by product ID).

**Arguments:**
- `startDate`: String (required)
- `endDate`: String (required)
- `productId`: ID (optional)

**Fields:**
- `totalAddedToCart`
- `totalClick`
- `totalFavorites`
- `totalOrderPaid`
- `totalOrdersCreated`
- `totalRevenue`
- `totalViews`

**Example Query:**
```graphql
query {
  productAnalyticsSummary(productId: "123", startDate: "2025-10-01", endDate: "2025-10-31") {
    totalViews
    totalRevenue
    totalAddedToCart
  }
}
```

---

## 🔹 4. shipmentAnalyticsSummary

**Description:** Tracks shipment performance metrics.

**Arguments:**
- `startDate`: String (required)
- `endDate`: String (required)

**Likely Fields:**
- `delivered`
- `pending`
- `returned`
- `totalShipped`

**Example Query:**
```graphql
query {
  shipmentAnalyticsSummary(startDate: "2025-10-01", endDate: "2025-10-31") {
    delivered
    pending
    returned
  }
}
```

---

## 🔹 5. topProducts

**Description:** Fetches top-performing products for a given date range.

**Arguments:**
- `startDate`: String (required)
- `endDate`: String (required)

**Possible Fields:**
- `productId`
- `name`
- `totalRevenue`
- `totalOrders`

**Example Query:**
```graphql
query {
  topProducts(startDate: "2025-10-01", endDate: "2025-10-31") {
    productId
    name
    totalRevenue
  }
}
```

---

## 🔹 6. walletSummary

**Description:** Provides wallet and financial summaries.

**Arguments:**
- `startDate`: String (required)
- `endDate`: String (required)

**Fields:**
- `availableBalance`
- `currency`
- `netProfit`
- `pendingAmount`
- `revenueTrend { date, count, totalAmount }`
- `totalExpenses`
- `totalIncome`

**Example Query:**
```graphql
query {
  walletSummary(startDate: "2025-10-01", endDate: "2025-10-31") {
    availableBalance
    netProfit
    totalIncome
    totalExpenses
    revenueTrend {
      date
      totalAmount
    }
  }
}
```

---

## 🔹 Unified Example Query

You can combine multiple summaries into a single GraphQL request to reduce network calls and render a complete dashboard snapshot.

```graphql
query DashboardAnalytics {
  inventorySummary {
    inStock
    lowStock
    outOfStock
    totalValue
  }
  orderAnalyticsSummary(startDate: "2025-10-01", endDate: "2025-10-31") {
    totalOrders
    totalRevenue
    averageOrderValue
  }
  productAnalyticsSummary(startDate: "2025-10-01", endDate: "2025-10-31") {
    totalRevenue
    totalViews
  }
  shipmentAnalyticsSummary(startDate: "2025-10-01", endDate: "2025-10-31") {
    delivered
    pending
  }
  topProducts(startDate: "2025-10-01", endDate: "2025-10-31") {
    productId
    name
    totalRevenue
  }
  walletSummary(startDate: "2025-10-01", endDate: "2025-10-31") {
    availableBalance
    netProfit
    totalIncome
    totalExpenses
  }
}
```

---

## 🔧 Integration Notes

- Use a GraphQL client like **Apollo Client**, **urql**, or **graphql-request** in your dashboard frontend.
- Always validate date inputs and format them as `"YYYY-MM-DD"`.
- Queries are read-only; mutations are not required for analytics.
- To optimize performance, prefer unified queries instead of multiple network calls.
- Base URL: `https://api.adil-baba.com/graphql`
