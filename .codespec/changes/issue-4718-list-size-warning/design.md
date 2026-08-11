# 设计文档 — List 组件尺寸设置编译告警

## 一、设计概述

### 1.1 设计目标

在编译器静态检查阶段为 List 组件添加尺寸属性缺失告警，帮助开发者提前发现潜在的布局问题。

### 1.2 约束条件

- 不影响现有编译行为，仅新增 WARNING 告警
- 不修改运行时组件行为
- 仅针对 List 组件，不扩展到其它容器

---

## 二、架构设计

### 2.1 模块定位

```
compiler/
├── src/
│   ├── process_component_build.ts    ← 主要修改点
│   ├── pre_define.ts                  ← 可选：新增常量
│   └── log_message_collection.ts     ← 参考模式
└── components/
    ├── list.json                      ← List 组件定义
    └── common_attrs.json             ← 通用属性定义
```

### 2.2 处理流程

```
                    ┌─────────────────────────┐
                    │   bindComponentAttr     │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   是否为 List 组件？     │
                    └───────────┬─────────────┘
                                │
                     ┌──────────┴──────────┐
                     │ Yes                 │ No
                     ▼                     ▼
        ┌─────────────────────┐   ┌──────────────┐
        │ 创建检查上下文对象   │   │  原有处理流程 │
        └───────────┬─────────┘   └──────────────┘
                    │
        ┌───────────▼───────────────────────┐
        │  遍历组件属性，收集尺寸信息        │
        │  - layoutWeight?                   │
        │  - height/width/size?              │
        │  - constraintSize.max*?            │
        │  - aspectRatio?                    │
        │  - listDirection?                  │
        └───────────┬───────────────────────┘
                    │
        ┌───────────▼─────────────┐
        │  执行尺寸检查逻辑        │
        └───────────┬─────────────┘
                    │
         ┌──────────┴──────────┐
         │ 检查结果？          │
         ▼                     ▼
   ┌──────────┐         ┌──────────┐
   │ 缺失尺寸 │         │  尺寸完整 │
   └─────┬────┘         └──────────┘
         │
   ┌─────▼─────────┐
   │ 输出 WARNING   │
   └────────────────┘
```

---

## 三、详细设计

### 3.1 数据结构

```typescript
/**
 * List 组件尺寸检查上下文
 */
interface ListSizeCheckContext {
  /** 是否有 layoutWeight 属性 */
  hasLayoutWeight: boolean;

  /** 收集的尺寸属性名称集合 */
  sizeAttrs: Set<string>;

  /** 是否有垂直方向有效尺寸 */
  hasVerticalSize: boolean;

  /** 是否有水平方向有效尺寸 */
  hasHorizontalSize: boolean;

  /** List 的 listDirection 属性值 */
  listDirection?: string;

  /** List 组件节点引用（用于告警定位） */
  node: ts.CallExpression;
}
```

### 3.2 属性识别规则

#### 3.2.1 替代条件（有任一即不告警）

| 条件 | 说明 |
|------|------|
| `layoutWeight` 存在 | 作为 flex 子项时的尺寸分配方式 |
| `height` 存在 | 垂直方向固定尺寸 |
| `width` 存在 | 水平方向固定尺寸 |
| `size` 存在 | 同时包含 width 和 height |
| `constraintSize.maxHeight` 存在 | 垂直方向最大约束 |
| `constraintSize.maxWidth` 存在 | 水平方向最大约束 |
| `aspectRatio` 存在 | 宽高比，可配合任一方向尺寸计算另一方向 |

#### 3.2.2 方向相关判断

| listDirection | 需要的尺寸属性 |
|---------------|----------------|
| `Vertical` 或未设置 | `height`, `size`, `constraintSize.maxHeight`, 或 `aspectRatio` |
| `Horizontal` | `width`, `size`, `constraintSize.maxWidth`, 或 `aspectRatio` |
| 其它（`Vertical.Adaptive` 等） | 按实际方向需求判断 |

#### 3.2.3 无效属性

以下属性**不**作为有效尺寸：
- `constraintSize.minHeight` - 单独存在时无效
- `constraintSize.minWidth` - 单独存在时无效
- `constraintSize.minSize` - 单独存在时无效

