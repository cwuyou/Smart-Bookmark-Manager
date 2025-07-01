"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface ThemeSettings {
  mode: "light" | "dark"
  fontSize: "small" | "medium" | "large"
}

interface ThemeContextType {
  theme: ThemeSettings
  updateTheme: (updates: Partial<ThemeSettings>) => void
  resetTheme: () => void
}

const defaultTheme: ThemeSettings = {
  mode: "light",
  fontSize: "medium",
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme)

  useEffect(() => {
    const savedTheme = localStorage.getItem("dashboard-theme")
    if (savedTheme) {
      try {
        setTheme(JSON.parse(savedTheme))
      } catch (error) {
        console.error("Failed to parse saved theme:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("dashboard-theme", JSON.stringify(theme))

    // Apply theme mode
    const root = document.documentElement
    root.classList.toggle("dark", theme.mode === "dark")

    // Apply font size
    const fontSizes = {
      small: "14px",
      medium: "16px",
      large: "18px",
    }
    root.style.setProperty("--base-font-size", fontSizes[theme.fontSize])
  }, [theme])

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme((prev) => ({ ...prev, ...updates }))
  }

  const resetTheme = () => {
    setTheme(defaultTheme)
  }

  return <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
