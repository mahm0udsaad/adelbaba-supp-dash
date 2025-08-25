import React from "react"

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
}

const Image: React.FC<ImageProps> = ({ src, alt, width, height, style, ...rest }) => {
  const resolvedStyle = typeof width === "number" || typeof height === "number"
    ? { width, height, ...style }
    : style
  return <img src={src} alt={alt} style={resolvedStyle} {...rest} />
}

export default Image


