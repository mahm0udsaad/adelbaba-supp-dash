import { useLocation, useNavigate, useParams as useRRParams } from "react-router-dom"

export function useRouter() {
  const navigate = useNavigate()
  return {
    push: (to: string) => navigate(to),
    replace: (to: string) => navigate(to, { replace: true }),
    back: () => navigate(-1),
  }
}

export function usePathname(): string {
  const { pathname } = useLocation()
  return pathname
}

export function useSearchParams(): URLSearchParams {
  const { search } = useLocation()
  return new URLSearchParams(search)
}

export function useParams<T extends Record<string, string>>() {
  return useRRParams<T>() as Readonly<T>
}


