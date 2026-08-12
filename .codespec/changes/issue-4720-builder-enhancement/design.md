# 设计文档 — @Builder自定义构建函数模块能力增强

## 一、设计概述

### 1.1 设计目标

增强@Builder自定义构建函数模块能力，包括：
1. 扩展wrapBuilder/mutableBuilder支持的参数来源
2. 对不支持的场景新增编译告警
3. 支持对象方法简写参数转换

### 1.2 约束条件

- 不修改TypeScript编译器核心
- 不新增Runtime API
- 不改变IDE/语法检查工具
- 告警级别为WARNING，不阻止编译
- 方法简写转换仅限@Builder函数参数

---

## 二、架构设计

### 2.1 模块定位

```
ace_ets2bundle/
└── compiler/src/
    ├── process_component_build.ts    ← 主要修改点（@Builder转换核心逻辑）
    ├── pre_define.ts                  ← 常量定义
    ├── checker/                       ← 验证规则（新增告警）
    └── transform/                     ← AST转换（方法简写转换）
```

### 2.2 处理流程

#### 第1部分：wrapBuilder参数来源扩展

```
                    ┌────────────────────────────────┐
                    │   wrapBuilder(expression)       │
                    └─────────────────┬──────────────┘
                                      │
                    ┌─────────────────▼──────────────┐
                    │   识别表达式类型                │
                    └─────────────────┬──────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│  当前支持的场景    │    │  新增场景1         │    │  新增场景2         │
│  - 直接引用        │    │  namespace访问     │    │  动态导入          │
│  - 属性访问        │    │  a.globalBuilder   │    │  (await import()) │
└───────────────────┘    └───────────────────┘    └───────────────────┘
        │                             │                             │
        └─────────────────────────────┼─────────────────────────────┘
                                      │
                    ┌─────────────────▼──────────────┐
                    │   统一处理：识别@Builder函数    │
                    │   创建WrappedBuilder对象        │
                    └────────────────────────────────┘
```

#### 第2部分：不支持场景告警

```
                    ┌────────────────────────────────┐
                    │   @Builder函数作为API参数        │
                    │   (如bindSheet第二个参数)        │
                    └─────────────────┬──────────────┘
                                      │
                    ┌─────────────────▼──────────────┐
                    │   检查表达式类型                │
                    └─────────────────┬──────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│  断言表达式        │    │  组合表达式        │    │  嵌套条件表达式    │
│  this.builder()!   │    │  (this.builder())  │    │ (a ? b1() : b2()) │
└───────────────────┘    └───────────────────┘    └───────────────────┘
        │                             │                             │
        └─────────────────────────────┼─────────────────────────────┘
                                      │
                    ┌─────────────────▼──────────────┐
                    │   输出WARNING告警               │
                    │   提示：该写法可能导致@Builder  │
                    │   转换失败，建议去掉包裹层      │
                    └────────────────────────────────┘
```

**说明：** 简单三元表达式（如`a ? b1 : b2`，无括号包裹且无函数调用）原本就支持编译转换，无需告警。仅有括号包裹且内部包含函数调用的嵌套条件表达式（如`(a ? b1() : b2())`）需要告警。

#### 第3部分：方法参数简写转换

```
                    ┌────────────────────────────────┐
                    │   @Builder函数调用               │
                    │   builder({...})                │
                    └─────────────────┬──────────────┘
                                      │
                    ┌─────────────────▼──────────────┐
                    │   遍历对象属性                  │
                    └─────────────────┬──────────────┘
                                      │
                    ┌─────────────────▼──────────────┐
                    │   检查是否为方法简写             │
                    │   onClick() {...}               │
                    └─────────────────┬──────────────┘
                                      │
         ┌────────────────────────────┴────────────────────────────┐
         │ 是方法简写？                                            │
         ▼                                                        ▼
  ┌──────────────────┐                                  ┌──────────────────┐
  │ 转换为函数表达式   │                                  │ 保持原样          │
  │ onClick:          │                                  │ property: value   │
  │   function() {...}│                                  └──────────────────┘
  └──────────────────┘
```

