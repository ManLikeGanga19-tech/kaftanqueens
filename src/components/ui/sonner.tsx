import * as React from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          // Normal / default
          "--normal-bg":     "#f5f2ed",
          "--normal-text":   "#1A1A1A",
          "--normal-border": "rgba(26,26,26,0.12)",
          // Success — dark card with gold border
          "--success-bg":     "#1A1A1A",
          "--success-text":   "#f5f2ed",
          "--success-border": "#C5A059",
          // Error — maroon
          "--error-bg":     "#7D1C2E",
          "--error-text":   "#f5f2ed",
          "--error-border": "#7D1C2E",
          // Info — dark
          "--info-bg":     "#1A1A1A",
          "--info-text":   "#f5f2ed",
          "--info-border": "rgba(26,26,26,0.2)",
          // Warning — gold
          "--warning-bg":     "#C5A059",
          "--warning-text":   "#1A1A1A",
          "--warning-border": "#C5A059",
          // Shape
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
