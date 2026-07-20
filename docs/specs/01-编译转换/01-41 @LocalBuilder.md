# 功能概述
`@LocalBuilder` 装饰器标记组件内的局部构建方法，编译器将其方法声明转换为箭头函数属性（确保 `this` 词法绑定），且不追加 `parent` 参数（通过 `this` 访问父组件），在 Partial Update 模式下额外注入 `globalBuilderParamAssignment` 从 `contextStack` 获取 parent。

## 动态
### 源码参考位置
- `compiler/src/pre_define.ts:122`（`COMPONENT_LOCAL_BUILDER_DECORATOR = '@LocalBuilder'`）
- `compiler/src/process_component_class.ts:997-1017`（`isBuilderOrLocalBuilder`）
- `compiler/src/process_component_class.ts:890-957`（`processComponentMethod` 中 localBuilder 分支）
- `compiler/src/process_component_class.ts:1019-1028`（`localBuilderNode`）
- `compiler/src/process_ui_syntax.ts:272`（`hasLocalBuilderInFile`）
- `compiler/src/process_ui_syntax.ts:516-555`（`globalBuilderParamAssignment`）
- `compiler/src/pre_define.ts:129-130`（`STRUCT_CONTEXT_METHOD_DECORATORS` 包含 `@LocalBuilder`）

### 转换前的原始代码
```typescript
@Component
struct MyComp {
  @LocalBuilder
  myBuilder($$: string) {
    Text($$)
  }

  build() {
    this.myBuilder('hello')
  }
}
```

### 转换后的代码（Legacy）
```typescript
class MyComp extends View {
  myBuilder = ($$: string, myIds: []) => {
    Text($$)
  }

  // build 转换后调用
  initialRender() {
    this.myBuilder('hello')
  }
}
```

> 注意：Legacy 模式下 `@LocalBuilder` 不追加 `parent` 参数（与 `@Builder` 不同），但会追加 `myIds` 参数（当 `optLazyForEach` 启用时）。

### 转换后的代码（Partial Update）
```typescript
class MyComp extends ViewPU {
  // Partial Update 模式下，body 首部注入 globalBuilderParamAssignment
  myBuilder = ($$: string, myIds: []) => {
    const parent = (PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.length)
      ? PUV2ViewBase.contextStack[PUV2ViewBase.contextStack.length - 1]
      : null;
    Text($$)
  }

  // 文件首部注入（hasLocalBuilderInFile 为 true 时）
  // checkContextStack() 和 checkFinalizeConstruction()
}
```

### 关键转换逻辑
1. **识别装饰器**（`isBuilderOrLocalBuilder:997-1017`）：遍历装饰器，通过 `getText().replace(/\(.*\)$/, '')` 去除参数后匹配 `@LocalBuilder`。匹配时设置 `builderCondition.isLocalBuilder = true`。
2. **不追加 parent 参数**（line 934）：`if (!builderCondition.isLocalBuilder) { parameters.push(createParentParameter()); }` — `@LocalBuilder` 跳过追加 parent，通过 `this` 访问。
3. **追加 myIds 参数**（line 937-938）：当 `projectConfig.optLazyForEach` 启用时，追加 `myIds` 参数。
4. **globalBuilderParamAssignment 注入**（line 942-944）：`partialUpdateConfig.partialUpdateMode && builderCondition.isLocalBuilder && node.body.statements.length` 时，在 componentBlock 首部插入 `globalBuilderParamAssignment()`。
5. **方法 -> 箭头函数属性**（`localBuilderNode:1019-1028`）：通过 `ts.factory.createPropertyDeclaration` 创建属性，值为 `ts.factory.createArrowFunction`，保留原参数和 body。
6. **文件级注入**（`process_ui_syntax.ts:272-274`）：当 `storedFileInfo.hasLocalBuilderInFile` 为 true 且 Partial Update 模式时，在文件首部注入 `checkContextStack()`。

### @LocalBuilder vs @Builder 对比

| 维度 | @Builder | @LocalBuilder |
|---|---|---|
| parent 参数 | 追加 `parent = null` | 不追加，通过 `this` 访问 |
| this 绑定 | 通过 parent 参数显式传递 | 词法绑定（箭头函数属性） |
| Partial Update 注入 | 无 globalBuilderParamAssignment | 有，从 contextStack 获取 parent |
| 文件级注入 | 无 checkContextStack | 有 checkContextStack |
| 方法声明形式 | 保持方法声明或函数声明 | 转为箭头函数属性 |
| 全局可用 | 是（可声明在 struct 外） | 否（仅 struct 内方法） |

## 静态
### 源码参考位置
静态工具链（arkui-plugins）不直接处理 `@LocalBuilder`。静态工具链中的 Builder 变换通过 `builder-lambda-translators/` 处理 `@Builder`，`@LocalBuilder` 的处理逻辑通过 `@Builder` 的通用路径间接覆盖。

### 转换前的原始代码
```typescript
@Component
struct MyComp {
  @LocalBuilder
  myBuilder($$: string) {
    Text($$)
  }
  build() { this.myBuilder('hello') }
}
```

### 转换后的代码
```typescript
// 静态工具链中 struct -> class 变换后，@LocalBuilder 方法保留为方法声明
// builder-lambda 变换通过 __makeBuilderParameterProxy 处理
class MyComp extends CustomComponent {
  __backing_myBuilder = ($$: string) => { Text($$) }
  myBuilder($$: string) { this.__backing_myBuilder($$) }
  initialRender() { /* 命令式 */ }
}
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 方法 -> 箭头函数属性 | 是（`localBuilderNode`） | 否，通过 backing 字段间接处理 |
| parent 参数 | 不追加 | 通过 this |
| globalBuilderParamAssignment | Partial Update 模式注入 | 无 |
| contextStack | 从 PUV2ViewBase.contextStack 获取 | 无 |
| this 词法绑定 | 箭头函数属性确保 | 方法声明 + backing 字段 |
| checkContextStack 文件级注入 | 有 | 无 |
