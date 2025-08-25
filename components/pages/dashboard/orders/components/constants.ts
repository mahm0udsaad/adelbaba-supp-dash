export const statusColors: Record<string, string> = {
  awaiting_payment: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_escrow: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  disputed: "bg-red-100 text-red-800 border-red-200",
}

export const escrowStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  held: "bg-blue-100 text-blue-700",
  released: "bg-green-100 text-green-700",
  disputed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
}

