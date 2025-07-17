// 多行布局拖拽逻辑测试脚本
// 模拟测试数据 - 9个分组，模拟3行布局（每行3个）
const testData = {
  groups: [
    // 第一行 (索引 0, 1, 2)
    { id: 'group1', name: 'Group 1', bookmarks: [{ id: 'b1', name: 'Bookmark 1', url: 'https://example1.com' }] },
    { id: 'group2', name: 'Group 2', bookmarks: [{ id: 'b2', name: 'Bookmark 2', url: 'https://example2.com' }] },
    { id: 'group3', name: 'Group 3', bookmarks: [{ id: 'b3', name: 'Bookmark 3', url: 'https://example3.com' }] },
    // 第二行 (索引 3, 4, 5)
    { id: 'group4', name: 'Group 4', bookmarks: [{ id: 'b4', name: 'Bookmark 4', url: 'https://example4.com' }] },
    { id: 'group5', name: 'Group 5', bookmarks: [{ id: 'b5', name: 'Bookmark 5', url: 'https://example5.com' }] },
    { id: 'group6', name: 'Group 6', bookmarks: [{ id: 'b6', name: 'Bookmark 6', url: 'https://example6.com' }] },
    // 第三行 (索引 6, 7, 8)
    { id: 'group7', name: 'Group 7', bookmarks: [{ id: 'b7', name: 'Bookmark 7', url: 'https://example7.com' }] },
    { id: 'group8', name: 'Group 8', bookmarks: [{ id: 'b8', name: 'Bookmark 8', url: 'https://example8.com' }] },
    { id: 'group9', name: 'Group 9', bookmarks: [{ id: 'b9', name: 'Bookmark 9', url: 'https://example9.com' }] }
  ],
  standaloneBookmarks: []
}

// 改进后的拖拽逻辑
function improvedOnDragEnd(result, data) {
  const { destination, source, draggableId, type } = result

  if (!destination) {
    return data
  }

  // 如果拖拽到相同位置，不做任何操作
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) {
    return data
  }

  if (type === "group") {
    const newGroups = Array.from(data.groups)
    const [reorderedGroup] = newGroups.splice(source.index, 1)
    newGroups.splice(destination.index, 0, reorderedGroup)
    return { ...data, groups: newGroups }
  }

  // Handle bookmark dragging
  const sourceGroupId = source.droppableId === "standalone" ? null : source.droppableId
  const destGroupId = destination.droppableId === "standalone" ? null : destination.droppableId

  // Find the bookmark being moved
  let bookmark
  if (sourceGroupId) {
    const sourceGroup = data.groups.find((g) => g.id === sourceGroupId)
    bookmark = sourceGroup.bookmarks[source.index]
  } else {
    bookmark = data.standaloneBookmarks[source.index]
  }

  const newData = { ...data }

  // 如果是同一个分组内的移动，使用更精确的数组操作
  if (sourceGroupId === destGroupId && sourceGroupId) {
    newData.groups = newData.groups.map((group) => {
      if (group.id === sourceGroupId) {
        const newBookmarks = Array.from(group.bookmarks)
        // 移除源位置的书签
        const [movedBookmark] = newBookmarks.splice(source.index, 1)
        // 插入到目标位置
        newBookmarks.splice(destination.index, 0, movedBookmark)
        return { ...group, bookmarks: newBookmarks }
      }
      return group
    })
  } else if (sourceGroupId === destGroupId && !sourceGroupId) {
    // 独立书签内部移动
    const newStandaloneBookmarks = Array.from(newData.standaloneBookmarks)
    const [movedBookmark] = newStandaloneBookmarks.splice(source.index, 1)
    newStandaloneBookmarks.splice(destination.index, 0, movedBookmark)
    newData.standaloneBookmarks = newStandaloneBookmarks
  } else {
    // 跨分组移动
    // Remove from source
    if (sourceGroupId) {
      newData.groups = newData.groups.map((group) =>
        group.id === sourceGroupId
          ? { 
              ...group, 
              bookmarks: group.bookmarks.filter((_, index) => index !== source.index)
            }
          : group,
      )
    } else {
      newData.standaloneBookmarks = newData.standaloneBookmarks.filter(
        (_, index) => index !== source.index
      )
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
  }

  return newData
}

function printGroupLayout(data) {
  console.log('当前分组布局:')
  data.groups.forEach((group, index) => {
    const row = Math.floor(index / 3) + 1
    const col = (index % 3) + 1
    console.log(`  [${index}] ${group.name} (第${row}行第${col}列)`)
  })
  console.log()
}

// 测试用例
console.log('=== 多行布局拖拽功能测试 ===\n')

console.log('初始布局:')
printGroupLayout(testData)

// 测试1: 第一行第一个拖拽到第一行第二个位置 (0 -> 1)
console.log('测试1: 第一行第一个拖拽到第一行第二个位置 (Group 1 -> 位置1)')
const result1 = {
  draggableId: 'group1',
  type: 'group',
  source: { droppableId: 'groups', index: 0 },
  destination: { droppableId: 'groups', index: 1 }
}
const newData1 = improvedOnDragEnd(result1, testData)
printGroupLayout(newData1)

// 测试2: 第二行第一个拖拽到第一行第二个位置 (3 -> 1)
console.log('测试2: 第二行第一个拖拽到第一行第二个位置 (Group 4 -> 位置1)')
const result2 = {
  draggableId: 'group4',
  type: 'group',
  source: { droppableId: 'groups', index: 3 },
  destination: { droppableId: 'groups', index: 1 }
}
const newData2 = improvedOnDragEnd(result2, testData)
printGroupLayout(newData2)

// 测试3: 第二行第三个拖拽到第一行第二个位置 (5 -> 1)
console.log('测试3: 第二行第三个拖拽到第一行第二个位置 (Group 6 -> 位置1)')
const result3 = {
  draggableId: 'group6',
  type: 'group',
  source: { droppableId: 'groups', index: 5 },
  destination: { droppableId: 'groups', index: 1 }
}
const newData3 = improvedOnDragEnd(result3, testData)
printGroupLayout(newData3)

// 测试4: 第三行第一个拖拽到第二行第二个位置 (6 -> 4)
console.log('测试4: 第三行第一个拖拽到第二行第二个位置 (Group 7 -> 位置4)')
const result4 = {
  draggableId: 'group7',
  type: 'group',
  source: { droppableId: 'groups', index: 6 },
  destination: { droppableId: 'groups', index: 4 }
}
const newData4 = improvedOnDragEnd(result4, testData)
printGroupLayout(newData4)

// 测试5: 第三行第三个拖拽到第二行第二个位置 (8 -> 4)
console.log('测试5: 第三行第三个拖拽到第二行第二个位置 (Group 9 -> 位置4)')
const result5 = {
  draggableId: 'group9',
  type: 'group',
  source: { droppableId: 'groups', index: 8 },
  destination: { droppableId: 'groups', index: 4 }
}
const newData5 = improvedOnDragEnd(result5, testData)
printGroupLayout(newData5)

console.log('=== 测试完成 ===')
console.log('\n注意: 这些测试验证了分组级别的拖拽逻辑。')
console.log('如果你遇到的问题是在UI层面（比如拖拽区域识别问题），')
console.log('那可能需要检查CSS布局或者@hello-pangea/dnd的配置。')