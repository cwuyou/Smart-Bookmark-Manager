"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/i18n/language-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DroppableStateSnapshot, DraggableStateSnapshot, DropResult } from "@hello-pangea/dnd"
import { Plus, Settings, Edit2, Trash2, GripVertical, FileJson, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { SearchBar } from "../components/search-bar"
import { ThemeSettings } from "../components/theme-settings"
import { ImportExport, ImportBookmarks } from "../components/import-export"
import { ThemeProvider, useTheme } from "../lib/theme-context"
import { CustomDialog, CustomDialogContent, CustomDialogHeader, CustomDialogTitle } from "../components/custom-dialog"
import { LanguageProvider } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"

export interface Bookmark {
  id: string
  name: string
  url: string
  favicon?: string
}

export interface Group {
  id: string
  name: string
  bookmarks: Bookmark[]
}

export interface DashboardData {
  groups: Group[]
  standaloneBookmarks: Bookmark[]
}

const DashboardContent: React.FC = () => {
  const { t, language } = useLanguage();
  const [isDraggingBookmark, setIsDraggingBookmark] = useState(false);
  const [data, setData] = useState<{
    groups: Group[];
    standaloneBookmarks: Bookmark[];
  }>({
    groups: [],
    standaloneBookmarks: []
  });
  const [isLoading, setIsLoading] = useState(true)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState("")
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false)
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false)
  const [bookmarkForm, setBookmarkForm] = useState({ name: "", url: "", targetGroupId: "" })
  const [editingBookmark, setEditingBookmark] = useState<{ bookmark: Bookmark; groupId?: string } | null>(null)
  const { theme } = useTheme()
  const router = useRouter()

  // Debug function
  const handleAddBookmarkClick = () => {
    console.log("Add bookmark button clicked")
    setIsAddBookmarkOpen(true)
  }

  const handleAddGroupClick = () => {
    console.log("Add group button clicked")
    setIsAddGroupOpen(true)
  }

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      const savedData = localStorage.getItem("dashboard-data")
      if (savedData) {
        try {
          setData(JSON.parse(savedData))
        } catch (error) {
          console.error("Failed to parse saved data:", error)
        }
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Save data to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("dashboard-data", JSON.stringify(data))
    }
  }, [data, isLoading])

  // 添加键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 如果正在编辑输入框，不触发快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + K: 打开搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Ctrl/Cmd + N: 新建书签
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setIsAddBookmarkOpen(true);
      }

      // Esc: 关闭弹窗
      if (e.key === 'Escape') {
        setIsAddBookmarkOpen(false);
        setIsAddGroupOpen(false);
        setEditingBookmark(null);
        setEditingGroup(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return "/placeholder.svg?height=32&width=32"
    }
  }

  const getPageTitle = async (url: string): Promise<string> => {
    try {
      // In a real implementation, you'd need a backend service to fetch page titles
      // due to CORS restrictions. For now, we'll extract domain name as fallback
      const domain = new URL(url).hostname.replace("www.", "")
      return domain.charAt(0).toUpperCase() + domain.slice(1)
    } catch {
      return "New Bookmark"
    }
  }

  const addGroup = () => {
    // Store the default name in current language
    const defaultNames = {
      en: 'New Group',
      zh: '新建分组'
    };
    const newGroup: Group = {
      id: generateId(),
      name: defaultNames[language as keyof typeof defaultNames],
      bookmarks: [],
    }
    setData((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup],
    }))
    setEditingGroup(newGroup.id)
    setEditingGroupName(newGroup.name)
    setIsAddGroupOpen(false)
  }

  const updateGroupName = (groupId: string, newName: string) => {
    setData((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => 
        group.id === groupId 
          ? { ...group, name: newName } 
          : group
      ),
    }))
  }

  // Function to get group name display
  const getGroupNameDisplay = (name: string): string => {
    const defaultNames = {
      en: 'New Group',
      zh: '新建分组'
    };
    
    // Check if the name is a default name in any language
    const isDefaultName = Object.values(defaultNames).includes(name);
    
    // If it is a default name, return the translation
    if (isDefaultName) {
      return t('groups.defaultName');
    }
    
    // Otherwise keep the original name
    return name;
  }

  const deleteGroup = (groupId: string, moveToStandalone: boolean = false) => {
    setData((prev) => {
      const groupToDelete = prev.groups.find((g) => g.id === groupId)
      if (!groupToDelete) return prev

      // First filter out the group from groups array
      const newGroups = prev.groups.filter((g) => g.id !== groupId)
      
      // Only move bookmarks to standalone if specified
      const newStandaloneBookmarks = moveToStandalone 
        ? [...prev.standaloneBookmarks, ...groupToDelete.bookmarks]
        : prev.standaloneBookmarks

      return {
        ...prev,
        groups: newGroups,
        standaloneBookmarks: newStandaloneBookmarks,
      }
    })
  }

  const deleteAllStandaloneBookmarks = () => {
    setData((prev) => ({
      ...prev,
      standaloneBookmarks: [],
    }))
  }

  const addBookmark = async (name: string, url: string, targetGroupId?: string) => {
    const finalName = name || (await getPageTitle(url))
    const newBookmark: Bookmark = {
      id: generateId(),
      name: finalName,
      url: url.startsWith("http") ? url : `https://${url}`,
      favicon: getFavicon(url),
    }

    setData((prev) => {
      if (targetGroupId) {
        return {
          ...prev,
          groups: prev.groups.map((group) =>
            group.id === targetGroupId ? { ...group, bookmarks: [...group.bookmarks, newBookmark] } : group,
          ),
        }
      } else {
        return {
          ...prev,
          standaloneBookmarks: [...prev.standaloneBookmarks, newBookmark],
        }
      }
    })

    setBookmarkForm({ name: "", url: "", targetGroupId: "" })
    setIsAddBookmarkOpen(false)
  }

  const updateBookmark = (bookmarkId: string, updates: Partial<Bookmark>, groupId?: string) => {
    setData((prev) => {
      if (groupId) {
        return {
          ...prev,
          groups: prev.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  bookmarks: group.bookmarks.map((bookmark) =>
                    bookmark.id === bookmarkId ? { ...bookmark, ...updates } : bookmark,
                  ),
                }
              : group,
          ),
        }
      } else {
        return {
          ...prev,
          standaloneBookmarks: prev.standaloneBookmarks.map((bookmark) =>
            bookmark.id === bookmarkId ? { ...bookmark, ...updates } : bookmark,
          ),
        }
      }
    })
  }

  const deleteBookmark = (bookmarkId: string, groupId?: string) => {
    setData((prev) => {
      if (groupId) {
        return {
          ...prev,
          groups: prev.groups.map((group) =>
            group.id === groupId ? { ...group, bookmarks: group.bookmarks.filter((b) => b.id !== bookmarkId) } : group,
          ),
        }
      } else {
        return {
          ...prev,
          standaloneBookmarks: prev.standaloneBookmarks.filter((b) => b.id !== bookmarkId),
        }
      }
    })
  }

  const onDragEnd = (result: DropResult) => {
    // Reset dragging state
    setIsDraggingBookmark(false);
    
    const { destination, source, draggableId, type } = result

    if (!destination) {
      // If dropped outside any droppable area, move to standalone
      if (type === "bookmark" && source.droppableId !== "standalone") {
        const sourceGroupId = source.droppableId
        const sourceGroup = data.groups.find(g => g.id === sourceGroupId)
        if (sourceGroup) {
          const bookmark = sourceGroup.bookmarks[source.index]
          setData(prev => ({
            ...prev,
            groups: prev.groups.map(g => 
              g.id === sourceGroupId 
                ? { ...g, bookmarks: g.bookmarks.filter((b, i) => i !== source.index) } 
                : g
            ),
            standaloneBookmarks: [...prev.standaloneBookmarks, bookmark]
          }))
        }
      }
      return
    }

    if (type === "group") {
      const newGroups = Array.from(data.groups)
      const [reorderedGroup] = newGroups.splice(source.index, 1)
      newGroups.splice(destination.index, 0, reorderedGroup)

      setData((prev) => ({ ...prev, groups: newGroups }))
      return
    }

    // Handle bookmark dragging
    const sourceGroupId = source.droppableId === "standalone" ? null : source.droppableId
    const destGroupId = destination.droppableId === "standalone" ? null : destination.droppableId

    // Find the bookmark being moved
    let bookmark: Bookmark
    if (sourceGroupId) {
      const sourceGroup = data.groups.find((g) => g.id === sourceGroupId)!
      bookmark = sourceGroup.bookmarks[source.index]
    } else {
      bookmark = data.standaloneBookmarks[source.index]
    }

    setData((prev) => {
      const newData = { ...prev }

      // Remove from source
      if (sourceGroupId) {
        newData.groups = newData.groups.map((group) =>
          group.id === sourceGroupId
            ? { ...group, bookmarks: group.bookmarks.filter((b) => b.id !== bookmark.id) }
            : group,
        )
      } else {
        newData.standaloneBookmarks = newData.standaloneBookmarks.filter((b) => b.id !== bookmark.id)
      }

      // Add to destination
      if (destGroupId) {
        newData.groups = newData.groups.map((group) =>
          group.id === destGroupId
            ? {
                ...group,
                bookmarks: [
                  ...group.bookmarks.slice(0, destination.index),
                  bookmark,
                  ...group.bookmarks.slice(destination.index),
                ],
              }
            : group,
        )
      } else {
        newData.standaloneBookmarks = [
          ...newData.standaloneBookmarks.slice(0, destination.index),
          bookmark,
          ...newData.standaloneBookmarks.slice(destination.index),
        ]
      }

      return newData
    })
  }

  const handleBookmarkClick = (bookmark: Bookmark) => {
    window.open(bookmark.url, "_blank")
  }

  const BookmarkItem = ({ bookmark, groupId, index }: { bookmark: Bookmark; groupId?: string; index: number }) => {
    return (
      <Draggable draggableId={bookmark.id} index={index}>
        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={cn(
              "group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors",
              { "bg-muted/50": snapshot.isDragging }
            )}
            onClick={() => window.open(bookmark.url, "_blank")}
          >
            <img
              src={bookmark.favicon || "/placeholder.svg?height=20&width=20"}
              alt=""
              className="w-5 h-5 rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg?height=20&width=20"
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{bookmark.name}</div>
              <div className="text-xs text-muted-foreground truncate">{bookmark.url}</div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingBookmark({ bookmark, groupId })
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('dialog.deleteBookmark.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('dialog.deleteBookmark.description').replace('{name}', bookmark.name)}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteBookmark(bookmark.id, groupId)}>
                      {t('common.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  console.log("Render - isAddBookmarkOpen:", isAddBookmarkOpen, "isAddGroupOpen:", isAddGroupOpen) // Debug log

  const handleImportData = (importedData: { groups: Group[]; standaloneBookmarks: Bookmark[] }) => {
    setData(importedData);
  };

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{
        background: "var(--bg-image, var(--background))",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        fontSize: "var(--base-font-size, 16px)",
      }}
    >
      {/* Add backdrop overlay for better readability when background image is used */}
      <div className="min-h-screen bg-background/10 backdrop-blur-[1px]">
        {/* Floating tooltip for drag and drop */}
        {isDraggingBookmark && (
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg 
                     px-4 py-2 pointer-events-none z-50 animate-in fade-in"
          >
            <div className="flex items-center gap-2 text-sm">
              <span>{t('dragAndDrop.moveToStandalone')}</span>
            </div>
          </div>
        )}
        
        {/* Navbar */}
        <Navbar 
          showSearch={true}
          onAddBookmark={handleAddBookmarkClick}
          onAddGroup={handleAddGroupClick}
          data={data}
          onBookmarkClick={handleBookmarkClick}
        />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : data.groups.length === 0 && data.standaloneBookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="max-w-lg space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">{t('empty.title')}</h2>
                  <p className="text-muted-foreground">{t('empty.description')}</p>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => setIsAddBookmarkOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('empty.addFirstBookmark')}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddGroupOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('empty.createGroup')}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t('empty.or')}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="h-auto p-0 text-sm">
                        {t('empty.importFromBrowser')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
                      <DialogHeader>
                        <DialogTitle>{t('import.title')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <ImportBookmarks onImport={setData} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="mt-8 max-w-lg mx-auto">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <h4 className="font-medium text-foreground">{t('empty.quickStart.title')}：</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>{t('empty.quickStart.addBookmark')}</li>
                      <li>{t('empty.quickStart.createGroup')}</li>
                      <li>{t('empty.quickStart.importBookmarks')}</li>
                      <li>{t('empty.quickStart.dragAndDrop')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <DragDropContext 
              onDragEnd={onDragEnd}
              onDragStart={(start) => {
                if (start.type === "bookmark") {
                  setIsDraggingBookmark(true);
                }
              }}
              onDragUpdate={(update) => {
                // Only show the tooltip when dragging outside of any droppable
                setIsDraggingBookmark(!update.destination);
              }}
            >
              {/* Groups */}
              <Droppable droppableId="groups" type="group" direction="horizontal">
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {data.groups.map((group, index) => (
                      <Draggable key={group.id} draggableId={group.id} index={index}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <Card>
                              <CardHeader className="p-4">
                                <div className="flex items-center gap-2">
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                  {editingGroup === group.id ? (
                                    <form
                                      onSubmit={(e) => {
                                        e.preventDefault()
                                        updateGroupName(group.id, editingGroupName)
                                        setEditingGroup(null)
                                      }}
                                      className="flex-1"
                                    >
                                      <Input
                                        value={editingGroupName}
                                        onChange={(e) => setEditingGroupName(e.target.value)}
                                        className="h-7"
                                        autoFocus
                                        onBlur={() => {
                                          updateGroupName(group.id, editingGroupName)
                                          setEditingGroup(null)
                                        }}
                                      />
                                    </form>
                                  ) : (
                                    <div
                                      className="flex-1 font-medium cursor-pointer hover:underline"
                                      onClick={() => {
                                        setEditingGroup(group.id)
                                        setEditingGroupName(group.name)
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span>
                                          {getGroupNameDisplay(group.name)}
                                        </span>
                                        <Badge variant="secondary" className="text-xs font-normal">
                                          {group.bookmarks.length}
                                        </Badge>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => {
                                        setBookmarkForm({ name: "", url: "", targetGroupId: group.id })
                                        setIsAddBookmarkOpen(true)
                                      }}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>{t('dialog.deleteGroup.title')}</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            {group.bookmarks.length > 0 
                                              ? t('dialog.deleteGroup.description')
                                                  .replace('{name}', group.name)
                                                  .replace('{count}', String(group.bookmarks.length))
                                              : t('dialog.deleteGroup.emptyDescription')
                                                  .replace('{name}', group.name)
                                            }
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                          {group.bookmarks.length > 0 ? (
                                            <>
                                              <Button variant="outline" onClick={() => deleteGroup(group.id, true)}>
                                                {t('dialog.deleteGroup.moveToStandalone')}
                                              </Button>
                                              <AlertDialogAction onClick={() => deleteGroup(group.id, false)}>
                                                {t('dialog.deleteGroup.deleteAll')}
                                              </AlertDialogAction>
                                            </>
                                          ) : (
                                            <AlertDialogAction onClick={() => deleteGroup(group.id, false)}>
                                              {t('common.delete')}
                                            </AlertDialogAction>
                                          )}
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <Droppable droppableId={group.id} type="bookmark">
                                  {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={cn(
                                        "space-y-1 min-h-[60px] max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent",
                                        { "bg-muted/30 rounded-lg p-2": snapshot.isDraggingOver }
                                      )}
                                    >
                                      {group.bookmarks.map((bookmark, index) => (
                                        <BookmarkItem
                                          key={bookmark.id}
                                          bookmark={bookmark}
                                          groupId={group.id}
                                          index={index}
                                        />
                                      ))}
                                      {provided.placeholder}
                                      {group.bookmarks.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                          {t('group.emptyState')}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Droppable>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Standalone Bookmarks */}
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold">{t('standalone.title')}</div>
                      <span className="text-sm text-muted-foreground">
                        {data.standaloneBookmarks.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsAddBookmarkOpen(true)}
                        className="opacity-100" // Always visible
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="opacity-100" // Always visible
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('dialog.deleteBookmarks.title')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {data.standaloneBookmarks.length > 0 
                                ? t('dialog.deleteBookmarks.description')
                                : t('dialog.deleteBookmarks.emptyDescription')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={deleteAllStandaloneBookmarks}
                              disabled={data.standaloneBookmarks.length === 0}
                            >
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="standalone" type="bookmark">
                    {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "space-y-1 min-h-[60px] max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent",
                          { "bg-muted/30 rounded-lg p-2": snapshot.isDraggingOver }
                        )}
                      >
                        {data.standaloneBookmarks.map((bookmark, index) => (
                          <BookmarkItem
                            key={bookmark.id}
                            bookmark={bookmark}
                            index={index}
                          />
                        ))}
                        {provided.placeholder}
                        {data.standaloneBookmarks.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            {t('standalone.emptyState')}
                            <div className="mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsAddBookmarkOpen(true)}
                                className="text-primary hover:text-primary/80"
                              >
                                {t('empty.addFirstBookmark')}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </DragDropContext>
          )}
        </main>
      </div>

      {/* Custom Dialogs */}
      <CustomDialog open={isAddBookmarkOpen} onOpenChange={setIsAddBookmarkOpen}>
        <CustomDialogContent>
          <CustomDialogHeader>
            <CustomDialogTitle>{t('dialog.addBookmark.title')}</CustomDialogTitle>
          </CustomDialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <Label htmlFor="url">{t('dialog.addBookmark.url')} *</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={bookmarkForm.url}
                onChange={(e) => setBookmarkForm((prev) => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="name">{t('dialog.addBookmark.name')}</Label>
              <Input
                id="name"
                placeholder={t('dialog.addBookmark.namePlaceholder')}
                value={bookmarkForm.name}
                onChange={(e) => setBookmarkForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddBookmarkOpen(false)
                  setBookmarkForm({ name: "", url: "", targetGroupId: "" })
                }}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="default"
                onClick={() =>
                  addBookmark(bookmarkForm.name, bookmarkForm.url, bookmarkForm.targetGroupId || undefined)
                }
                disabled={!bookmarkForm.url}
                className="flex-1"
              >
                {t('common.confirm')}
              </Button>
            </div>
          </div>
        </CustomDialogContent>
      </CustomDialog>

      <CustomDialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
        <CustomDialogContent>
          <CustomDialogHeader>
            <CustomDialogTitle>{t('dialog.addGroup.title')}</CustomDialogTitle>
          </CustomDialogHeader>
          <div className="px-6 pb-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('dialog.addGroup.description')}
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAddGroupOpen(false)} className="flex-1">
                {t('common.cancel')}
              </Button>
              <Button variant="default" onClick={addGroup} className="flex-1">
                {t('common.confirm')}
              </Button>
            </div>
          </div>
        </CustomDialogContent>
      </CustomDialog>

      {/* Edit Bookmark Dialog */}
      {editingBookmark && (
        <CustomDialog open={!!editingBookmark} onOpenChange={() => setEditingBookmark(null)}>
          <CustomDialogContent>
            <CustomDialogHeader>
              <CustomDialogTitle>{t('dialog.editBookmark.title')}</CustomDialogTitle>
            </CustomDialogHeader>
            <div className="px-6 pb-6 space-y-4">
              <div>
                <Label htmlFor="edit-url">{t('dialog.editBookmark.url')}</Label>
                <Input
                  id="edit-url"
                  value={editingBookmark.bookmark.url}
                  onChange={(e) =>
                    setEditingBookmark((prev) =>
                      prev
                        ? {
                            ...prev,
                            bookmark: { ...prev.bookmark, url: e.target.value },
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-name">{t('dialog.editBookmark.name')}</Label>
                <Input
                  id="edit-name"
                  value={editingBookmark.bookmark.name}
                  onChange={(e) =>
                    setEditingBookmark((prev) =>
                      prev
                        ? {
                            ...prev,
                            bookmark: { ...prev.bookmark, name: e.target.value },
                          }
                        : null,
                    )
                  }
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingBookmark(null)} className="flex-1">
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    updateBookmark(
                      editingBookmark.bookmark.id,
                      {
                        name: editingBookmark.bookmark.name,
                        url: editingBookmark.bookmark.url,
                        favicon: getFavicon(editingBookmark.bookmark.url),
                      },
                      editingBookmark.groupId,
                    )
                    setEditingBookmark(null)
                  }}
                  className="flex-1"
                >
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </CustomDialogContent>
        </CustomDialog>
      )}
    </div>
  )
}

export default function Dashboard() {
  return <DashboardContent />
}
