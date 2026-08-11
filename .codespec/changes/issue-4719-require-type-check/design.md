# 设计文档 — @Require修饰的数据支持类型校验

## 一、设计概述

### 1.1 设计目标

在编译器静态检查阶段为 `@Require` 修饰的 non-null 类型字段添加类型一致性校验，当开发者显式传递 `undefined` 值时输出 WARNING 级别告警。

### 1.2 约束条件

- 不影响现有编译行为，仅新增 WARNING 告警
- 不修改运行时组件行为
- `@Require` 是纯编译时标记，不生成运行时代码
- 仅检查顶层字段，不递归嵌套对象

---

## 二、架构设计

### 2.1 模块定位

```
compiler/
├── src/
│   ├── process_component_build.ts    ← 主要修改点（组件参数传递检查）
│   ├── decorator_processor.ts         ← @Require 修饰符处理
│   ├── type_checker.ts                ← 类型判断工具（可能需要新增）
│   └── log_message_collection.ts     ← 告警输出参考
└── decorators/
    └── require.json                    ← @Require 装饰器定义（如果存在）
```

### 2.2 处理流程

```
                    ┌─────────────────────────┐
                    │  组件参数传递检查阶段     │
                    │  (processComponent)      │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  遍历组件参数            │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  是否有 @Require 修饰符？ │
                    └───────────┬─────────────┘
                                │
                     ┌──────────┴──────────┐
                     │ Yes                 │ No
                     ▼                     ▼
        ┌─────────────────────┐   ┌──────────────┐
        │ 创建类型检查上下文   │   │  原有处理流程 │
        └───────────┬─────────┘   └──────────────┘
                    │
        ┌───────────▼───────────────────────┐
        │  判断字段类型是否为 non-null       │
        │  - 基本类型 (number, string, ...) │
        │  - 非空联合类型 (A | B)           │
        │  - 对象类型 (Class, Interface)    │
        └───────────┬───────────────────────┘
                    │
        ┌───────────▼─────────────┐
        │  检测参数值是否为 undefined │
        └───────────┬─────────────┘
                    │
         ┌──────────┴──────────┐
         │ 参数值是 undefined？  │
         ▼                     ▼
   ┌──────────┐         ┌──────────┐
   │ 是 undefined│        │ 非 undefined│
   └─────┬────┘         └──────────┘
         │
   ┌─────▼─────────┐
   │ 输出 WARNING  │
   └───────────────┘
```

---

## 三、详细设计

### 3.1 数据结构

```typescript
/**
 * @Require 字段类型检查上下文
 */
interface RequireTypeCheckContext {
  /** 字段名称 */
  fieldName: string;

  /** 是否有 @Require 修饰符 */
  hasRequireDecorator: boolean;

  /** 字段类型（TypeScript 类型节点） */
  fieldType: ts.TypeNode;

  /** 字段类型是否为 non-null（不含 undefined） */
  isNonNull: boolean;

  /** 参数值是否为显式 undefined */
  isExplicitUndefined: boolean;

  /** 参数值表达式（用于告警定位） */
  valueExpression: ts.Expression;

  /** 组件节点引用（用于告警定位） */
  node: ts.CallExpression;
}
```

### 3.2 non-null 类型判断规则

#### 3.2.1 non-null 类型定义

以下类型被视为 **non-null**（即不允许传递 `undefined`）：

| 类型类别 | 示例 | 说明 |
|----------|------|------|
| 基本类型 | `number`, `string`, `boolean` | 内置基本类型 |
| 非空联合类型 | `number \| string`, `A \| B` | 联合类型不包含 `undefined` |
| 对象类型 | `MyClass`, `interface Foo` | 类、接口、对象字面量类型 |
| 类型引用 | `Array<number>`, `Map<string, number>` | 泛型类型 |
| **类型别名** | `type A = number \| string` | 通过 TypeAlias 定义的类型，需解析别名后判断 |

#### 3.2.2 nullable 类型定义

以下类型被视为 **nullable**（即允许传递 `undefined`，不触发告警）：

| 类型类别 | 示例 | 说明 |
|----------|------|------|
| 包含 undefined 的联合类型 | `number \| undefined`, `T \| undefined` | 显式可选类型 |
| 可选类型语法 | `number?`（等价于 `number \| undefined`） | TypeScript 可选语法 |

#### 3.2.3 类型判断算法

```typescript
/**
 * 判断类型是否为 non-null（不含 undefined）
 */
function isNonNullType(type: ts.Type, checker: ts.TypeChecker): boolean {
  // 1. 检查是否为类型别名（TypeAlias），需要解析别名指向的实际类型
  if (type.isTypeParameter() || (type as any).aliasSymbol) {
    // 尝试获取类型别名指向的实际类型
    const aliasedType = getAliasedType(type, checker);
    if (aliasedType) {
      // 解析成功，递归检查实际类型
      return isNonNullType(aliasedType, checker);
    }
    // 解析失败（如 resolvedSymbol 查询不到），默认为 non-null
    // 容错策略：保守判断，避免误报
    return true;
  }

  // 2. 检查是否为联合类型
  if (type.isUnion()) {
    const unionTypes = type.types;
    // 如果联合类型包含 undefined，则为 nullable
    for (const unionType of unionTypes) {
      if (unionType.flags & ts.TypeFlags.Undefined) {
        return false;
      }
    }
    // 联合类型不包含 undefined，则为 non-null
    return true;
  }

  // 3. 检查类型是否直接包含 undefined
  if (type.flags & ts.TypeFlags.Undefined) {
    return false;
  }

  // 4. 其它情况视为 non-null
  return true;
}

/**
 * 获取类型别名指向的实际类型
 * @returns 解析成功返回实际类型，失败返回 null
 */
function getAliasedType(type: ts.Type, checker: ts.TypeChecker): ts.Type | null {
  try {
    const symbol = (type as any).aliasSymbol;
    if (symbol && symbol.declarations && symbol.declarations.length > 0) {
      const declaration = symbol.declarations[0] as ts.TypeAliasDeclaration;
      if (declaration && declaration.type) {
        return checker.getTypeFromTypeNode(declaration.type);
      }
    }
  } catch (e) {
    // 解析失败，返回 null
    console.debug(`Failed to resolve type alias: ${e.message}`);
  }
  return null;
}
```

