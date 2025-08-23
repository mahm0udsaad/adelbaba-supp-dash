export type Language = "en" | "ar"

export interface TranslationKeys {
  // Navigation
  dashboard: string
  rfqs: string
  orders: string
  products: string
  membership: string
  analytics: string
  crm: string
  ads: string
  certificates: string
  inbox: string
  tools: string

  // Common
  search: string
  filter: string
  refresh: string
  cancel: string
  save: string
  edit: string
  delete: string
  view: string
  back: string
  next: string
  previous: string
  loading: string
  error: string
  success: string

  // Orders
  totalOrders: string
  activeOrders: string
  tradeAssurance: string
  totalValue: string
  searchOrders: string
  allStatus: string
  awaitingPayment: string
  inEscrow: string
  shipped: string
  delivered: string
  disputed: string
  cancelled: string
  orderDate: string
  viewDetails: string
  noOrdersFound: string
  tryAdjustingSearch: string
  manageOrders: string

  // Status labels
  pending: string
  held: string
  released: string
  refunded: string

  // User menu
  profile: string
  settings: string
  logout: string
  notifications: string

  // Common phrases
  item: string
  items: string
  moreItems: string
}