---

## 三、详细设计

### 3.1 第1部分：wrapBuilder参数来源扩展

#### 3.1.1 数据结构

```typescript
/**
 * Builder参数来源类型
 */
enum BuilderParamSourceType {
  /** 直接引用 - 当前支持 */
  DirectReference = 'direct',
  /** 属性访问 - 当前支持 */
  PropertyAccess = 'property',
  /** namespace成员访问 - 新增 */
  NamespaceMember = 'namespace',
  /** 动态导入 - 新增 */
  DynamicImport = 'dynamic-import'
}

/**
 * Builder参数分析结果
 */
interface BuilderParamAnalysis {
  /** 来源类型 */
  sourceType: BuilderParamSourceType;

  /** 是否为有效的@Builder函数 */
  isValidBuilder: boolean;

  /** 解析出的@Builder函数引用（新增场景下@Builder为全局函数） */
  builderFunction?: ts.FunctionDeclaration;

  /** 错误信息（如果无效） */
  error?: string;
}
```

#### 3.1.2 namespace成员访问识别

```typescript
/**
 * 识别namespace成员访问表达式
 * 示例：a.globalBuilder
 */
function isNamespaceMemberAccess(expr: ts.Expression): boolean {
  // 检查是否为属性访问表达式
  if (ts.isPropertyAccessExpression(expr)) {
    const { expression, name } = expr;

    // 检查左侧是否为导入的模块命名空间
    if (ts.isIdentifier(expression)) {
      // 需要验证该标识符是否为导入的模块
      return isImportedNamespace(expression);
    }
  }

  return false;
}

/**
 * 检查标识符是否为导入的命名空间
 */
function isImportedNamespace(identifier: ts.Identifier): boolean {
  // 通过Symbol查询验证
  const symbol = checker.getSymbolAtLocation(identifier);
  if (symbol && symbol.flags & ts.SymbolFlags.Namespace) {
    return true;
  }

  // 检查是否有对应的import语句
  const sourceFile = identifier.getSourceFile();
  // ... 遍历import语句验证

  return false;
}
```

#### 3.1.3 动态导入识别

```typescript
/**
 * 识别动态导入表达式
 * 示例：(await import('./A')).globalBuilder
 */
function isDynamicImportAccess(expr: ts.Expression): boolean {
  // 检查是否为属性访问表达式
  if (ts.isPropertyAccessExpression(expr)) {
    const { expression } = expr;

    // 检查左侧是否为Await表达式
    if (ts.isAwaitExpression(expression)) {
      const { expression: awaitExpr } = expression;

      // 检查await的参数是否为Call表达式（import()）
      if (ts.isCallExpression(awaitExpr)) {
        const { expression: callExpr } = awaitExpr;

        // 检查是否为import函数
        if (ts.isIdentifier(callExpr) && callExpr.escapedText === 'import') {
          return true;
        }
      }
    }
  }

  return false;
}
```

### 3.2 第2部分：不支持场景告警

#### 3.2.1 表达式包裹检测

