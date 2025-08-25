"use client"

import { createContext, useContext, useMemo, useState } from "react"

// NOTE: Temporary mock data provider
// This context loads data from local JSON files in the `mocks/` folder.
// It exists ONLY until real APIs are available. When APIs are ready:
// - Replace these imports/usages with API calls
// - Or refactor to a data fetching layer (hooks/services)
// Please keep this file as the single place to switch from mocks → APIs.

import membershipJson from "@/mocks/membership.json"
import adsJson from "@/mocks/ads.json"
import analyticsJson from "@/mocks/analytics.json"
import certificatesJson from "@/mocks/certificates.json"
import contactsJson from "@/mocks/crm-contacts.json"
import messagesJson from "@/mocks/messages.json"
import ordersJson from "@/mocks/orders.json"
import productsJson from "@/mocks/products.json"
import rfqsJson from "@/mocks/rfqs.json"
import toolsJson from "@/mocks/tools.json"

type MockDataContextValue = {
  products: any[]
  orders: any[]
  rfqs: any[]
  contacts: any[]
  messages: any[]
  certificates: any[]
  ads: any[]
  tools: any[]
  analytics: any
  membership: any
  // Simple setters to simulate mutations in-memory during mock phase
  setProducts: React.Dispatch<React.SetStateAction<any[]>>
  setOrders: React.Dispatch<React.SetStateAction<any[]>>
  setRFQs: React.Dispatch<React.SetStateAction<any[]>>
  setContacts: React.Dispatch<React.SetStateAction<any[]>>
  setMessages: React.Dispatch<React.SetStateAction<any[]>>
  setCertificates: React.Dispatch<React.SetStateAction<any[]>>
  setAds: React.Dispatch<React.SetStateAction<any[]>>
  setTools: React.Dispatch<React.SetStateAction<any[]>>
  setAnalytics: React.Dispatch<React.SetStateAction<any>>
  setMembership: React.Dispatch<React.SetStateAction<any>>
}

const MockDataContext = createContext<MockDataContextValue | undefined>(undefined)

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<any[]>(productsJson as any[])
  const [orders, setOrders] = useState<any[]>(ordersJson as any[])
  const [rfqs, setRFQs] = useState<any[]>(rfqsJson as any[])
  const [contacts, setContacts] = useState<any[]>(contactsJson as any[])
  const [messages, setMessages] = useState<any[]>(messagesJson as any[])
  const [certificates, setCertificates] = useState<any[]>(certificatesJson as any[])
  const [ads, setAds] = useState<any[]>(adsJson as any[])
  const [tools, setTools] = useState<any[]>(toolsJson as any[])
  const [analytics, setAnalytics] = useState<any>(analyticsJson as any)
  const [membership, setMembership] = useState<any>(membershipJson as any)

  const value: MockDataContextValue = useMemo(
    () => ({
      products,
      orders,
      rfqs,
      contacts,
      messages,
      certificates,
      ads,
      tools,
      analytics,
      membership,
      setProducts,
      setOrders,
      setRFQs,
      setContacts,
      setMessages,
      setCertificates,
      setAds,
      setTools,
      setAnalytics,
      setMembership,
    }),
    [
      products,
      orders,
      rfqs,
      contacts,
      messages,
      certificates,
      ads,
      tools,
      analytics,
      membership,
    ],
  )

  return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>
}

export function useMockData() {
  const ctx = useContext(MockDataContext)
  if (!ctx) throw new Error("useMockData must be used within MockDataProvider")
  return ctx
}


