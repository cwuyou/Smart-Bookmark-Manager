"use client"

import type React from "react"
import { Sun, Moon, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "../lib/theme-context"
import { useLanguage } from "@/lib/i18n/language-context"

export function ThemeSettings() {
  const { theme, updateTheme, resetTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      {/* Theme Mode */}
      <Card>
        <CardHeader>
          <CardTitle>{t('theme.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={theme.mode === "light" ? "default" : "outline"}
              size="lg"
              onClick={() => updateTheme({ mode: "light" })}
              className="flex-1"
            >
              <Sun className="w-4 h-4 mr-2" />
              {t('theme.light')}
            </Button>
            <Button
              variant={theme.mode === "dark" ? "default" : "outline"}
              size="lg"
              onClick={() => updateTheme({ mode: "dark" })}
              className="flex-1"
            >
              <Moon className="w-4 h-4 mr-2" />
              {t('theme.dark')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>{t('theme.typography.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>{t('theme.typography.fontSize')}</Label>
            <Select
              value={theme.fontSize}
              onValueChange={(value: "small" | "medium" | "large") => updateTheme({ fontSize: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">{t('theme.typography.small')}</SelectItem>
                <SelectItem value="medium">{t('theme.typography.medium')}</SelectItem>
                <SelectItem value="large">{t('theme.typography.large')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <Button variant="outline" onClick={resetTheme} className="w-full">
        <RotateCcw className="w-4 h-4 mr-2" />
        {t('theme.reset')}
      </Button>
    </div>
  )
}
