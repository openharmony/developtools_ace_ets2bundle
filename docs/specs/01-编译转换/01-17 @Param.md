# 功能概述
`@Param` 装饰器标记 V2 组件的入参属性，允许父组件向子组件单向传递数据，子组件内部可修改但不会同步回父组件。

## 动态
### 源码参考位置
- `compiler/src/process_struct_componentV2.ts`（`processParamProperty`）
- `compiler/src/process_struct_componentV2.ts`（`parseParamDecorator`）
- `compiler/src/pre_define.ts`（`COMPONENTV2_PARAM_DECORATOR = '@Param'`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyComponent {
  @Param title: string = ''
  build() { Text(this.title) }
}
```

### 转换后的代码（Legacy）
V2 装饰器仅支持 Partial Update 模式，无 Legacy 输出。

### 转换后的代码（Partial Update）
```typescript
class MyComponent extends ViewV2 {
  title: string = ''
  constructor(parent, params, __localStorage, elmtId, paramsLambda, extraInfo) {
    super(parent, elmtId, extraInfo)
    this.title = ('title' in params) ? params.title : ''
    this.finalizeConstruction()
  }
  updateStateVars(params: Object) {
    if ('title' in params) { this.updateParam('title', params.title) }
  }
  resetStateVarsOnReuse(params: Object) {
    this.resetParam('title', ('title' in params) && params.title)
  }
  initialRender() { /* 命令式 */ }
  rerender() { this.updateDirtyElements() }
}
```

### 关键转换逻辑
- `processParamProperty`：移除 `@Require` 装饰器，保留属性声明。
- `parseParamDecorator`：将属性名和初始化值存入 `structInfo.paramDecoratorMap`。
- 构造函数中通过 `createInitOrUpdateParam`生成 `this.initParam('title', ...)` 初始化。
- `updateStateVars` 中通过 `updateParamNode`生成 `if ('title' in params) { this.updateParam('title', params.title) }`。

## 静态
### 源码参考位置
- `arkui-plugins/ui-plugins/property-translators/param.ts`（`ParamTranslator`）
- `arkui-plugins/common/predefines.ts`（`DecoratorNames.PARAM = 'Param'`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyComponent {
  @Param title: string = ''
  build() { Text(this.title) }
}
```

### 转换后的代码
```typescript
class MyComponent extends CustomComponentV2 {
  private __backing_title: IParamDecoratedVariable<string>
  get title(): string { return this.__backing_title!.get() }

  __initializeStruct(initializers, content): void {
    this.__backing_title = STATE_MGMT_FACTORY.makeParam<string>("title", init)
  }
  __updateStruct(initializers, content): void {
    // 更新逻辑
  }
}
```

### 深度逻辑
- `makeType = MAKE_PARAM`，`hasSetter = false`（不生成 setter，外部不能直接赋值），`hasUpdateStruct = true`（生成 `__updateStruct` 用于父组件更新）。
- `hasResetOnReuse = true`：复用时通过 `resetOnReuseWithParamProperty` 重新计算初始值。
- 声明文件：`@Param`，`IParamDecoratedVariable<T> extends IDecoratedImmutableVariable, IDecoratedUpdatableVariable, IDecoratedV2Variable`。
- `compiler/src/constant_define.ts`（`RESET_COMPUTED`）

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 初始化 | `this.initParam('title', ...)` | `STATE_MGMT_FACTORY.makeParam` 工厂 |
| 更新机制 | `updateStateVars` + `this.updateParam` | `__updateStruct` |
| setter | 无（普通属性可直接赋值） | 无（`hasSetter = false`） |
| 声明接口 | 无 | `IParamDecoratedVariable<T>` |
