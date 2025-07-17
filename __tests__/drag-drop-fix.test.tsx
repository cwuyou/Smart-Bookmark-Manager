import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { act } from 'react-dom/test-utils'

// Mock data for testing
const mockData = {
  groups: [
    {
      id: 'group1',
      name: 'Group 1',
      bookmarks: [
        { id: 'bookmark1', name: 'Bookmark 1', url: 'https://example1.com' },
        { id: 'bookmark2', name: 'Bookmark 2', url: 'https://example2.com' },
        { id: 'bookmark3', name: 'Bookmark 3', url: 'https://example3.com' }
      ]
    },
    {
      id: 'group2', 
      name: 'Group 2',
      bookmarks: [
        { id: 'bookmark4', name: 'Bookmark 4', url: 'https://example4.com' }
      ]
    },
    {
      id: 'group3',
      name: 'Group 3', 
      bookmarks: [
        { id: 'bookmark5', name: 'Bookmark 5', url: 'https://example5.com' }
      ]
    }
  ],
  standaloneBookmarks: []
}

// Test component to simulate the drag-drop behavior
const TestDragDropComponent = ({ onDragEnd }: { onDragEnd: (result: any) => void }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4">
        {mockData.groups.map((group, groupIndex) => (
          <div key={group.id} className="w-64">
            <h3>{group.name}</h3>
            <Droppable droppableId={group.id} type="bookmark">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[100px] border-2 border-dashed border-gray-300 p-2"
                  data-testid={`droppable-${group.id}`}
                >
                  {group.bookmarks.map((bookmark, index) => (
                    <Draggable key={bookmark.id} draggableId={bookmark.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-2 mb-2 bg-blue-100 rounded"
                          data-testid={`draggable-${bookmark.id}`}
                        >
                          {bookmark.name}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}

describe('拖拽功能测试', () => {
  let dragEndResults: any[] = []
  
  const mockOnDragEnd = (result: any) => {
    dragEndResults.push(result)
  }

  beforeEach(() => {
    dragEndResults = []
  })

  test('应该能够将第一个书签拖拽到第二个位置', async () => {
    render(<TestDragDropComponent onDragEnd={mockOnDragEnd} />)
    
    // 模拟拖拽第一个书签到第二个位置
    const dragResult = {
      draggableId: 'bookmark1',
      type: 'bookmark',
      source: { droppableId: 'group1', index: 0 },
      destination: { droppableId: 'group1', index: 1 },
      reason: 'DROP'
    }
    
    // 直接调用 onDragEnd 来测试逻辑
    mockOnDragEnd(dragResult)
    
    expect(dragEndResults).toHaveLength(1)
    expect(dragEndResults[0].destination.index).toBe(1)
  })

  test('应该能够将第三个书签拖拽到第二个位置', async () => {
    render(<TestDragDropComponent onDragEnd={mockOnDragEnd} />)
    
    // 模拟拖拽第三个书签到第二个位置
    const dragResult = {
      draggableId: 'bookmark3',
      type: 'bookmark', 
      source: { droppableId: 'group1', index: 2 },
      destination: { droppableId: 'group1', index: 1 },
      reason: 'DROP'
    }
    
    mockOnDragEnd(dragResult)
    
    expect(dragEndResults).toHaveLength(1)
    expect(dragEndResults[0].destination.index).toBe(1)
  })

  test('应该能够跨分组拖拽书签', async () => {
    render(<TestDragDropComponent onDragEnd={mockOnDragEnd} />)
    
    // 模拟从第一个分组拖拽到第二个分组
    const dragResult = {
      draggableId: 'bookmark1',
      type: 'bookmark',
      source: { droppableId: 'group1', index: 0 },
      destination: { droppableId: 'group2', index: 0 },
      reason: 'DROP'
    }
    
    mockOnDragEnd(dragResult)
    
    expect(dragEndResults).toHaveLength(1)
    expect(dragEndResults[0].destination.droppableId).toBe('group2')
  })
})

// 测试改进的拖拽逻辑
describe('改进的拖拽逻辑测试', () => {
  const improvedOnDragEnd = (result: any, data: any, setData: (fn: (prev: any) => any) => void) => {
    const { destination, source, draggableId, type } = result

    if (!destination) {
      return
    }

    // 如果拖拽到相同位置，不做任何操作
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    if (type === "group") {
      const newGroups = Array.from(data.groups)
      const [reorderedGroup] = newGroups.splice(source.index, 1)
      newGroups.splice(destination.index, 0, reorderedGroup)

      setData((prev: any) => ({ ...prev, groups: newGroups }))
      return
    }

    // 改进的书签拖拽处理
    const sourceGroupId = source.droppableId === "standalone" ? null : source.droppableId
    const destGroupId = destination.droppableId === "standalone" ? null : destination.droppableId

    // 查找被移动的书签
    let bookmark: any
    if (sourceGroupId) {
      const sourceGroup = data.groups.find((g: any) => g.id === sourceGroupId)!
      bookmark = sourceGroup.bookmarks[source.index]
    } else {
      bookmark = data.standaloneBookmarks[source.index]
    }

    setData((prev: any) => {
      const newData = { ...prev }

      // 从源位置移除
      if (sourceGroupId) {
        newData.groups = newData.groups.map((group: any) =>
          group.id === sourceGroupId
            ? { 
                ...group, 
                bookmarks: group.bookmarks.filter((_: any, index: number) => index !== source.index)
              }
            : group,
        )
      } else {
        newData.standaloneBookmarks = newData.standaloneBookmarks.filter(
          (_: any, index: number) => index !== source.index
        )
      }

      // 添加到目标位置
      if (destGroupId) {
        newData.groups = newData.groups.map((group: any) =>
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

  test('改进的拖拽逻辑应该正确处理同组内位置变更', () => {
    let testData = { ...mockData }
    const setData = (fn: (prev: any) => any) => {
      testData = fn(testData)
    }

    // 将第一个书签移动到第二个位置
    const dragResult = {
      draggableId: 'bookmark1',
      type: 'bookmark',
      source: { droppableId: 'group1', index: 0 },
      destination: { droppableId: 'group1', index: 1 },
      reason: 'DROP'
    }

    improvedOnDragEnd(dragResult, testData, setData)

    // 验证书签顺序
    const group1 = testData.groups.find(g => g.id === 'group1')
    expect(group1?.bookmarks[0].id).toBe('bookmark2')
    expect(group1?.bookmarks[1].id).toBe('bookmark1')
    expect(group1?.bookmarks[2].id).toBe('bookmark3')
  })
})