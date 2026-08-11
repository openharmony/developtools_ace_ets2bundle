# 规格文档 — @Require修饰的数据支持类型校验

## 一、元数据

| 字段 | 内容 |
|------|------|
| 规格ID | SPEC-require-type-check-001 |
| 规格名称 | @Require字段类型一致性校验规格 |
| CodeSpec ID | issue-4719-require-type-check |
| 关联 Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4719 |
| 目标模块 | `developtools/ace_ets2bundle/compiler/` |
| 规格状态 | Draft |
| 创建日期 | 2026-08-11 |

---

## 二、用户故事

### 2.1 故事描述

**作为** ArkUI 应用开发者

**想要** 在编译时获得 `@Require` 字段类型不一致的告警

**以便** 能提前发现并修复显式传递 `undefined` 到 non-null 类型的错误

### 2.2 故事背景

当前 ArkTS 动态编译为非严格类型校验，允许开发者将 `undefined` 值传递给 `@Require` 修饰的 non-null 类型字段。这可能导致运行时异常，但编译器无提示，增加了调试成本。

---

## 三、验收标准

### AC-1: @Require 的 non-null 类型字段接收 undefined 时告警

**优先级：** P0

**描述：** 当 `@Require` 修饰的字段类型为 non-null（不含 `undefined`），且父组件显式传递 `undefined` 值时，编译器输出 WARNING 级别告警。

**Given** 子组件定义：
```typescript
@Component
struct Child {
  @Require requiredNum: number;  // non-null 类型
  build() { ... }
}
```

**When** 父组件传递 `undefined`：
```typescript
Child({ requiredNum: undefined })
```

**Then** 编译器输出 WARNING：
```
WARNING: `@Require` 字段接收了 `undefined` 值。
字段类型为 non-null 类型，不应传递 undefined。
请检查传递的参数值，或修改字段类型定义为可选类型。
```

**验证方法：** 编译上述代码，检查告警输出。

---

### AC-2: @Require 的可选类型字段接收 undefined 时不告警

**优先级：** P0

**描述：** 当 `@Require` 修饰的字段类型为 nullable（含 `undefined`）时，传递 `undefined` 不触发告警。

**Given** 子组件定义：
```typescript
@Component
struct Child {
  @Require optionalNum?: number;  // 可选类型
  build() { ... }
}
```

**When** 父组件传递 `undefined`：
```typescript
Child({ optionalNum: undefined })
```

**Then** 编译器无告警。

**验证方法：** 编译上述代码，确认无告警输出。

---

### AC-3: 非 @Require 字段接收 undefined 时不告警

**优先级：** P1

**描述：** 当字段没有 `@Require` 修饰符时，即使接收 `undefined` 也不触发告警。

**Given** 子组件定义：
```typescript
@Component
struct Child {
  regularNum: number;  // 无 @Require
  build() { ... }
}
```

**When** 父组件传递 `undefined`：
```typescript
Child({ regularNum: undefined })
```

**Then** 编译器无告警。

**验证方法：** 编译上述代码，确认无告警输出。

---

### AC-4: 嵌套对象内部 undefined 不触发告警

**优先级：** P1

**描述：** 当传递嵌套对象时，对象内部的 `undefined` 不触发告警（仅检查顶层字段）。

**Given** 子组件定义：
```typescript
@Component
struct Child {
  @Require config: { count: number; name: string };
  build() { ... }
}
```

**When** 父组件传递包含 `undefined` 的嵌套对象：
```typescript
Child({ config: { count: undefined, name: "test" } })
```

**Then** 编译器无告警（不递归检查嵌套对象）。

**验证方法：** 编译上述代码，确认无告警输出。

---

### AC-5: TypeAlias 类型的 @Require 字段接收 undefined 时告警

**优先级：** P0

**描述：** 当 `@Require` 修饰的字段类型为 TypeAlias，且别名指向的类型为 non-null 时，传递 `undefined` 触发告警。

**Given** 子组件定义：
```typescript
type MyType = number | string;

@Component
struct Child {
  @Require value: MyType;  // TypeAlias，实际为 non-null
  build() { ... }
}
```

**When** 父组件传递 `undefined`：
```typescript
Child({ value: undefined })
```

**Then** 编译器输出 WARNING。

