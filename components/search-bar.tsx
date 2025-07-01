"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Bookmark, Group } from "../app/page"

interface SearchBarProps {
  groups: Group[]
  standaloneBookmarks: Bookmark[]
  onBookmarkClick: (bookmark: Bookmark) => void
}

export function SearchBar({ groups, standaloneBookmarks, onBookmarkClick }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    const results: Array<{ bookmark: Bookmark; groupName?: string }> = []

    // Search in groups
    groups.forEach((group) => {
      group.bookmarks.forEach((bookmark) => {
        if (bookmark.name.toLowerCase().includes(query) || bookmark.url.toLowerCase().includes(query)) {
          results.push({ bookmark, groupName: group.name })
        }
      })
    })

    // Search in standalone bookmarks
    standaloneBookmarks.forEach((bookmark) => {
      if (bookmark.name.toLowerCase().includes(query) || bookmark.url.toLowerCase().includes(query)) {
        results.push({ bookmark })
      }
    })

    return results
  }, [searchQuery, groups, standaloneBookmarks])

  const handleBookmarkClick = (bookmark: Bookmark) => {
    onBookmarkClick(bookmark)
    setSearchQuery("")
    setIsSearchFocused(false)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setIsSearchFocused(false)
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="搜索书签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearSearch}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {isSearchFocused && searchQuery && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.bookmark.id}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleBookmarkClick(result.bookmark)}
                  >
                    <img
                      src={result.bookmark.favicon || "/placeholder.svg?height=20&width=20"}
                      alt=""
                      className="w-5 h-5 rounded-sm"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=20&width=20"
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{result.bookmark.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{result.bookmark.url}</div>
                    </div>
                    {result.groupName && (
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">{result.groupName}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">没有找到匹配的书签</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Backdrop to close search */}
      {isSearchFocused && <div className="fixed inset-0 z-40" onClick={() => setIsSearchFocused(false)} />}
    </div>
  )
}