### 3.3 显式 undefined 检测

```typescript
/**
 * 判断表达式是否为显式 undefined
 */
function isExplicitUndefined(expr: ts.Expression): boolean {
  // 检查是否为 undefined 字面量
  if (expr.kind === ts.SyntaxKind.Identifier) {
    const identifier = expr as ts.Identifier;
    return identifier.escapedText === 'undefined';
  }

  return false;
}
```

### 3.4 检查算法

```typescript
/**
 * 检查 @Require 字段类型一致性
 */
function checkRequireFieldConsistency(context: RequireTypeCheckContext): boolean {
  // 1. 无 @Require 修饰符，跳过检查
  if (!context.hasRequireDecorator) {
    return true; // 无问题
  }

  // 2. 字段类型为 nullable（含 undefined），跳过检查
  if (!context.isNonNull) {
    return true; // 无问题
  }

  // 3. 参数值为显式 undefined，触发告警
  if (context.isExplicitUndefined) {
    return false; // 需要告警
  }

  // 4. 其它情况无问题
  return true;
}
```

### 3.5 告警信息

```typescript
// TODO: 告警信息文本待定
const WARNING_MESSAGE = PLACEHOLDER;

// 告警位置指向传递 undefined 的表达式节点
```

---

## 四、实现决策记录

### D-001: 检查阶段选择

**决策：** 在组件参数传递检查阶段（`processComponent`）执行类型校验

**理由：**
- 参数传递时拥有完整的类型信息和参数值信息
- 与现有编译器检查流程一致
- 便于生成准确的告警位置

**取舍：**
- 不在 `@Require` 装饰器处理阶段检查，因为此时参数值信息可能不完整

### D-002: 仅检查显式 undefined

**决策：** 仅检查开发者显式传递的 `undefined`，不检查隐式缺失

**理由：**
- 显式传递 undefined 是明确的错误意图
- 隐式缺失可能由其它机制处理（如默认值）
- 降低误报率

**取舍：**
- 某些隐式问题可能未被捕获
- 但符合"显式优于隐式"的原则

### D-003: 不递归嵌套对象

**决策：** 仅检查顶层字段，不递归检查嵌套对象属性

**理由：**
- 嵌套对象检查复杂度高，收益相对较低
- 对象内部的类型校验可由其它机制处理
- 保持实现简单，降低维护成本

**取舍：**
- 嵌套对象内部的 undefined 不会触发告警
- 但这符合需求范围约定

### D-004: WARNING 级别告警

**决策：** 使用 WARNING 级别而非 ERROR

**理由：**
- 不影响现有代码的编译通过
- 给开发者灵活性处理
- 与现有编译器告警策略一致

---

## 五、测试策略

### 5.1 单元测试

| 测试用例 | 字段类型 | 传递值 | 预期输出 |
|----------|----------|--------|----------|
| non-null 基本 + undefined | `number` | `undefined` | WARNING |
| non-null 联合 + undefined | `number \| string` | `undefined` | WARNING |
| non-null 对象 + undefined | `MyClass` | `undefined` | WARNING |
| **non-null TypeAlias + undefined** | **`type A = number \| string`** | **`undefined`** | **WARNING** |
| nullable 联合 + undefined | `number \| undefined` | `undefined` | 无告警 |
| nullable 语法 + undefined | `number?` | `undefined` | 无告警 |
| **nullable TypeAlias + undefined** | **`type B = number \| undefined`** | **`undefined`** | **无告警** |
| non-null + 正常值 | `number` | `123` | 无告警 |
| non-null + null | `number` | `null` | 无告警（null 不是 undefined） |
| 无 @Require + undefined | `number` (无@Require) | `undefined` | 无告警 |

### 5.2 集成测试

| 测试用例 | 场景 | 预期输出 |
|----------|------|----------|
| 完整组件编译 | 编译包含 @Require 字段的组件 | 正确告警/不告警 |
| 嵌套对象场景 | 传递包含 undefined 的嵌套对象 | 不触发告警 |

### 5.3 回归测试

- 确保现有 @Require 字段正常使用不受影响
- 确保其它修饰符（@Prop, @State）不受影响

---

## 六、性能影响

- 时间复杂度：O(n) 每个 @Require 字段，n 为联合类型成员数量
- 空间复杂度：O(1) 每个检查上下文
- 仅在处理 `@Require` 字段时执行，不影响其它字段

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
| `decorator_processor.ts` | @Require 修饰符处理参考 |
| TypeScript Compiler API | 类型判断 API 参考 |
