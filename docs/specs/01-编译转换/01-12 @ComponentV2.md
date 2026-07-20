# 功能概述
`@ComponentV2` 装饰器标记 V2 自定义组件，触发 struct -> class 转换，基类为 `ViewV2`（动态）/ `CustomComponentV2`（静态）。

## 动态
### 源码参考位置
- `compiler/src/process_struct_componentV2.ts:135`（`processStructComponentV2`）
- `compiler/src/process_struct_componentV2.ts:202`（`processStructMembersV2`）
- `compiler/src/process_struct_componentV2.ts:747`（`processStructConstructorV2`）
- `compiler/src/constant_define.ts:62`（`STRUCT_PARENT = 'ViewV2'`）
- `compiler/src/pre_define.ts:28`（`COMPONENT_V2_DECORATOR = '@ComponentV2'`）

### 转换前的原始代码
```typescript
@ComponentV2
struct MyV2Component {
  @Local count: number = 0
  @Param title: string = ''
  build() { Text(this.title) }
}
```

### 转换后的代码（仅 Partial Update 模式）
```typescript
class MyV2Component extends ViewV2 {
  count: number = 0
  title: string = ''
  constructor(parent, params, __localStorage, elmtId, paramsLambda, extraInfo) {
    super(parent, elmtId, extraInfo)
    this.count = ('count' in params) ? params.count : 0
    this.title = ('title' in params) ? params.title : ''
    this.finalizeConstruction()
  }
  updateStateVars(params: Object) {
    if ('title' in params) { this.updateParam('title', params.title) }
  }
  resetStateVarsOnReuse(params: Object) { /* 复用时重置 */ }
  initialRender() { /* 命令式 */ }
  rerender() { this.updateDirtyElements() }
}
```

### 转换后的代码（Legacy）
@ComponentV2 仅支持 Partial Update 模式，无 Legacy 模式输出。V2 组件基类为 `ViewV2`，不存在 Legacy 的 `View` 基类分支。

### 关键转换逻辑
- V2 装饰器不生成 ObservedProperty 包装类，保持普通属性，通过 `initParam`/`updateParam`/`resetParam` 方法管理
- `processStructMembersV2`（line 202-251）：遍历成员，属性交 `processComponentProperty`，方法交 `processComponentMethod`
- `processStructConstructorV2`（line 747-759）：构造函数参数固定为 `parent, params, __localStorage, elmtId, paramsLambda, extraInfo`
- `createInitOrUpdateParam`（line 830-850）：生成 `this.initParam('prop', ('prop' in params) ? params.prop : default)` 或 `this.resetParam(...)`
- `updateParamNode`（line 852-865）：生成 `if ('prop' in params) { this.updateParam('prop', params.prop) }`
- 若是 `@ReusableV2`，注入 `@__ReusableV2_Inner_Decorator__` 装饰器

## 静态
### 源码参考位置
- `arkui-plugins/common/predefines.ts:122`（`StructDecoratorNames.COMPONENT_V2 = 'ComponentV2'`）
- `arkui-plugins/common/predefines.ts:584`（`COMPONENT_V2_CLASS_NAME = 'CustomComponentV2'`）
- `arkui-plugins/ui-plugins/component-transformer.ts:691`（`getComponentExtendsName`，选择 `CustomComponentV2`）

### 转换后的代码
```typescript
class MyV2Component extends CustomComponentV2<MyV2Component, __Options_MyV2Component> {
  // ...
  static _invokeImpl(style, initializers, storage, reuseId, content, sClass): void {
    // sClass: { sClass: Class.from<MyV2Component>() }
  }
}
```

- `processStructMembersV2`（`process_struct_componentV2.ts:202`）：遍历成员，属性交 `processComponentProperty`，方法交 `processComponentMethod`
- `processStructConstructorV2`（`:747`）：构造函数参数固定为 `parent, params, __localStorage, elmtId, paramsLambda, extraInfo`
- `createInitOrUpdateParam`（`:830`）：生成 `this.initParam('prop', ('prop' in params) ? params.prop : default)`
- `updateParamNode`（`:852`）：生成 `if ('prop' in params) { this.updateParam('prop', params.prop) }`
- `createResetStateVarsOnReuse`（`:780`）：生成复用时重置方法，含 `resetMonitorsOnReuse`

- V2 装饰器不生成 ObservedProperty 包装类，保持普通属性
- 通过 `initParam`/`updateParam`/`resetParam` 方法管理状态
- `createInitOrUpdateParam`（`:830`）：生成 `this.initParam('prop', ...)`
- `updateParamNode`（`:852`）：生成 `if ('prop' in params) { this.updateParam('prop', params.prop) }`
- `createResetStateVarsOnReuse`（`:780`）：生成复用时重置方法

### 转换后的代码（Partial Update）
```typescript
class MyV2Component extends ViewV2 {
  count: number = 0
  constructor(parent, params, __localStorage, elmtId, paramsLambda, extraInfo) {
    super(parent, elmtId, extraInfo)
    this.count = ('count' in params) ? params.count : 0
    this.finalizeConstruction()
  }
  updateStateVars(params: Object) {
    if ('count' in params) { this.updateParam('count', params.count) }
  }
  initialRender() { /* 命令式 */ }
  rerender() { this.updateDirtyElements() }
}

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| 基类 | `ViewV2` | `CustomComponentV2` |
| 属性管理 | `initParam`/`updateParam`/`resetParam` 方法 | `STATE_MGMT_FACTORY.makeLocal`/`makeParam` 工厂 |
| V2 特有方法 | `updateStateVars`/`resetStateVarsOnReuse` | `__updateStruct`/`resetStateVarsOnReuse` |
| sClass | 无 | `Class.from<MyV2Component>()` 传递给 `_invokeImpl` |
