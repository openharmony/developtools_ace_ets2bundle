# Spec: List 组件尺寸设置编译告警

## 元数据

| 字段 | 值 |
|------|-----|
| 特性 ID | `list-size-warning` |
| 复杂度 | 简单 |
| 影响范围 | 编译器工具链 (compiler/) |
| 状态 | 草稿 |

---

## 1. 需求概述

为 List 组件添加尺寸属性缺失的编译告警，提醒开发者在 List 组件上设置适当的尺寸属性或使用 `layoutWeight`。

### 用户故事

> 作为 OpenHarmony 应用开发者，希望在忘记为 List 组件设置尺寸属性时收到编译告警，以便避免运行时布局问题。

---

## 2. 验收标准 (AC)

### AC-1: List 无尺寸属性时告警

**WHEN** 开发者创建一个 List 组件，且该组件：
- **没有**设置 `layoutWeight` 属性
- **没有**设置相应方向的尺寸属性：
  - 垂直方向（`listDirection` 为 `Vertical` 或默认）：需要 `height`、`size`、`constraintSize.maxHeight` 或 `aspectRatio`
  - 水平方向（`listDirection` 为 `Horizontal`）：需要 `width`、`size`、`constraintSize.maxWidth` 或 `aspectRatio`

**THEN** 编译器应该发出 WARNING 级别的告警，位置指向该 List 组件节点。

**验证方法：**
```typescript
// 应该触发告警的代码
List() {
  ListItem() { Text('Item 1') }
  ListItem() { Text('Item 2') }
}
```

---

### AC-2: 有 layoutWeight 时不告警

**WHEN** List 组件设置了 `layoutWeight` 属性，无论是否有其它尺寸属性

**THEN** 编译器**不应该**发出告警。

**验证方法：**
```typescript
// 不应该触发告警的代码
List() {
  ListItem() { Text('Item 1') }
}
.layoutWeight(1)
```

---

### AC-3: 有有效尺寸属性时不告警

**WHEN** List 组件设置了任一有效尺寸属性（`height`、`width`、`size`、`constraintSize.max*`、`aspectRatio`）

**THEN** 编译器**不应该**发出告警。

**验证方法：**
```typescript
// 不应该触发告警的代码

// 垂直方向 - 有 height
List() {
  ListItem() { Text('Item 1') }
}
.height(200)

// 水平方向 - 有 width
List() {
  ListItem() { Text('Item 1') }
}
.listDirection(Axis.Horizontal)
.width('100%')

// 双方向 - 有 size
List() {
  ListItem() { Text('Item 1') }
}
.size({ width: 100, height: 200 })

// 垂直方向 - 有 constraintSize.maxHeight
List() {
  ListItem() { Text('Item 1') }
}
.constraintSize({ maxHeight: 300 })

// 单独有效 - 有 aspectRatio
List() {
  ListItem() { Text('Item 1') }
}
.aspectRatio(1.5)
```

---

### AC-4: constraintSize 的 min 属性不触发满足条件

**WHEN** List 组件仅设置了 `constraintSize` 的 `minHeight` 或 `minWidth` 属性（无 max）

**THEN** 该属性**不**被识别为有效尺寸设置，仍应按 AC-1 触发告警。

**验证方法：**
```typescript
// 应该触发告警的代码（仅min属性）
List() {
  ListItem() { Text('Item 1') }
}
.constraintSize({ minHeight: 100 })
```

---

## 3. 实现约束

### 3.1 文件修改范围

仅修改以下文件：
- `compiler/src/process_component_build.ts` - 新增独立上下文对象，添加属性收集和检查逻辑
- `compiler/src/pre_define.ts` - 新增尺寸属性常量（可选，也可内联）

### 3.2 数据结构设计

**独立上下文对象：** 创建 `ListSizeCheckContext` 接口，用于收集和传递 List 组件的尺寸属性信息：

```typescript
interface ListSizeCheckContext {
  hasLayoutWeight: boolean;      // 是否有 layoutWeight
  sizeAttrs: Set<string>;          // 收集的尺寸属性名称
  hasVerticalSize: boolean;        // 是否有垂直方向尺寸
  hasHorizontalSize: boolean;      // 是否有水平方向尺寸
  listDirection?: string;          // List 的方向属性
  node: ts.CallExpression;         // List 组件节点引用
}
```

**属性收集方式：** 在 `bindComponentAttr` 函数中，当识别到 List 组件时：
1. 创建 `ListSizeCheckContext` 实例
2. 在属性处理循环中收集相关信息
3. 属性处理完成后调用检查函数

### 3.3 性能约束

- 仅在处理 List 组件时执行检查
- 时间复杂度：O(1) 每组件
- 不影响其它组件的处理性能

---

## 4. API 和兼容性影响

### 4.1 API 变更

无新增 API。

### 4.2 兼容性影响

- **向后兼容：** 完全兼容。仅新增告警，不改变现有行为。
- **现有代码：** 可能产生新的 WARNING，但不导致编译失败。

---

## 5. 不涉及项

本特性**不涉及**以下内容：
- 运行时组件行为
- UI 框架渲染逻辑
- 其它容器组件（Grid、WaterFlow 等）
- ListItem 或 ListItemGroup 组件
- 其它装饰器或属性

---

## 6. 上下文引用

### 6.1 相关文件

| 文件 | 作用 |
|------|------|
| `compiler/components/list.json` | List 组件定义 |
| `compiler/components/common_attrs.json` | 通用属性（含尺寸属性） |
| `compiler/src/component_map.ts` | 组件映射表 |
| `compiler/src/utils.ts` | 日志工具 (`addLog`) |

### 6.2 现有模式

参考 `log_message_collection.ts` 中的检查函数模式：
- `checkUsageOfReuseAttribute`
- `checkUsageOfReuseIdAttribute`

---

## 7. 附录

### 7.1 完整测试用例矩阵

| 场景 | layoutWeight | height | width | size | constraintSize.max* | aspectRatio | listDirection | 预期 |
|------|--------------|--------|-------|------|---------------------|-------------|---------------|------|
| 1 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Vertical | WARN |
| 2 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Horizontal | WARN |
| 3 | ✓ | - | - | - | - | - | - | 无告警 |
| 4 | ✗ | ✓ | - | - | - | - | Vertical | 无告警 |
| 5 | ✗ | ✗ | ✓ | - | - | - | Horizontal | 无告警 |
| 6 | ✗ | - | - | ✓ | - | - | - | 无告警 |
| 7 | ✗ | - | - | - | maxHeight | - | Vertical | 无告警 |
| 8 | ✗ | - | - | - | maxWidth | - | Horizontal | 无告警 |
| 9 | ✗ | - | - | - | - | ✓ | - | 无告警 |
| 10 | ✗ | - | - | - | minHeight | - | - | WARN |
| 11 | ✗ | - | - | - | minWidth | - | - | WARN |
