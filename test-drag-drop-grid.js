// 测试Grid布局下的拖拽功能
// 模拟9个分组的测试数据
const testData = {
  groups: [
    // 第一行 (索引 0, 1, 2)
    { id: 'group1', name: 'Group 1', bookmarks: [] },
    { id: 'group2', name: 'Group 2', bookmarks: [] },
    { id: 'group3', name: 'Group 3', bookmarks: [] },
    // 第二行 (索引 3, 4, 5)
    { id: 'group4', name: 'Group 4', bookmarks: [] },
    { id: 'group5', name: 'Group 5', bookmarks: [] },
    { id: 'group6', name: 'Group 6', bookmarks: [] },
    // 第三行 (索引 6, 7, 8)
    { id: 'group7', name: 'Group 7', bookmarks: [] },
    { id: 'group8', name: 'Group 8', bookmarks: [] },
    { id: 'group9', name: 'Group 9', bookmarks: [] }
  ],
  standaloneBookmarks: []
}

// 修复后的拖拽逻辑
function onDragEnd(result, data, setData) {
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

    setData((prev) => ({ ...prev, groups: newGroups }))
    return
  }

  // Handle bookmark dragging logic here...
}

function printGridLayout(data, title) {
  console.log(`\n${title}:`)
  console.log('Grid布局 (3列):')
  for (let i = 0; i < data.groups.length; i += 3) {
    const row = Math.floor(i / 3) + 1
    const rowGroups = data.groups.slice(i, i + 3)
    const rowDisplay = rowGroups.map((group, colIndex) => {
      const globalIndex = i + colIndex
      return `[${globalIndex}] ${group.name}`
    }).join('  |  ')
    console.log(`第${row}行: ${rowDisplay}`)
  }
}

// 模拟setData函数
let currentData = JSON.parse(JSON.stringify(testData))
const mockSetData = (updateFn) => {
  currentData = updateFn(currentData)
}

console.log('=== Grid布局拖拽测试 ===')

// 初始状态
printGridLayout(currentData, '初始布局')

// 测试1: 第一行第一个拖到第一行第二个位置 (0 -> 1)
console.log('\n测试1: 第一行第一个拖到第一行第二个位置')
const result1 = {
  draggableId: 'group1',
  type: 'group',
  source: { droppableId: 'groups', index: 0 },
  destination: { droppableId: 'groups', index: 1 }
}
onDragEnd(result1, currentData, mockSetData)
printGridLayout(currentData, '拖拽后')

// 重置数据
currentData = JSON.parse(JSON.stringify(testData))

// 测试2: 第二行第一个拖到第一行第二个位置 (3 -> 1)
console.log('\n测试2: 第二行第一个拖到第一行第二个位置')
const result2 = {
  draggableId: 'group4',
  type: 'group',
  source: { droppableId: 'groups', index: 3 },
  destination: { droppableId: 'groups', index: 1 }
}
onDragEnd(result2, currentData, mockSetData)
printGridLayout(currentData, '拖拽后')

// 重置数据
currentData = JSON.parse(JSON.stringify(testData))

// 测试3: 第二行第三个拖到第一行第二个位置 (5 -> 1)
console.log('\n测试3: 第二行第三个拖到第一行第二个位置')
const result3 = {
  draggableId: 'group6',
  type: 'group',
  source: { droppableId: 'groups', index: 5 },
  destination: { droppableId: 'groups', index: 1 }
}
onDragEnd(result3, currentData, mockSetData)
printGridLayout(currentData, '拖拽后')

// 重置数据
currentData = JSON.parse(JSON.stringify(testData))

// 测试4: 第三行第一个拖到第二行第二个位置 (6 -> 4)
console.log('\n测试4: 第三行第一个拖到第二行第二个位置')
const result4 = {
  draggableId: 'group7',
  type: 'group',
  source: { droppableId: 'groups', index: 6 },
  destination: { droppableId: 'groups', index: 4 }
}
onDragEnd(result4, currentData, mockSetData)
printGridLayout(currentData, '拖拽后')

// 重置数据
currentData = JSON.parse(JSON.stringify(testData))

// 测试5: 第三行第三个拖到第二行第二个位置 (8 -> 4)
console.log('\n测试5: 第三行第三个拖到第二行第二个位置')
const result5 = {
  draggableId: 'group9',
  type: 'group',
  source: { droppableId: 'groups', index: 8 },
  destination: { droppableId: 'groups', index: 4 }
}
onDragEnd(result5, currentData, mockSetData)
printGridLayout(currentData, '拖拽后')

console.log('\n=== 测试总结 ===')
console.log('✅ 修复说明:')
console.log('1. 将布局从 flex-wrap 改为 CSS Grid')
console.log('2. 移除了 direction="horizontal" 参数')
console.log('3. 使用 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 响应式布局')
console.log('4. 这样 @hello-pangea/dnd 可以正确识别所有拖拽位置')
console.log('\n现在所有位置的拖拽都应该能正常工作，包括:')
console.log('- 第一行任意位置拖到第二行任意位置')
console.log('- 第二行任意位置拖到第一行任意位置')
console.log('- 第三行任意位置拖到第二行任意位置')
console.log('- 以及所有其他组合')