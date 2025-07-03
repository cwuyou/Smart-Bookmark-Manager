"use client"

import type React from "react"
import { useState } from "react"
import { Download, Upload, FileText, Code, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { DashboardData, Bookmark } from "../app/page"
import { useLanguage } from "@/lib/i18n/language-context"
import { toast } from "@/components/ui/use-toast"

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
  const { t } = useLanguage();
  const [importText, setImportText] = useState("")
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null)
  const [importMethod, setImportMethod] = useState<"file" | "paste" | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setImportText(content)
      }
      reader.readAsText(file)
    }
  }

  const clearFileSelection = () => {
    setSelectedFile(null)
    setImportText("")
    // 重置 input 的值，这样同一个文件可以再次选择
    const fileInput = document.getElementById("file-input") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const handleImportJSON = () => {
    try {
      const importedData = JSON.parse(importText)

      // Validate the data structure
      if (!importedData.groups || !Array.isArray(importedData.groups)) {
        throw new Error(t('import.errors.missingGroups'))
      }

      if (!importedData.standaloneBookmarks || !Array.isArray(importedData.standaloneBookmarks)) {
        throw new Error(t('import.errors.missingBookmarks'))
      }

      // Basic validation for groups and bookmarks
      importedData.groups.forEach((group: any, index: number) => {
        if (!group.id || !group.name || !Array.isArray(group.bookmarks)) {
          throw new Error(t('import.errors.invalidGroup', { index: (index + 1).toString() }))
        }
      })

      onImport(importedData)
      setImportText("")
      setImportStatus({ type: "success", message: t('import.success') })
      setImportMethod(null)
    } catch (error) {
      setImportStatus({
        type: "error",
        message: `${t('import.errors.failed')}: ${error instanceof Error ? error.message : t('common.unknownError')}`,
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
            const folderResult = processFolder(subDl, h3.textContent || t('import.newGroup'))
            if (folderResult.bookmarks.length > 0) {
              groups.push({
                id: generateId(),
                name: h3.textContent || t('import.newGroup'),
                bookmarks: folderResult.bookmarks
              })
            }
            // Add any sub-groups
            groups.push(...folderResult.groups)
          } else if (a) {
            // This is a bookmark
            bookmarks.push({
              id: generateId(),
              name: a.textContent || a.getAttribute("href") || t('import.untitledBookmark'),
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
        name: link.textContent || link.getAttribute("href") || t('import.untitledBookmark'),
        url: link.getAttribute("href") || "",
        favicon: getFavicon(link.getAttribute("href") || "")
      }))

      // Put all bookmarks in a single group if no structure found
      return {
        groups: bookmarks.length > 0 ? [{
          id: generateId(),
          name: t('import.importedBookmarks'),
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
        setImportStatus({ type: "success", message: t('import.browserSuccess') })
        setImportMethod(null)
      } else {
        handleImportJSON()
      }
    } catch (error) {
      setImportStatus({
        type: "error",
        message: `${t('import.errors.failed')}: ${error instanceof Error ? error.message : t('common.unknownError')}`,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Import Method Selection */}
      {!importMethod && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setImportMethod("file")}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <FileText className="w-8 h-8 text-primary" />
                <h3 className="font-medium">{t('import.fromFile.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('import.fromFile.description')}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setImportMethod("paste")}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Code className="w-8 h-8 text-primary" />
                <h3 className="font-medium">{t('import.fromPaste.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('import.fromPaste.description')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Interface */}
      {importMethod && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('import.title')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => {
                setImportMethod(null)
                setSelectedFile(null)
                setImportText("")
                setImportStatus(null)
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {importMethod === "file" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-input">{t('import.fromFile.label')}</Label>
                  <input
                    type="file"
                    id="file-input"
                    accept=".html,.json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById("file-input")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t('import.fromFile.button')}
                  </Button>
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm truncate">{selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={clearFileSelection}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="import-text">{t('import.fromPaste.label')}</Label>
                <Textarea
                  id="import-text"
                  placeholder={t('import.fromPaste.placeholder')}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            )}

            {(importText || selectedFile) && (
              <Button className="w-full" onClick={handleBrowserBookmarksImport}>
                {t('import.button')}
              </Button>
            )}

            {importStatus && (
              <Alert variant={importStatus.type === "error" ? "destructive" : "default"}>
                <AlertDescription>{importStatus.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function ImportExport({ data, onImport }: ImportExportProps) {
  const { t } = useLanguage();
  
  const exportToHTML = () => {
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>${t('export.title')}</TITLE>
<H1>${t('export.title')}</H1>
<DL><p>\n`

    // Add groups
    data.groups.forEach(group => {
      html += `  <DT><H3>${group.name}</H3>\n  <DL><p>\n`
      group.bookmarks.forEach(bookmark => {
        html += `    <DT><A HREF="${bookmark.url}">${bookmark.name}</A>\n`
      })
      html += '  </DL><p>\n'
    })

    // Add standalone bookmarks
    if (data.standaloneBookmarks.length > 0) {
      html += `  <DT><H3>${t('export.standaloneGroup')}</H3>\n  <DL><p>\n`
      data.standaloneBookmarks.forEach(bookmark => {
        html += `    <DT><A HREF="${bookmark.url}">${bookmark.name}</A>\n`
      })
      html += '  </DL><p>\n'
    }

    html += '</DL><p>'

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToJSON = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Export Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('export.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={exportToJSON}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Download className="w-8 h-8 text-primary" />
                <h3 className="font-medium">{t('export.toJSON.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('export.toJSON.description')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={exportToHTML}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Download className="w-8 h-8 text-primary" />
                <h3 className="font-medium">{t('export.toHTML.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('export.toHTML.description')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Import Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('import.title')}</h2>
        <ImportBookmarks onImport={onImport} />
      </div>
    </div>
  )
}

// 生成HTML格式的书签
function generateBookmarksHTML(data: { bookmarks: Bookmark[] }): string {
  const generateBookmarkHTML = (bookmark: Bookmark): string => {
    return `    <DT><A HREF="${bookmark.url}" ADD_DATE="${Math.floor(Date.now() / 1000)}">${bookmark.name}</A>\n`
  }

  const header = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>\n`

  const footer = "</DL><p>\n"

  const bookmarksHTML = data.bookmarks.map(generateBookmarkHTML).join("")
  return header + bookmarksHTML + footer
}

// 导出组件
export function ExportBookmarks({ data }: { data: DashboardData }) {
  const { t } = useLanguage();

  const handleExportJSON = () => {
    // 检查书签数量
    const standaloneCount = data.standaloneBookmarks?.length || 0;
    const groupBookmarksCount = data.groups?.reduce((sum, group) => sum + (group.bookmarks?.length || 0), 0) || 0;
    const totalBookmarks = standaloneCount + groupBookmarksCount;

    if (totalBookmarks === 0) {
      toast({
        title: t('export.noBookmarks.title'),
        description: t('export.noBookmarks.description'),
        variant: "destructive",
      })
      return
    }

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bookmarks.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportHTML = () => {
    // 检查书签数量并收集所有书签
    const standaloneBookmarks = data.standaloneBookmarks || [];
    const groupBookmarks = data.groups?.reduce((acc, group) => [...acc, ...(group.bookmarks || [])], [] as Bookmark[]) || [];
    const allBookmarks = [...standaloneBookmarks, ...groupBookmarks];

    if (allBookmarks.length === 0) {
      toast({
        title: t('export.noBookmarks.title'),
        description: t('export.noBookmarks.description'),
        variant: "destructive",
      })
      return
    }

    const htmlContent = generateBookmarksHTML({ bookmarks: allBookmarks })
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bookmarks.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleExportJSON}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <Download className="w-8 h-8 text-primary" />
            <h3 className="font-medium">{t('export.toJSON.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('export.toJSON.description')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleExportHTML}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <Download className="w-8 h-8 text-primary" />
            <h3 className="font-medium">{t('export.toHTML.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('export.toHTML.description')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