**验证方法：** 编译上述代码，检查告警输出。

---

### AC-6: TypeAlias 解析失败时不触发误报

**优先级：** P1

**描述：** 当 TypeAlias 解析失败（如 resolvedSymbol 查询不到）时，默认为 non-null，避免误报。

**Given** 子组件定义：
```typescript
type ExternalType = unknown;  // 假设来自外部模块，可能解析失败

@Component
struct Child {
  @Require value: ExternalType;
  build() { ... }
}
```

**When** 父组件传递 `undefined` 且 TypeAlias 解析失败：
```typescript
Child({ value: undefined })
```

**Then** 编译器输出 WARNING（按 non-null 处理，或基于容错策略不误报）。

**验证方法：** 模拟 TypeAlias 解析失败场景，确认无异常和误报。

---

## 四、规则定义

### 4.1 non-null 类型定义

以下类型被视为 **non-null**（即不允许传递 `undefined`）：

| 规则ID | 类型类别 | 示例 |
|--------|----------|------|
| R-001 | 基本类型 | `number`, `string`, `boolean` |
| R-002 | 非空联合类型 | `number \| string`, `A \| B` |
| R-003 | 对象类型 | `MyClass`, `interface Foo` |
| R-004 | 类型引用 | `Array<number>`, `Map<string, number>` |
| R-005 | **类型别名** | `type A = number \| string` |

### 4.2 nullable 类型定义

以下类型被视为 **nullable**（即允许传递 `undefined`）：

| 规则ID | 类型类别 | 示例 |
|--------|----------|------|
| R-101 | 包含 undefined 的联合类型 | `number \| undefined`, `T \| undefined` |
| R-102 | 可选类型语法 | `number?`（等价于 `number \| undefined`） |

### 4.3 显式 undefined 检测规则

| 规则ID | 检测项 | 说明 |
|--------|--------|------|
| R-201 | undefined 字面量 | 直接的 `undefined` 标识符 |

### 4.4 检查逻辑

```
┌─────────────────────────────────────────┐
│ 1. 检查是否有 @Require 修饰符           │
│    无 → 跳过，不告警                     │
└─────────────────┬───────────────────────┘
                  │ 有
                  ▼
┌─────────────────────────────────────────┐
│ 2. 判断字段类型是否为 non-null           │
│    - 解析 TypeAlias（如有）              │
│    - 检查是否含 undefined                │
│    含 undefined → 跳过，不告警           │
└─────────────────┬───────────────────────┘
                  │ non-null
                  ▼
┌─────────────────────────────────────────┐
│ 3. 检测参数值是否为显式 undefined        │
│    - 检查是否为 undefined 字面量          │
│    - 检查是否为 void 表达式               │
│    非 undefined → 跳过，不告警           │
└─────────────────┬───────────────────────┘
                  │ 是 undefined
                  ▼
┌─────────────────────────────────────────┐
│ 4. 输出 WARNING 告警                     │
└─────────────────────────────────────────┘
```

---

## 五、不涉及项确认

| 项目 | 状态 | 说明 |
|------|------|------|
| 其它修饰符（@Prop, @State） | ✓ 不涉及 | 仅检查 @Require 字段 |
| 可选类型字段传递 undefined | ✓ 不涉及 | 允许传递 undefined |
| 非 @Require 字段 | ✓ 不涉及 | 仅检查 @Require 字段 |
| 嵌套对象属性检查 | ✓ 不涉及 | 仅检查顶层字段 |
| 运行时行为修改 | ✓ 不涉及 | 纯编译时检查 |
| 新增公共 API | ✓ 不涉及 | 不新增 API |

---

## 六、告警信息规范

### 6.1 告警级别

WARNING（不阻止编译）

### 6.2 告警消息模板

```
WARNING: `@Require` 字段接收了 `undefined` 值。
字段类型为 non-null 类型，不应传递 undefined。
请检查传递的参数值，或修改字段类型定义为可选类型。
```

### 6.3 告警位置

告警位置指向传递 `undefined` 的表达式节点，便于开发者定位。

---

## 七、参考资料

| 资源 | 说明 |
|------|------|
| `design.md` | 详细设计文档 |
| `proposal.md` | 需求澄清文档 |
| TypeScript Compiler API | 类型判断 API 参考 |
