import React from "react"
import { Link as RouterLink } from "react-router-dom"

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
}

const Link: React.FC<React.PropsWithChildren<AnchorProps>> = ({ href, children, ...rest }) => {
  return (
    <RouterLink to={href} {...rest}>
      {children}
    </RouterLink>
  )
}

export default Link


