import { NextResponse } from "next/server"

async function exchangeCodeForTokens(params: {
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
}) {
  const body = new URLSearchParams({
    code: params.code,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    redirect_uri: params.redirectUri,
    grant_type: "authorization_code",
  })
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google token exchange failed: ${res.status} ${text}`)
  }
  return res.json() as Promise<{
    access_token: string
    id_token?: string
    expires_in: number
    token_type: string
    scope: string
    refresh_token?: string
  }>
}

async function loginWithBackend(accessToken: string) {
  const backendUrl = process.env.BACKEND_SOCIAL_LOGIN_URL ||
    "https://test.hgallerycandles.com/api/v1/login/social"

  const res = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ provider: "google", token: accessToken }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Backend social login failed: ${res.status} ${text}`)
  }
  return res.json() as Promise<any>
}

function htmlSetLocalStorageAndRedirect(payload: any, redirectTo: string) {
  const safe = JSON.stringify(payload).replace(/</g, "\\u003c")
  const safeRedirect = redirectTo.replace(/"/g, "")
  return `<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"></head><body><script>
try {
  const data = JSON.parse('${safe}')
  if (data.token) localStorage.setItem('token', data.token)
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
  if (data.roles) localStorage.setItem('roles', JSON.stringify(data.roles))
  if (data.completion_status) localStorage.setItem('completion_status', JSON.stringify(data.completion_status))
} catch (e) { console.error(e) }
location.replace('${safeRedirect}')
</script></body></html>`
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const origin = `${url.protocol}//${url.host}`
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error || "missing_code")}`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/login?error=missing_google_credentials`)
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`

  try {
    const tokens = await exchangeCodeForTokens({ code, clientId, clientSecret, redirectUri })
    const backendData = await loginWithBackend(tokens.access_token)

    const cs = backendData?.completion_status || {}
    const isNew = !cs?.profile_completed || !cs?.shipping_configured || !cs?.certificates_uploaded || !cs?.first_product_added
    const redirectTo = isNew ? `${origin}/onboarding` : `${origin}/dashboard`

    const html = htmlSetLocalStorageAndRedirect(backendData, redirectTo)
    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } })
  } catch (e) {
    console.error(e)
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }
}

