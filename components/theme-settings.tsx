"use client"

import type React from "react"
import { Sun, Moon, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "../lib/theme-context"

export function ThemeSettings() {
  const { theme, updateTheme, resetTheme } = useTheme()

  return (
    <div className="space-y-6">
      {/* Theme Mode */}
      <Card>
        <CardHeader>
          <CardTitle>主题模式</CardTitle>
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
              浅色
            </Button>
            <Button
              variant={theme.mode === "dark" ? "default" : "outline"}
              size="lg"
              onClick={() => updateTheme({ mode: "dark" })}
              className="flex-1"
            >
              <Moon className="w-4 h-4 mr-2" />
              深色
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>字体设置</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>字体大小</Label>
            <Select
              value={theme.fontSize}
              onValueChange={(value: "small" | "medium" | "large") => updateTheme({ fontSize: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">小 (14px)</SelectItem>
                <SelectItem value="medium">中 (16px)</SelectItem>
                <SelectItem value="large">大 (18px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <Button variant="outline" onClick={resetTheme} className="w-full">
        <RotateCcw className="w-4 h-4 mr-2" />
        重置为默认主题
      </Button>
    </div>
  )
}