### 3.3 检查算法

```typescript
/**
 * 检查 List 组件尺寸属性是否缺失
 */
function checkListSizeProperty(context: ListSizeCheckContext): boolean {
  // 1. 有 layoutWeight，通过
  if (context.hasLayoutWeight) {
    return true; // 尺寸有效
  }

  // 2. 根据 listDirection 判断需要的方向
  const isVertical = !context.listDirection ||
                      context.listDirection === 'Vertical' ||
                      context.listDirection.startsWith('Vertical.');

  const isHorizontal = context.listDirection === 'Horizontal' ||
                       context.listDirection.startsWith('Horizontal.');

  // 3. 检查对应方向的尺寸
  if (isVertical) {
    if (context.hasVerticalSize) {
      return true; // 垂直方向尺寸有效
    }
  }

  if (isHorizontal) {
    if (context.hasHorizontalSize) {
      return true; // 水平方向尺寸有效
    }
  }

  // 4. 有 aspectRatio 也可以（配合任一方向）
  if (context.sizeAttrs.has('aspectRatio')) {
    return true;
  }

  // 5. 无有效尺寸，需要告警
  return false;
}
```

### 3.4 告警信息

```typescript
const WARNING_MESSAGE = [
  "List 组件缺少尺寸属性设置。",
  "请设置以下任一属性：",
  "  - layoutWeight（作为 flex 子项时）",
  "  - height 或 width（根据 listDirection）",
  "  - size（同时设置宽高）",
  "  - constraintSize.maxHeight 或 constraintSize.maxWidth",
  "  - aspectRatio（宽高比）"
].join('\n');
```

---

## 四、实现决策记录

### D-001: 使用独立上下文对象

**决策：** 创建 `ListSizeCheckContext` 接口用于收集和传递检查信息

**理由：**
- 结构清晰，易于理解和维护
- 便于后续扩展（如添加更多检查项）
- 符合现有代码组织模式

**取舍：**
- 相比内联检查需要额外定义接口
- 但代码可读性和可维护性更高

### D-002: 告警级别选择 WARNING

**决策：** 使用 WARNING 级别而非 ERROR

**理由：**
- 尺寸缺失不会导致编译失败
- 给开发者 flexibility，某些场景可能不需要显式尺寸
- 与现有编译器告警策略一致

### D-003: constraintSize 仅 max 属性有效

**决策：** `constraintSize.minHeight` 和 `minWidth` 单独存在时仍触发告警

**理由：**
- min 属性仅设置最小值，不保证实际渲染尺寸
- max 属性提供了明确的尺寸上限约束
- 符合布局引擎的实际行为

---

## 五、测试策略

### 5.1 单元测试

| 测试用例 | 输入 | 预期输出 |
|----------|------|----------|
| 无任何尺寸属性 | 空属性列表 | WARNING |
| 仅 layoutWeight | layoutWeight=1 | 无告警 |
| 垂直方向有 height | height=200 | 无告警 |
| 水平方向有 width | width='100%' | 无告警 |
| 有 size | size={w,h} | 无告警 |
| 有 maxHeight | constraintSize.maxHeight=300 | 无告警 |
| 有 maxWidth | constraintSize.maxWidth=200 | 无告警 |
| 有 aspectRatio | aspectRatio=1.5 | 无告警 |
| 仅 minHeight | constraintSize.minHeight=100 | WARNING |
| 仅 minWidth | constraintSize.minWidth=100 | WARNING |

### 5.2 集成测试

- 编译包含 List 组件的完整 ArkTS 文件
- 验证告警信息正确输出
- 验证告警位置准确指向 List 节点

---

## 六、性能影响

- 时间复杂度：O(1) 每个 List 组件
- 空间复杂度：O(1) 每个检查上下文
- 仅在处理 List 组件时执行，不影响其它组件

---

## 七、安全与合规

- 不涉及用户数据处理
- 不涉及网络安全
- 不涉及权限控制
- 纯编译器静态检查能力

---

## 八、参考资料

| 资源 | 说明 |
|------|------|
| `log_message_collection.ts` | 现有检查函数实现参考 |
| `components/list.json` | List 组件定义 |
| `components/common_attrs.json` | 通用属性定义 |
