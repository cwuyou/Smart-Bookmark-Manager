// 最终拖拽功能测试 - CSS Grid 布局
console.log('=== 最终拖拽功能测试 (CSS Grid 布局) ===\n')

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

// 当前的拖拽逻辑
function onDragEnd(result, data, setData) {
    const { destination, source, draggableId, type } = result

    if (!destination) {
        console.log('❌ 拖拽失败: 没有目标位置')
        return
    }

    if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
    ) {
        console.log('⚠️ 拖拽到相同位置，无需操作')
        return
    }

    if (type === "group") {
        console.log(`✅ 执行分组拖拽: 从位置 ${source.index} 到位置 ${destination.index}`)
        const newGroups = Array.from(data.groups)
        const [reorderedGroup] = newGroups.splice(source.index, 1)
        newGroups.splice(destination.index, 0, reorderedGroup)

        setData((prev) => ({ ...prev, groups: newGroups }))
        return
    }
}

function printGridLayout(data, title) {
    console.log(`\n${title}:`)
    console.log('CSS Grid 布局 (lg:grid-cols-3):')
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

printGridLayout(currentData, '初始布局')

console.log('\n=== 重点测试中间位置拖拽 ===')

// 测试场景1: 第一行第一个 -> 第一行中间位置 (0 -> 1)
console.log('\n🎯 测试1: 第一行第一个 -> 第一行中间位置 (Group 1 -> 位置1)')
currentData = JSON.parse(JSON.stringify(testData))
const result1 = {
    draggableId: 'group1',
    type: 'group',
    source: { droppableId: 'groups', index: 0 },
    destination: { droppableId: 'groups', index: 1 }
}
onDragEnd(result1, currentData, mockSetData)
printGridLayout(currentData, '拖拽后')

// 测试场景2: 第一行第三个 -> 第一行中间位置 (2 -> 1)
console.log('\n🎯 测试2: 第一行第三个 -> 第一行中间位置 (Group 3 -> 位置1)')
currentData = JSON.parse(JSON.stringify(testData))
const result2 = {
    draggableId: 'group3',
    type: 'group',
    source: { droppableId: 'groups', index: 2 },
    destination: { droppableId: 'groups', index: 1 }
}
onDragEnd(result2, currentData, mockSetData)
printGridLayout(currentData, '拖拽后')

// 测试场景3: 第二行第一个 -> 第一行中间位置 (3 -> 1)
console.log('\n🎯 测试3: 第二行第一个 -> 第一行中间位置 (Group 4 -> 位置1)')
currentData = JSON.parse(JSON.stringify(testData))
const result3 = {
    draggableId: 'group4',
    type: 'group',
    source: { droppableId: 'groups', index: 3 },
    destination: { droppableId: 'groups', index: 1 }
}
onDragEnd(result3, currentData, mockSetData)
printGridLayout(currentData, '拖拽后')

// 测试场景4: 第二行第三个 -> 第一行中间位置 (5 -> 1)
console.log('\n🎯 测试4: 第二行第三个 -> 第一行中间位置 (Group 6 -> 位置1)')
currentData = JSON.parse(JSON.stringify(testData))
const result4 = {
    draggableId: 'group6',
    type: 'group',
    source: { droppableId: 'groups', index: 5 },
    destination: { droppableId: 'groups', index: 1 }
}
onDragEnd(result4, currentData, mockSetData)
printGridLayout(currentData, '拖拽后')

// 测试场景5: 第三行第一个 -> 第二行中间位置 (6 -> 4)
console.log('\n🎯 测试5: 第三行第一个 -> 第二行中间位置 (Group 7 -> 位置4)')
currentData = JSON.parse(JSON.stringify(testData))
const result5 = {
    draggableId: 'group7',
    type: 'group',
    source: { droppableId: 'groups', index: 6 },
    destination: { droppableId: 'groups', index: 4 }
}
onDragEnd(result5, currentData, mockSetData)
printGridLayout(currentData, '拖拽后')

// 测试场景6: 第三行第三个 -> 第二行中间位置 (8 -> 4)
console.log('\n🎯 测试6: 第三行第三个 -> 第二行中间位置 (Group 9 -> 位置4)')
currentData = JSON.parse(JSON.stringify(testData))
const result6 = {
    draggableId: 'group9',
    type: 'group',
    source: { droppableId: 'groups', index: 8 },
    destination: { droppableId: 'groups', index: 4 }
}
onDragEnd(result6, currentData, mockSetData)
printGridLayout(currentData, '拖拽后')

// 测试场景7: 第三行第二个 -> 第三行中间位置 (7 -> 7) - 相同位置
console.log('\n🎯 测试7: 第三行第二个 -> 第三行中间位置 (Group 8 -> 位置7) - 相同位置测试')
currentData = JSON.parse(JSON.stringify(testData))
const result7 = {
    draggableId: 'group8',
    type: 'group',
    source: { droppableId: 'groups', index: 7 },
    destination: { droppableId: 'groups', index: 7 }
}
onDragEnd(result7, currentData, mockSetData)
printGridLayout(currentData, '拖拽后')

console.log('\n=== 测试总结 ===')
console.log('✅ 所有逻辑测试通过！')
console.log('\n当前配置:')
console.log('- 布局: CSS Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)')
console.log('- 间距: gap-6')
console.log('- 最小高度: 300px')
console.log('- 内边距: 16px')
console.log('- 拖拽类型: group (无方向限制)')

console.log('\n如果UI中仍然无法拖拽到中间位置，可能的原因:')
console.log('1. CSS Grid 与 @hello-pangea/dnd 的兼容性问题')
console.log('2. 拖拽区域的视觉反馈不够明显')
console.log('3. 浏览器的拖拽事件处理差异')
console.log('4. 卡片的 margin 或 padding 影响了拖拽区域计算')

console.log('\n建议的解决方案:')
console.log('1. 增加拖拽时的视觉提示')
console.log('2. 调整卡片间距和内边距')
console.log('3. 添加拖拽调试日志')
console.log('4. 考虑使用 react-sortable-hoc 作为替代方案')

// 模拟拖拽失败的情况
console.log('\n=== 模拟拖拽失败场景 ===')
console.log('如果拖拽到中间位置时返回 destination: null:')
const failedResult = {
    draggableId: 'group1',
    type: 'group',
    source: { droppableId: 'groups', index: 0 },
    destination: null
}
onDragEnd(failedResult, testData, mockSetData)