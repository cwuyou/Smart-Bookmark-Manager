"use client"

import React, { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface DragDropItem {
  id: string
  [key: string]: any
}

interface CustomDragDropProps {
  items: DragDropItem[]
  onReorder: (newItems: DragDropItem[]) => void
  renderItem: (item: DragDropItem, index: number, isDragging: boolean) => React.ReactNode
  className?: string
  itemClassName?: string
  cols?: {
    default: number
    md?: number
    lg?: number
  }
}

export const CustomDragDrop: React.FC<CustomDragDropProps> = ({
  items,
  onReorder,
  renderItem,
  className = '',
  itemClassName = '',
  cols = { default: 1, md: 2, lg: 3 }
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', index.toString())
    e.dataTransfer.effectAllowed = 'move'
    
    // 创建自定义拖拽预览
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = 'rotate(3deg) scale(0.8)'
    dragImage.style.opacity = '0.9'
    dragImage.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
    dragImage.style.borderRadius = '8px'
    dragImage.style.border = '2px solid #3b82f6'
    dragImage.style.maxWidth = '350px' // 适中的最大宽度
    dragImage.style.minWidth = '250px' // 确保最小宽度
    dragImage.style.width = 'auto'
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px' // 移到屏幕外
    dragImage.style.left = '-1000px'
    document.body.appendChild(dragImage)
    
    // 计算鼠标在卡片中的相对位置
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    
    e.dataTransfer.setDragImage(dragImage, offsetX * 0.8, offsetY * 0.8)
    
    // 延迟移除临时元素
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null)
    setDragOverIndex(null)
    setIsDragging(false)
    
    // 恢复样式
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = (e: React.DragEvent, index: number) => {
    // 只有当鼠标真正离开元素时才移除高亮
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (dragOverIndex === index) {
        setDragOverIndex(null)
      }
    }
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'))
    
    if (sourceIndex !== targetIndex && sourceIndex >= 0 && targetIndex >= 0) {
      const newItems = [...items]
      const [draggedItem] = newItems.splice(sourceIndex, 1)
      newItems.splice(targetIndex, 0, draggedItem)
      
      onReorder(newItems)
    }
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // 生成响应式网格类名
  const getGridClassName = () => {
    const baseClass = 'grid gap-6'
    const colsClass = `grid-cols-${cols.default}`
    const mdClass = cols.md ? `md:grid-cols-${cols.md}` : ''
    const lgClass = cols.lg ? `lg:grid-cols-${cols.lg}` : ''
    
    return cn(baseClass, colsClass, mdClass, lgClass)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        getGridClassName(),
        'min-h-[400px] p-5',
        {
          'bg-gradient-to-br from-blue-50/40 to-purple-50/40 border-2 border-dashed border-blue-400/60 rounded-lg shadow-inner': isDragging
        },
        className
      )}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragLeave={(e) => handleDragLeave(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          className={cn(
            'cursor-grab transition-all duration-200 hover:shadow-lg',
            {
              'scale-105 ring-4 ring-emerald-400/80 shadow-2xl bg-gradient-to-br from-emerald-50/90 to-blue-50/90 border-2 border-emerald-400/60': dragOverIndex === index,
              'opacity-70 scale-95 rotate-2 shadow-2xl z-50': draggedIndex === index,
            },
            itemClassName
          )}
          style={{
            transform: draggedIndex === index 
              ? 'rotate(2deg) scale(0.95)' 
              : dragOverIndex === index 
                ? 'scale(1.05)' 
                : 'none'
          }}
        >
          {renderItem(item, index, draggedIndex === index)}
        </div>
      ))}
    </div>
  )
}

export default CustomDragDrop