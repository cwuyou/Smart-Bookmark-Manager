"use client"

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult, type DroppableProvided, type DroppableStateSnapshot, type DraggableProvided, type DraggableStateSnapshot } from "@hello-pangea/dnd"
import { Plus, Settings, Edit2, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
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

function DashboardContent() {
  const [data, setData] = useState<DashboardData>({
    groups: [],
    standaloneBookmarks: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState("")
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false)
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [bookmarkForm, setBookmarkForm] = useState({ name: "", url: "", targetGroupId: "" })
  const [editingBookmark, setEditingBookmark] = useState<{ bookmark: Bookmark; groupId?: string } | null>(null)
  const { theme } = useTheme()

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
        setIsSettingsOpen(false);
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
    const newGroup: Group = {
      id: generateId(),
      name: "新分组",
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
      groups: prev.groups.map((group) => (group.id === groupId ? { ...group, name: newName } : group)),
    }))
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
    const { destination, source, draggableId, type } = result

    if (!destination) return

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

  const BookmarkItem = ({ bookmark, groupId, index }: { bookmark: Bookmark; groupId?: string; index: number }) => (
    <Draggable draggableId={bookmark.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
            snapshot.isDragging ? "bg-muted shadow-lg" : ""
          }`}
          onClick={() => window.open(bookmark.url, "_blank")}
        >
          <img
            src={bookmark.favicon || "/placeholder.svg?height=24&width=24"}
            alt=""
            className="w-6 h-6 rounded-sm"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=24&width=24"
            }}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex-1 text-sm truncate">{bookmark.name}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs break-words">{bookmark.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                setEditingBookmark({ bookmark, groupId })
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>删除书签</AlertDialogTitle>
                  <AlertDialogDescription>确定要删除书签 "{bookmark.name}" 吗？此操作无法撤销。</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()}>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={(e) => {
                    e.stopPropagation()
                    deleteBookmark(bookmark.id, groupId)
                  }}>删除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </Draggable>
  )

  console.log("Render - isAddBookmarkOpen:", isAddBookmarkOpen, "isAddGroupOpen:", isAddGroupOpen) // Debug log

  // 添加一个处理导入数据的函数
  const handleImportData = (importedData: DashboardData | ((prev: DashboardData) => DashboardData)) => {
    setData(prevData => {
      // 如果 importedData 是函数，直接使用它
      if (typeof importedData === 'function') {
        return importedData(prevData);
      }
      
      // 否则，合并数据
      return {
        groups: [...prevData.groups, ...importedData.groups],
        standaloneBookmarks: [...prevData.standaloneBookmarks, ...importedData.standaloneBookmarks]
      };
    });
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
        {/* Header */}
        <header className="border-b bg-card/90 backdrop-blur-sm sticky top-0 z-30">
          <div className="container mx-auto px-4 py-3">
            {/* Top row with logo and actions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">BM</span>
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold whitespace-nowrap">Smart Bookmark Manager</h1>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">智能且有序的书签管理工具</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Simple button test */}
                <Button variant="outline" size="sm" onClick={handleAddBookmarkClick}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加书签
                </Button>

                <Button variant="outline" size="sm" onClick={handleAddGroupClick}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加分组
                </Button>

                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
                    <DialogHeader>
                      <DialogTitle>设置</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">主题与个性化</h3>
                        <ThemeSettings />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4">导入/导出</h3>
                        <ImportExport data={data} onImport={handleImportData} />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Bottom row with search */}
            <div className="flex justify-center">
              <SearchBar
                groups={data.groups}
                standaloneBookmarks={data.standaloneBookmarks}
                onBookmarkClick={handleBookmarkClick}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              {/* Groups */}
              <Droppable droppableId="groups" type="group" direction="horizontal">
                {(provided) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {data.groups.map((group, index) => (
                      <Draggable key={group.id} draggableId={group.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`mb-4 ${snapshot.isDragging ? "shadow-lg" : ""}`}
                          >
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
                                      <span>{group.name}</span>
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
                                        <AlertDialogTitle>删除分组</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          {group.bookmarks.length > 0 
                                            ? `确定要删除分组 "${group.name}" 吗？请选择如何处理分组内的 ${group.bookmarks.length} 个书签：`
                                            : `确定要删除空分组 "${group.name}" 吗？`
                                          }
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                                        <AlertDialogCancel className="sm:flex-1">取消</AlertDialogCancel>
                                        {group.bookmarks.length > 0 ? (
                                          <>
                                            <Button
                                              variant="outline"
                                              className="sm:flex-1"
                                              onClick={() => {
                                                deleteGroup(group.id, true)
                                              }}
                                            >
                                              移动到独立书签
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              className="sm:flex-1"
                                              onClick={() => {
                                                deleteGroup(group.id, false)
                                              }}
                                            >
                                              删除所有书签
                                            </Button>
                                          </>
                                        ) : (
                                          <Button
                                            variant="destructive"
                                            className="sm:flex-1"
                                            onClick={() => {
                                              deleteGroup(group.id, false)
                                            }}
                                          >
                                            删除分组
                                          </Button>
                                        )}
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <Droppable droppableId={group.id} type="bookmark">
                                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
                                  const containerStyle = {
                                    height: group.bookmarks.length === 0 ? '60px' : 'auto'
                                  };
                                  
                                  return (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`space-y-1 min-h-[60px] max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent ${
                                        snapshot.isDraggingOver ? "bg-muted/30 rounded-lg p-2" : "p-2"
                                      }`}
                                      style={containerStyle}
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
                                        <div className="h-full flex items-center justify-center text-center text-muted-foreground text-sm">
                                          拖拽书签到此处或点击上方 + 按钮添加
                                        </div>
                                      )}
                                    </div>
                                  );
                                }}
                              </Droppable>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Standalone Bookmarks */}
              {data.standaloneBookmarks.length > 0 && (
                <Card>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">独立书签</h3>
                        <Badge variant="secondary" className="text-xs font-normal">
                          {data.standaloneBookmarks.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setBookmarkForm({ name: "", url: "", targetGroupId: "" })
                            setIsAddBookmarkOpen(true)
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        {data.standaloneBookmarks.length > 0 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>清空独立书签</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除所有独立书签吗？此操作将删除 {data.standaloneBookmarks.length} 个书签，且无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={deleteAllStandaloneBookmarks}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="standalone" type="bookmark" direction="horizontal">
                      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
                        const containerStyle = {
                          height: data.standaloneBookmarks.length === 0 ? '60px' : 'auto'
                        };
                        
                        return (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex flex-wrap gap-2 min-h-[60px] max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent ${
                              snapshot.isDraggingOver ? "bg-muted/30 rounded-lg p-2" : "p-2"
                            }`}
                            style={containerStyle}
                          >
                            {data.standaloneBookmarks.map((bookmark, index) => (
                              <div key={bookmark.id} className="w-full sm:w-auto">
                                <BookmarkItem bookmark={bookmark} index={index} />
                              </div>
                            ))}
                            {provided.placeholder}
                            {data.standaloneBookmarks.length === 0 && (
                              <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground text-sm">
                                拖拽书签到此处或点击上方 + 按钮添加
                              </div>
                            )}
                          </div>
                        );
                      }}
                    </Droppable>
                  </CardContent>
                </Card>
              )}
            </DragDropContext>
          )}

          {/* Empty State */}
          {data.groups.length === 0 && data.standaloneBookmarks.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">开始构建您的专属导航</h2>
              <p className="text-muted-foreground mb-6">添加书签和分组，打造高效的个人工作台</p>
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                  <Button onClick={() => setIsAddBookmarkOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    添加第一个书签
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddGroupOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    创建分组
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>或者</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="h-auto p-0 text-sm">
                        从浏览器导入书签
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
                      <DialogHeader>
                        <DialogTitle>导入书签</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <ImportBookmarks onImport={setData} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="mt-8 max-w-lg mx-auto">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <h4 className="font-medium text-foreground">快速上手指南：</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>直接添加单个书签</li>
                      <li>创建分组来组织相关书签</li>
                      <li>从浏览器导入现有书签</li>
                      <li>拖拽调整书签和分组顺序</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Custom Dialogs */}
        <CustomDialog open={isAddBookmarkOpen} onOpenChange={setIsAddBookmarkOpen}>
          <CustomDialogContent>
            <CustomDialogHeader>
              <CustomDialogTitle>添加书签</CustomDialogTitle>
            </CustomDialogHeader>
            <div className="px-6 pb-6 space-y-4">
              <div>
                <Label htmlFor="url">网址 (URL) *</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={bookmarkForm.url}
                  onChange={(e) => setBookmarkForm((prev) => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="name">名称 (可选)</Label>
                <Input
                  id="name"
                  placeholder="留空将自动获取网页标题"
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
                  取消
                </Button>
                <Button
                  variant="default"
                  onClick={() =>
                    addBookmark(bookmarkForm.name, bookmarkForm.url, bookmarkForm.targetGroupId || undefined)
                  }
                  disabled={!bookmarkForm.url}
                  className="flex-1"
                >
                  确定
                </Button>
              </div>
            </div>
          </CustomDialogContent>
        </CustomDialog>

        <CustomDialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
          <CustomDialogContent>
            <CustomDialogHeader>
              <CustomDialogTitle>添加分组</CustomDialogTitle>
            </CustomDialogHeader>
            <div className="px-6 pb-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                将创建一个新的分组容器，您可以将书签拖拽到其中进行分类管理。
              </p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsAddGroupOpen(false)} className="flex-1">
                  取消
                </Button>
                <Button variant="default" onClick={addGroup} className="flex-1">
                  确定
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
                <CustomDialogTitle>编辑书签</CustomDialogTitle>
              </CustomDialogHeader>
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <Label htmlFor="edit-url">网址 (URL)</Label>
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
                  <Label htmlFor="edit-name">名称</Label>
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
                    取消
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
                    保存
                  </Button>
                </div>
              </div>
            </CustomDialogContent>
          </CustomDialog>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  )
}
