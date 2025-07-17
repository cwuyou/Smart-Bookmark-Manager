// 专门测试中间位置拖拽的测试脚本
console.log('=== 中间位置拖拽测试 ===\n')

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

// 拖拽逻辑
function onDragEnd(result, data, setData) {
  const { destination, source, draggableId, type } = result

  if (!destination) {
    console.log('❌ 没有目标位置 - 拖拽被取消')
    return
  }

  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) {
    console.log('⚠️ 拖拽到相同位置 - 无需操作')
    return
  }

  if (type === "group") {
    console.log(`✅ 执行拖拽: 从位置 ${source.index} 到位置 ${destination.index}`)
    const newGroups = Array.from(data.groups)
    const [reorderedGroup] = newGroups.splice(source.index, 1)
    newGroups.splice(destination.index, 0, reorderedGroup)

    setData((prev) => ({ ...prev, groups: newGroups }))
    return
  }
}

function printLayout(data, title) {
  console.log(`\n${title}:`)
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

printLayout(currentData, '初始布局')

console.log('\n=== 专门测试中间位置拖拽 ===')

// 测试1: 第一行第一个拖到第一行中间位置 (0 -> 1)
console.log('\n测试1: 第一行第一个 -> 第一行中间位置 (Group 1 -> 位置1)')
currentData = JSON.parse(JSON.stringify(testData))
const result1 = {
  draggableId: 'group1',
  type: 'group',
  source: { droppableId: 'groups', index: 0 },
  destination: { droppableId: 'groups', index: 1 }
}
onDragEnd(result1, currentData, mockSetData)
printLayout(currentData, '拖拽后')

// 测试2: 第一行第三个拖到第一行中间位置 (2 -> 1)
console.log('\n测试2: 第一行第三个 -> 第一行中间位置 (Group 3 -> 位置1)')
currentData = JSON.parse(JSON.stringify(testData))
const result2 = {
  draggableId: 'group3',
  type: 'group',
  source: { droppableId: 'groups', index: 2 },
  destination: { droppableId: 'groups', index: 1 }
}
onDragEnd(result2, currentData, mockSetData)
printLayout(currentData, '拖拽后')

// 测试3: 第二行第一个拖到第一行中间位置 (3 -> 1)
console.log('\n测试3: 第二行第一个 -> 第一行中间位置 (Group 4 -> 位置1)')
currentData = JSON.parse(JSON.stringify(testData))
const result3 = {
  draggableId: 'group4',
  type: 'group',
  source: { droppableId: 'groups', index: 3 },
  destination: { droppableId: 'groups', index: 1 }
}
onDragEnd(result3, currentData, mockSetData)
printLayout(currentData, '拖拽后')

// 测试4: 第二行第三个拖到第一行中间位置 (5 -> 1)
console.log('\n测试4: 第二行第三个 -> 第一行中间位置 (Group 6 -> 位置1)')
currentData = JSON.parse(JSON.stringify(testData))
const result4 = {
  draggableId: 'group6',
  type: 'group',
  source: { droppableId: 'groups', index: 5 },
  destination: { droppableId: 'groups', index: 1 }
}
onDragEnd(result4, currentData, mockSetData)
printLayout(currentData, '拖拽后')

// 测试5: 第三行第一个拖到第二行中间位置 (6 -> 4)
console.log('\n测试5: 第三行第一个 -> 第二行中间位置 (Group 7 -> 位置4)')
currentData = JSON.parse(JSON.stringify(testData))
const result5 = {
  draggableId: 'group7',
  type: 'group',
  source: { droppableId: 'groups', index: 6 },
  destination: { droppableId: 'groups', index: 4 }
}
onDragEnd(result5, currentData, mockSetData)
printLayout(currentData, '拖拽后')

// 测试6: 第三行第三个拖到第二行中间位置 (8 -> 4)
console.log('\n测试6: 第三行第三个 -> 第二行中间位置 (Group 9 -> 位置4)')
currentData = JSON.parse(JSON.stringify(testData))
const result6 = {
  draggableId: 'group9',
  type: 'group',
  source: { droppableId: 'groups', index: 8 },
  destination: { droppableId: 'groups', index: 4 }
}
onDragEnd(result6, currentData, mockSetData)
printLayout(currentData, '拖拽后')

console.log('\n=== 测试总结 ===')
console.log('如果逻辑测试都通过，但UI中仍然无法拖拽到中间位置，')
console.log('问题可能在于:')
console.log('1. CSS Grid 的拖拽区域识别问题')
console.log('2. @hello-pangea/dnd 在 Grid 布局中的兼容性问题')
console.log('3. 需要调整 Droppable 的配置或添加额外的拖拽提示')

// 模拟无法拖拽到中间位置的情况
console.log('\n=== 模拟问题场景 ===')
console.log('如果拖拽到中间位置时 destination 为 null:')
const failedResult = {
  draggableId: 'group1',
  type: 'group',
  source: { droppableId: 'groups', index: 0 },
  destination: null // 模拟无法识别目标位置
}
onDragEnd(failedResult, testData, mockSetData)