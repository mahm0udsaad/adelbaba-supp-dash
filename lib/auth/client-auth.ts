let clearingAuth = false

const AUTH_ERROR_STATUS = [401]

export function isAuthErrorStatus(status?: number): boolean {
  if (typeof status !== "number") {
    return false
  }
  return AUTH_ERROR_STATUS.includes(status)
}

export async function clearClientAuthState(options: { redirectToLogin?: boolean } = {}): Promise<void> {
  if (typeof window === "undefined") {
    return
  }

  if (clearingAuth) {
    return
  }

  const { redirectToLogin = true } = options
  clearingAuth = true

  try {
    const [{ clearAuthDataFromStorage }, { signOut }] = await Promise.all([
      import("@/src/utils/auth-utils"),
      import("next-auth/react"),
    ])

    try {
      clearAuthDataFromStorage()
    } catch (error) {
      console.error("[Auth] Failed to clear cached auth data", error)
    }

    await signOut({ redirect: redirectToLogin, callbackUrl: "/login" })
  } catch (error) {
    console.error("[Auth] Sign out failed, forcing navigation", error)
    if (redirectToLogin) {
      window.location.href = "/login"
    }
  } finally {
    clearingAuth = false
  }
}
