import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/lib/i18n/language-context"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import type { Bookmark, Group } from "@/app/page"

interface BatchMoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group
  allGroups: Group[]
  onMoveBookmarks: (bookmarks: Bookmark[], targetGroupId: string) => void
}

export function BatchMoveDialog({
  open,
  onOpenChange,
  group,
  allGroups,
  onMoveBookmarks
}: BatchMoveDialogProps) {
  const { t } = useLanguage()
  const [targetGroupId, setTargetGroupId] = useState<string>("")
  const [leftSelectedBookmarks, setLeftSelectedBookmarks] = useState<Set<string>>(new Set())
  const [rightSelectedBookmarks, setRightSelectedBookmarks] = useState<Set<string>>(new Set())
  const [movedBookmarks, setMovedBookmarks] = useState<Bookmark[]>([])
  const [remainingBookmarks, setRemainingBookmarks] = useState<Bookmark[]>([])

  // 重置状态
  const resetState = () => {
    setTargetGroupId("")
    setLeftSelectedBookmarks(new Set())
    setRightSelectedBookmarks(new Set())
    setMovedBookmarks([])
    setRemainingBookmarks(group.bookmarks)
  }

  // 监听 group 变化和对话框打开状态
  useEffect(() => {
    if (open) {
      resetState()
    }
  }, [open, group])

  // 当对话框关闭时重置状态
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
  }

  // 可选的目标分组（排除当前分组）
  const availableGroups = useMemo(() => {
    // 添加独立书签作为一个特殊选项
    const standaloneOption = {
      id: "standalone",
      name: t('standalone.title')
    };
    
    // 如果当前不是独立书签，则添加独立书签选项
    const groups = allGroups.filter(g => g.id !== group.id);
    return group.id === "standalone" ? groups : [standaloneOption, ...groups];
  }, [allGroups, group.id, t]);

  // 全选/反选左侧书签
  const handleLeftSelectAll = (select: boolean) => {
    if (select) {
      setLeftSelectedBookmarks(new Set(remainingBookmarks.map(b => b.id)))
    } else {
      setLeftSelectedBookmarks(new Set())
    }
  }

  // 全选/反选右侧书签
  const handleRightSelectAll = (select: boolean) => {
    if (select) {
      setRightSelectedBookmarks(new Set(movedBookmarks.map(b => b.id)))
    } else {
      setRightSelectedBookmarks(new Set())
    }
  }

  // 移动选中的书签到右侧
  const handleMoveToRight = () => {
    const bookmarksToMove = remainingBookmarks.filter(b => leftSelectedBookmarks.has(b.id))
    setMovedBookmarks([...movedBookmarks, ...bookmarksToMove])
    setRemainingBookmarks(remainingBookmarks.filter(b => !leftSelectedBookmarks.has(b.id)))
    setLeftSelectedBookmarks(new Set())
  }

  // 移动选中的书签到左侧
  const handleMoveToLeft = () => {
    const bookmarksToMove = movedBookmarks.filter(b => rightSelectedBookmarks.has(b.id))
    setRemainingBookmarks([...remainingBookmarks, ...bookmarksToMove])
    setMovedBookmarks(movedBookmarks.filter(b => !rightSelectedBookmarks.has(b.id)))
    setRightSelectedBookmarks(new Set())
  }

  // 确认移动书签
  const handleConfirm = () => {
    if (targetGroupId && movedBookmarks.length > 0) {
      onMoveBookmarks(movedBookmarks, targetGroupId)
      handleOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <TooltipProvider>
          <DialogHeader>
            <DialogTitle>{t('batchMove.title')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 目标分组选择 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('batchMove.targetGroup')}:</span>
              <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('batchMove.selectGroup')} />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups.map(g => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 书签选择区域 */}
            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 min-h-[400px]">
              {/* 左侧：当前分组书签 */}
              <div className="min-w-0 border rounded-lg p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium truncate max-w-[200px]">{group.name}</h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeftSelectAll(true)}
                    >
                      {t('common.selectAll')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeftSelectAll(false)}
                    >
                      {t('common.deselectAll')}
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2 pr-4">
                    {remainingBookmarks.map(bookmark => (
                      <div key={bookmark.id} className="flex items-center gap-2 w-full min-w-0">
                        <Checkbox
                          checked={leftSelectedBookmarks.has(bookmark.id)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(leftSelectedBookmarks)
                            if (checked) {
                              newSelected.add(bookmark.id)
                            } else {
                              newSelected.delete(bookmark.id)
                            }
                            setLeftSelectedBookmarks(newSelected)
                          }}
                          className="flex-shrink-0"
                        />
                        <img
                          src={bookmark.favicon || "/placeholder.svg"}
                          alt=""
                          className="w-4 h-4 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg"
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm truncate block cursor-default">
                                {bookmark.name}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{bookmark.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* 中间：操作按钮 */}
              <div className="flex flex-col items-center justify-center gap-4">
                <Button
                  size="icon"
                  onClick={handleMoveToRight}
                  disabled={leftSelectedBookmarks.size === 0 || !targetGroupId}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={handleMoveToLeft}
                  disabled={rightSelectedBookmarks.size === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>

              {/* 右侧：待移动书签 */}
              <div className="min-w-0 border rounded-lg p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium truncate max-w-[200px]">{t('batchMove.selectedBookmarks')}</h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRightSelectAll(true)}
                    >
                      {t('common.selectAll')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRightSelectAll(false)}
                    >
                      {t('common.deselectAll')}
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2 pr-4">
                    {movedBookmarks.map(bookmark => (
                      <div key={bookmark.id} className="flex items-center gap-2 w-full min-w-0">
                        <Checkbox
                          checked={rightSelectedBookmarks.has(bookmark.id)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(rightSelectedBookmarks)
                            if (checked) {
                              newSelected.add(bookmark.id)
                            } else {
                              newSelected.delete(bookmark.id)
                            }
                            setRightSelectedBookmarks(newSelected)
                          }}
                          className="flex-shrink-0"
                        />
                        <img
                          src={bookmark.favicon || "/placeholder.svg"}
                          alt=""
                          className="w-4 h-4 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg"
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm truncate block cursor-default">
                                {bookmark.name}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{bookmark.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!targetGroupId || movedBookmarks.length === 0}
              >
                {t('common.confirm')}
              </Button>
            </div>
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  )
} 