```typescript
/**
 * 表达式包裹类型
 */
enum ExpressionWrapperType {
  /** 无包裹 */
  None = 'none',
  /** 断言表达式 ! */
  NonNullAssertion = 'nonnull-assertion',
  /** 类型断言 as */
  TypeAssertion = 'type-assertion',
  /** 括号包裹 */
  Parenthesized = 'parenthesized',
  /** 嵌套条件表达式（三元且内部有函数调用） */
  Conditional = 'conditional'
}

/**
 * 检测@Builder函数调用是否被包裹
 */
function detectBuilderExpressionWrapper(expr: ts.Expression): ExpressionWrapperType {
  // 1. 检查非空断言表达式!
  if (ts.isNonNullExpression(expr.parent)) {
    return ExpressionWrapperType.NonNullAssertion;
  }

  // 2. 检查类型断言 as
  if (ts.isAsExpression(expr.parent)) {
    return ExpressionWrapperType.TypeAssertion;
  }

  // 3. 检查括号包裹
  if (ts.isParenthesizedExpression(expr.parent)) {
    // 进一步检查父节点上下文
    return ExpressionWrapperType.Parenthesized;
  }

  // 4. 检查条件表达式（三元运算符）
  if (ts.isConditionalExpression(expr.parent)) {
    // 检查当前表达式是否为条件表达式的whenTrue或whenFalse分支
    const conditional = expr.parent as ts.ConditionalExpression;
    if (conditional.whenTrue === expr || conditional.whenFalse === expr) {
      return ExpressionWrapperType.Conditional;
    }
  }

  return ExpressionWrapperType.None;
}

/**
 * 检查并告警包裹的@Builder表达式
 */
function checkAndWarnWrappedBuilderExpression(
  expr: ts.Expression,
  context: ts.TransformationContext
): void {
  // 检查表达式是否为@Builder函数调用
  if (!isBuilderFunctionCall(expr)) {
    return;
  }

  // 检测包裹类型
  const wrapperType = detectBuilderExpressionWrapper(expr);

  // 如果被包裹，输出告警
  if (wrapperType !== ExpressionWrapperType.None) {
    const warningMsg = formatWrappedBuilderWarning(wrapperType);
    reportWarning(expr, warningMsg);
  }
}
```

#### 3.2.2 告警信息

```typescript
/**
 * 格式化包裹的@Builder告警信息
 */
function formatWrappedBuilderWarning(wrapperType: ExpressionWrapperType): string {
  const messages: Record<ExpressionWrapperType, string> = {
    [ExpressionWrapperType.None]: '',
    [ExpressionWrapperType.NonNullAssertion]:
      '@Builder函数被非空断言表达式(!)包裹，可能导致编译转换失败。',
    [ExpressionWrapperType.TypeAssertion]:
      '@Builder函数被类型断言表达式(as)包裹，可能导致编译转换失败。',
    [ExpressionWrapperType.Parenthesized]:
      '@Builder函数被括号包裹，可能导致编译转换失败。',
    [ExpressionWrapperType.Conditional]:
      '@Builder函数被条件表达式包裹，可能导致编译转换失败。'
  };

  const baseMsg = messages[wrapperType];
  return `${baseMsg}\n建议：直接使用@Builder函数，不要使用表达式包裹。`;
}
```

### 3.3 第3部分：方法参数简写转换

#### 3.3.1 方法简写识别

```typescript
/**
 * 对象方法简写转换
 * 在@Builder函数参数上下文中，将方法简写转换为函数表达式
 */
function transformObjectMethodShorthand(
  objLiteral: ts.ObjectLiteralExpression,
  isBuilderContext: boolean
): ts.ObjectLiteralExpression {
  if (!isBuilderContext) {
    return objLiteral;
  }

  const transformedProperties = objLiteral.properties.map(prop => {
    // 检查是否为方法简写（ShorthandPropertyAssignment with method body）
    if (ts.isShorthandPropertyAssignment(prop) && prop.objectAssignmentInitializer) {
      // 这实际上是一个方法简写
      // onClick() { ... }
      return factory.createPropertyAssignment(
        prop.name,
        factory.createFunctionExpression(
          /* modifiers */ undefined,
          /* asteriskToken */ undefined,
          /* name */ undefined,
          /* typeParameters */ undefined,
          /* parameters */ [],
          /* type */ undefined,
          /* body */ prop.objectAssignmentInitializer
        )
      );
    }

    return prop;
  });

  return factory.createObjectLiteralExpression(
    transformedProperties,
    /* multiLine */ objLiteral.properties.length > 1
  );
}
```

#### 3.3.2 @Builder上下文判断

