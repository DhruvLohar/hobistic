import * as React from "react"

type QuotesIconProps = React.SVGProps<SVGSVGElement> & {
  width?: number | string
  height?: number | string
}

const QuotesIcon = React.memo(function QuotesIcon(
  { width = 24, height = 24, ...props }: QuotesIconProps,
) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M24 13.5V3H13.5V13.65C13.5 20.85 20.25 21.75 20.25 21.75L21.15 19.65C21.15 19.65 18.15 19.2 17.55 16.8C16.95 15 18.15 13.5 18.15 13.5H24Z"
        fill="currentColor"
      />
      <path
        d="M10.5 13.5V3H0V13.65C0 20.85 6.75 21.75 6.75 21.75L7.65 19.65C7.65 19.65 4.65 19.2 4.05 16.8C3.45 15 4.65 13.5 4.65 13.5H10.5Z"
        fill="currentColor"
      />
    </svg>
  )
})

export { QuotesIcon }
