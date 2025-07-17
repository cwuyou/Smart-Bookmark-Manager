# 设计文档

## 概述

当前的拖拽问题源于 `@hello-pangea/dnd` 库与 CSS Grid 布局的兼容性问题。CSS Grid 会自动将元素分布到不同行，但拖拽库的 Droppable 容器是一个单一的容器，这导致拖拽计算位置时出现偏差。解决方案是改用 Flexbox 布局配合 `flex-wrap` 来实现多行显示，同时保持拖拽功能的正常工作。

## 架构

### 当前架构问题
- 使用 CSS Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) 布局分组卡片
- `@hello-pangea/dnd` 的 Droppable 容器无法正确处理 Grid 布局中的位置计算
- 拖拽时的位置索引计算基于 DOM 顺序，但 Grid 布局改变了视觉位置

### 新架构设计
- 改用 Flexbox 布局 (`flex flex-wrap`) 实现多行显示
- 保持相同的响应式断点和列数控制
- 利用 Flexbox 的自然流动特性与拖拽库的兼容性

## 组件和接口

### 修改的组件
1. **Groups Container (DragDropContext > Droppable)**
   - 布局方式：从 CSS Grid 改为 Flexbox
   - 类名变更：`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` → `flex flex-wrap gap-4`
   - 子元素宽度控制：通过 `flex-basis` 和 `max-width` 实现响应式

2. **Group Card Wrapper**
   - 添加响应式宽度类：`w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]`
   - 保持现有的 Draggable 包装器不变

### 接口保持不变
- `onDragEnd` 函数逻辑无需修改
- 拖拽相关的 props 和状态管理保持原样
- 数据结构和状态更新逻辑不变

## 数据模型

无需修改现有数据模型，所有接口保持兼容：
- `Group` 接口保持不变
- `DashboardData` 接口保持不变
- 拖拽结果处理逻辑保持不变

## 错误处理

### 拖拽失败处理
- 保持现有的拖拽取消逻辑（当 `destination` 为 null 时）
- 维持现有的错误边界和状态回滚机制

### 布局兼容性
- 确保在不支持 Flexbox 的旧浏览器中有合理的降级
- 保持响应式断点的一致性

## 测试策略

### 单元测试
- 测试拖拽功能在不同屏幕尺寸下的行为
- 验证 `onDragEnd` 函数在各种拖拽场景下的正确性

### 集成测试
- 测试多行拖拽的完整流程
- 验证拖拽后数据持久化的正确性

### 视觉回归测试
- 确保布局在各个断点下的视觉一致性
- 验证拖拽过程中的视觉反馈

## 实现细节

### CSS 类名映射
```
旧: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
新: flex flex-wrap gap-4
```

### 响应式宽度计算
- 移动端 (默认): `w-full` (100%)
- 平板端 (md): `w-[calc(50%-0.5rem)]` (50% - gap/2)
- 桌面端 (lg): `w-[calc(33.333%-0.667rem)]` (33.333% - gap/3)

### Flexbox 属性
- `flex-wrap`: 允许换行
- `gap-4`: 保持现有的间距
- `flex-shrink-0`: 防止卡片收缩

## 性能考虑

- Flexbox 布局的渲染性能通常优于 CSS Grid
- 拖拽计算复杂度保持不变
- 无额外的 JavaScript 计算开销