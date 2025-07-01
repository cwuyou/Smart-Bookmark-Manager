"use client"

import type React from "react"

import { useState } from "react"
import { Download, Upload, FileText, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { DashboardData } from "../app/page"

interface ImportExportProps {
  data: DashboardData
  onImport: (data: DashboardData) => void
}

interface ImportStatus {
  type: "error" | "success"
  message: string
}

// 导入组件
export function ImportBookmarks({ onImport }: { onImport: (data: DashboardData) => void }) {
  const [importText, setImportText] = useState("")
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null)

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setImportText(content)
      }
      reader.readAsText(file)
    }
  }

  const handleImportJSON = () => {
    try {
      const importedData = JSON.parse(importText)

      // Validate the data structure
      if (!importedData.groups || !Array.isArray(importedData.groups)) {
        throw new Error("无效的数据格式：缺少 groups 数组")
      }

      if (!importedData.standaloneBookmarks || !Array.isArray(importedData.standaloneBookmarks)) {
        throw new Error("无效的数据格式：缺少 standaloneBookmarks 数组")
      }

      // Basic validation for groups and bookmarks
      importedData.groups.forEach((group: any, index: number) => {
        if (!group.id || !group.name || !Array.isArray(group.bookmarks)) {
          throw new Error(`分组 ${index + 1} 数据格式错误`)
        }
      })

      onImport(importedData)
      setImportText("")
      setImportStatus({ type: "success", message: "数据导入成功！" })
    } catch (error) {
      setImportStatus({
        type: "error",
        message: `导入失败: ${error instanceof Error ? error.message : "未知错误"}`,
      })
    }
  }

  const parseBookmarksHTML = (html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    // Helper function to generate unique IDs
    const generateId = () => `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Helper function to get favicon
    const getFavicon = (url: string) => {
      try {
        const domain = new URL(url).hostname
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
      } catch {
        return "/placeholder.svg?height=32&width=32"
      }
    }

    // Helper function to process a folder (DL element) recursively
    const processFolder = (dl: Element, folderName?: string): { groups: any[], bookmarks: any[] } => {
      const groups: any[] = []
      const bookmarks: any[] = []
      
      // Process all direct children
      Array.from(dl.children).forEach((child) => {
        if (child.tagName === 'DT') {
          const h3 = child.querySelector('h3')
          const a = child.querySelector('a')
          const subDl = child.querySelector('dl')
          
          if (h3 && subDl) {
            // This is a folder
            const folderResult = processFolder(subDl, h3.textContent || '新分组')
            if (folderResult.bookmarks.length > 0) {
              groups.push({
                id: generateId(),
                name: h3.textContent || '新分组',
                bookmarks: folderResult.bookmarks
              })
            }
            // Add any sub-groups
            groups.push(...folderResult.groups)
          } else if (a) {
            // This is a bookmark
            bookmarks.push({
              id: generateId(),
              name: a.textContent || a.getAttribute("href") || "未命名书签",
              url: a.getAttribute("href") || "",
              favicon: getFavicon(a.getAttribute("href") || "")
            })
          }
        }
      })

      return { groups, bookmarks }
    }

    // Find all bookmark folders in the document
    const bookmarkLists = doc.querySelectorAll('dl')
    if (bookmarkLists.length === 0) {
      // If no folder structure found, try to find all links
      const links = doc.querySelectorAll('a[href]')
      const bookmarks = Array.from(links).map(link => ({
        id: generateId(),
        name: link.textContent || link.getAttribute("href") || "未命名书签",
        url: link.getAttribute("href") || "",
        favicon: getFavicon(link.getAttribute("href") || "")
      }))

      // Put all bookmarks in a single group if no structure found
      return {
        groups: bookmarks.length > 0 ? [{
          id: generateId(),
          name: "导入的书签",
          bookmarks
        }] : [],
        standaloneBookmarks: []
      }
    }

    // Process the root folder
    const result = processFolder(bookmarkLists[0])
    
    return {
      groups: result.groups,
      // Any bookmarks at the root level become standalone bookmarks
      standaloneBookmarks: result.bookmarks
    }
  }

  const handleBrowserBookmarksImport = () => {
    try {
      if (importText.includes("<a href=") || importText.includes("<A HREF=")) {
        // HTML bookmarks format
        const parsedData = parseBookmarksHTML(importText)
        onImport(parsedData)
        setImportText("")
        setImportStatus({ type: "success", message: "浏览器书签导入成功！" })
      } else {
        handleImportJSON()
      }
    } catch (error) {
      setImportStatus({
        type: "error",
        message: `导入失败: ${error instanceof Error ? error.message : "未知错误"}`,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="import-file">从文件导入</Label>
        <input
          id="import-file"
          type="file"
          accept=".json,.html,.htm"
          onChange={handleFileImport}
          className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
      </div>

      <div>
        <Label htmlFor="import-text">或粘贴数据</Label>
        <Textarea
          id="import-text"
          placeholder="粘贴 JSON 数据或浏览器导出的 HTML 书签..."
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          className="mt-2 min-h-[120px]"
        />
      </div>

      <Button onClick={handleBrowserBookmarksImport} disabled={!importText.trim()} className="w-full">
        导入数据
      </Button>

      {importStatus && (
        <Alert variant={importStatus.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{importStatus.message}</AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground space-y-2">
        <p>
          <strong>支持的格式:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>浏览器导出的 HTML 书签文件</li>
          <li>Smart Bookmark Manager JSON 备份文件</li>
          <li>其他符合格式的 JSON 数据</li>
        </ul>
      </div>
    </div>
  )
}

// 完整的导入导出组件
export function ImportExport({ data, onImport }: ImportExportProps) {
  const exportToHTML = () => {
    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Bookmark Manager - 书签导出</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .group { margin-bottom: 30px; }
        .group h2 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .bookmark { margin: 8px 0; }
        .bookmark a { text-decoration: none; color: #0066cc; }
        .bookmark a:hover { text-decoration: underline; }
        .standalone { margin-top: 40px; }
    </style>
</head>
<body>
    <h1>Smart Bookmark Manager 书签</h1>
    <p>导出时间: ${new Date().toLocaleString("zh-CN")}</p>
`

    // Export groups
    data.groups.forEach((group) => {
      html += `    <div class="group">
        <h2>${group.name}</h2>
`
      group.bookmarks.forEach((bookmark) => {
        html += `        <div class="bookmark">
            <a href="${bookmark.url}" target="_blank">${bookmark.name}</a>
        </div>
`
      })
      html += `    </div>
`
    })

    // Export standalone bookmarks
    if (data.standaloneBookmarks.length > 0) {
      html += `    <div class="standalone">
        <h2>独立书签</h2>
`
      data.standaloneBookmarks.forEach((bookmark) => {
        html += `        <div class="bookmark">
            <a href="${bookmark.url}" target="_blank">${bookmark.name}</a>
        </div>
`
      })
      html += `    </div>
`
    }

    html += `</body>
</html>`

    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `my-dashboard-bookmarks-${new Date().toISOString().split("T")[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToJSON = () => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `my-dashboard-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出数据
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button onClick={exportToJSON} className="justify-start">
              <Code className="w-4 h-4 mr-2" />
              导出为 JSON
            </Button>
            <Button onClick={exportToHTML} variant="outline" className="justify-start bg-transparent">
              <FileText className="w-4 h-4 mr-2" />
              导出为 HTML
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            JSON 格式可用于完整备份和恢复，HTML 格式适合在浏览器中查看书签。
          </p>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            导入数据
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImportBookmarks onImport={onImport} />
        </CardContent>
      </Card>
    </div>
  )
}