```typescript
/**
 * 判断当前是否在@Builder函数参数上下文中
 */
function isInBuilderParameterContext(expr: ts.Expression): boolean {
  // 向上遍历AST，查找是否在@Builder函数调用中
  let current: ts.Node | undefined = expr.parent;

  while (current) {
    // 如果找到CallExpression
    if (ts.isCallExpression(current)) {
      // 检查调用的函数是否为@Builder函数
      if (isBuilderFunctionDeclaration(current.expression)) {
        return true;
      }
    }

    current = current.parent;
  }

  return false;
}

/**
 * 检查函数声明是否为@Builder函数
 */
function isBuilderFunctionDeclaration(node: ts.Node): boolean {
  // 检查装饰器
  if (ts.canHaveDecorators(node)) {
    const decorators = ts.getDecorators(node);
    return decorators?.some(d =>
      ts.isIdentifier(d.expression) &&
      d.expression.escapedText === 'Builder'
    ) ?? false;
  }

  return false;
}
```

---

## 四、实现决策记录

### D-001: namespace成员访问解析策略

**决策：** 通过TypeScript Symbol API解析namespace成员访问

**理由：**
- TypeScript Compiler API提供完整的符号信息
- 可以准确区分namespace和普通对象属性访问
- 支持ES6模块导入的namespace

**取舍：**
- 需要调用TypeScript API，增加复杂度
- 但准确性高于纯AST分析

### D-002: 动态导入支持范围

**决策：** 仅支持await import()语法，不支持纯Promise import()

**理由：**
- await import()是ES标准动态导入语法
- 编译时可以识别Await表达式
- 纯Promise需要额外处理，不在需求范围

**取舍：**
- `import('./A').then(m => m.globalBuilder)` 场景不支持
- 但符合需求描述中的语法示例

### D-003: 包裹表达式告警范围

**决策：** 仅在@Builder函数作为特定API参数（如bindSheet）时告警

**理由：**
- 这些场景下@Builder转换是必需的
- 普通场景下包裹可能是有意的

**取舍：**
- 需要识别特定API调用
- 告警可能不够全

### D-004: 方法简写转换限制

**决策：** 仅在@Builder函数参数上下文中转换

**理由：**
- 限制转换范围，避免影响其它场景
- 符合需求描述

**取舍：**
- 需要准确的上下文判断
- 上下文判断可能复杂

---

## 五、测试策略

### 5.1 第1部分测试

| 测试用例 | 场景 | 预期输出 |
|----------|------|----------|
| namespace成员访问 | `wrapBuilder(a.globalBuilder)` | 编译成功 |
| 动态导入 | `wrapBuilder((await import('./A')).globalBuilder)` | 编译成功 |
| 当前支持场景保持 | `wrapBuilder(globalBuilder)` | 编译成功（无回归） |

### 5.2 第2部分测试

| 测试用例 | 场景 | 预期输出 |
|----------|------|----------|
| 断言表达式 | `bindSheet(x, this.builder()!, opts)` | WARNING |
| 括号包裹 | `bindSheet(x, (this.builder()), opts)` | WARNING |
| 嵌套条件表达式 | `bindSheet(x, (a ? b1() : b2()), opts)` | WARNING |
| 简单三元表达式 | `bindSheet(x, a ? b1 : b2, opts)` | 无告警（原本支持） |
| 无包裹正常 | `bindSheet(x, this.builder(), opts)` | 无告警 |

### 5.3 第3部分测试

| 测试用例 | 场景 | 预期输出 |
|----------|------|----------|
| 方法简写 | `builder({ onClick() {...} })` | 转换成功 |
| 混合场景 | `builder({ x: 1, onClick() {...} })` | 部分转换 |
| 非Builder参数 | `otherFunc({ onClick() {...} })` | 不转换 |

---

## 六、性能影响

- **时间复杂度**：O(n) n为参数表达式嵌套层级
- **空间复杂度**：O(1) 每个检查点
- **影响范围**：仅涉及@Builder相关转换，不影响其它编译路径

---

## 七、安全与合规

- 不涉及用户数据处理
- 不涉及网络安全
- 不涉及权限控制
- 纯编译器AST转换能力

---

## 八、参考资料

| 资源 | 说明 |
|------|------|
| `compiler/src/process_component_build.ts` | @Builder转换核心逻辑 |
| `compiler/src/checker/` | 验证规则模块 |
| `compiler/src/transform/` | AST转换模块 |
| TypeScript Compiler API | AST类型和Symbol API |
