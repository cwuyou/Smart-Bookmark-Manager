"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CustomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface CustomDialogContentProps {
  className?: string
  children: React.ReactNode
}

interface CustomDialogHeaderProps {
  children: React.ReactNode
}

interface CustomDialogTitleProps {
  children: React.ReactNode
}

interface CustomDialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

const CustomDialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
} | null>(null)

export function CustomDialog({ open, onOpenChange, children }: CustomDialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [open, onOpenChange])

  return <CustomDialogContext.Provider value={{ open, onOpenChange }}>{children}</CustomDialogContext.Provider>
}

export function CustomDialogTrigger({ asChild, children }: CustomDialogTriggerProps) {
  const context = React.useContext(CustomDialogContext)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    context?.onOpenChange(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    })
  }

  return <button onClick={handleClick}>{children}</button>
}

export function CustomDialogContent({ className = "", children }: CustomDialogContentProps) {
  const context = React.useContext(CustomDialogContext)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!context?.open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => context?.onOpenChange(false)} />
      {/* Content */}
      <div
        className={`relative z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0 z-10"
            onClick={() => context?.onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function CustomDialogHeader({ children }: CustomDialogHeaderProps) {
  return <div className="p-6 pb-4">{children}</div>
}

export function CustomDialogTitle({ children }: CustomDialogTitleProps) {
  return <h2 className="text-lg font-semibold pr-8">{children}</h2>
}
