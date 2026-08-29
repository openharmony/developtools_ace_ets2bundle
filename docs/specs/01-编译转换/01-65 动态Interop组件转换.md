# 功能概述
动态工具链的 Interop 组件转换处理 V1/V2 混合编译场景下自定义组件的静态创建（`createStaticComponent`）、静态选项构造（`createStaticComponentOptions`）、条件分支（`createIfStaticComponent`）和箭头块（`createStaticArrowBlock`），通过 `__Interop_CreateStaticComponent_Internal` 在首次渲染时创建静态组件实例并缓存。

## 动态
### 源码参考位置
- `compiler/src/process_interop_component.ts`（`createStaticArrowBlock`）
- `compiler/src/process_interop_component.ts`（`createIfStaticComponent`）
- `compiler/src/process_interop_component.ts`（`createInteropExtendableComponent`）
- `compiler/src/process_interop_component.ts`（`setInteropRenderingFlag`/`resetInteropRenderingFlag`）
- `compiler/src/process_interop_component.ts`（`createStaticOptions`）
- `compiler/src/process_interop_component.ts`（`createStaticComponentOptions`）
- `compiler/src/process_interop_component.ts`（`makeStaticFactory`）
- `compiler/src/process_interop_component.ts`（`getBuilderParamCount`）
- `compiler/src/process_interop_component.ts`（`transformBuilderParam`）
- `compiler/src/process_interop_component.ts`（`cloneExpressionClean`）
- `compiler/src/process_interop_component.ts`（`transformLink`）
- `compiler/src/process_interop_component.ts`（`getStateVar`）
- `compiler/src/process_interop_component.ts`（`createStaticComponent`）
- `compiler/src/process_interop_component.ts`（`pushStaticComponent`）
- `compiler/src/process_interop_component.ts`（`popStaticComponent`）
- `compiler/src/process_interop_component.ts`（`createStaticTuple`）
- `compiler/src/process_interop_component.ts`（`validateInteropProperty`，V1/V2 混用校验）
- `compiler/src/process_interop_component.ts`（`insertGetOptionsAtTop`）
- `compiler/src/process_interop_component.ts`（`generateBytecodePathFragement`）
- `compiler/src/process_interop_ui.ts`（`createCustomTransformer`）
- `compiler/src/process_interop_builder.ts`（`updateInteropObjectLiteralxpression`）
- `compiler/src/pre_define.ts`（`CREATESTATICCOMPONENT = '__Interop_CreateStaticComponent_Internal'`）
- `compiler/src/pre_define.ts`（`UPDATESTATICCOMPONENT = '__Interop_UpdateStaticComponent_Internal'`）

### 转换前的原始代码
```typescript
@Component
struct ParentComp {
  build() {
    // V1 父组件中使用 interop 子组件
    ChildComp({ text: 'hello', count: this.count })
  }
}

// interop 子组件（由 interop 插件生成的 class）
class ChildComp extends PUV2ViewBase {
  __backing_text: ObservedPropertySimplePU<string>
  __backing_count: SynchedPropertySimpleTwoWayPU<number>
  // ...
}
```

### 转换后的代码（Legacy）
```typescript
class ParentComp extends View {
  initialRender() {
    // 声明 static tuple 变量
    let static_ChildComp: [ChildComp, number];

    // observeComponentCreation2 内部的 createStaticArrowBlock
    this.__interopInStaticRendering_internal_ = true;
    if (isInitialRender) {
      __Interop_UpdateInteropExtendableComponent_Internal(this);
      static_ChildComp = __Interop_CreateStaticComponent_Internal(
        () => { return new ChildComp(undefined, undefined); },
        () => {
          const result = new __Options_ChildComp();
          result['text'] = 'hello';
          result['__options_has_text'] = true;
          result['__backing_count'] = __Interop_createCompatibleStaticState_Internal(this.__count);
          result['__options_has_count'] = true;
          return result;
        }
      );
      __Interop_ResetInteropExtendableComponent_Internal();
      ViewStackProcessor.push(static_ChildComp[1]);
      ViewStackProcessor.pop();
    } else {
      static_ChildComp[0]();
    }
    this.__interopInStaticRendering_internal_ = false;
  }
}

// 文件顶部注入
const __Options_ChildComp = (globalThis as any).Panda.getClass('L.../__Options_ChildComp$ObjectLiteral;');
```

### 转换后的代码（Partial Update）
```typescript
// Partial Update 模式下行为一致，interop 组件变换不区分 Legacy/Partial Update
class ParentComp extends ViewPU {
  // 同上 createStaticArrowBlock 逻辑
}
```

### 关键转换逻辑

#### 1. createStaticArrowBlock
生成三语句块：
```typescript
[
  setInteropRenderingFlag(),          // this.__interopInStaticRendering_internal_ = true
  createIfStaticComponent(...),       // if (isInitialRender) { 创建+push+pop } else { static_X[0]() }
  resetInteropRenderingFlag()         // this.__interopInStaticRendering_internal_ = false
]
```

#### 2. createIfStaticComponent
```typescript
if (isInitialRender) {
  __Interop_UpdateInteropExtendableComponent_Internal(this);
  static_ChildComp = __Interop_CreateStaticComponent_Internal(factory, optionsFactory);
  __Interop_ResetInteropExtendableComponent_Internal();
  ViewStackProcessor.push(static_ChildComp[1]);  // push 实例 ID
  ViewStackProcessor.pop();
} else {
  static_ChildComp[0]();  // 调用更新函数
}
```

#### 3. createStaticComponent
```typescript
static_ChildComp = __Interop_CreateStaticComponent_Internal(
  makeStaticFactory(name, componentNode),  // () => new ChildComp(undefined, undefined)
  createStaticComponentOptions(options, name)  // () => { const result = new __Options_ChildComp(); ... }
)
```

#### 4. createStaticComponentOptions
- 创建 `const result = new __Options_ChildComp()`
- 遍历 ObjectLiteralExpression 的属性：
  - **普通属性**：`result['key'] = value; result['__options_has_key'] = true;`
  - **@Link 属性**（在 `linkCollection` 中）：`result['__backing_key'] = __Interop_createCompatibleStaticState_Internal(this.__key)`
  - **@BuilderParam 属性**（在 `builderParamObjectCollection` 中）：通过 `transformBuilderParam` 处理
- 返回箭头函数 `() => { ... return result; }`

#### 5. transformBuilderParam
```typescript
// 动态 builder 转换
__Interop_transferCompatibleDynamicBuilder_N_Internal(
  this.builder.bind(this)
)
// N = builderParamCount（0-10），通过 getBuilderParamCount 解析
```

#### 6. transformLink
```typescript
__Interop_createCompatibleStaticState_Internal(this.__count)
// getStateVar: this.xxx → this.__xxx
```

#### 7. generateBytecodePathFragement
- 从 `declgenV1` 输出路径提取类名和包名
- 生成字节码路径：`L<targetPath>/<packageName$...>__Options_<className>$ObjectLiteral;`

#### 8. insertGetOptionsAtTop
- 在 SourceFile 顶部注入 `const __Options_ChildComp = (globalThis as any).Panda.getClass('...')` 语句

#### 9. validateInteropProperty
- V1 父 + V2 子：报错 10905501（`@ComponentV2 cannot be used in @Component`）
- V2 父 + V1 子：报错 10905501（`@Component cannot be used in @ComponentV2`）

### 与静态工具链 Interop 的区别

| 维度 | 动态工具链（本文档） | 静态工具链（01-61 interop变换） |
|---|---|---|
| AST 类型 | TypeScript AST | es2panda AST |
| 插件入口 | `process_interop_component.ts` | `interop-plugins/decl_transformer.ts` |
| struct → class | `processComponentClass` | `decl_transformer.ts`（parsed 阶段） |
| 静态创建 | `__Interop_CreateStaticComponent_Internal` | `__Interop_CreateStaticComponent_Internal` |
| 选项类 | `__Options_<ClassName>` | `__Options_<ClassName>` |
| bytecode 路径 | `generateBytecodePathFragement` | `decl_transformer.ts` 内生成 |
| V1/V2 校验 | `validateInteropProperty` | linter 规则 |
| builder param | `transformBuilderParam` | `interop-plugins/emit_transformer.ts` |
| 触发时机 | `process_component_build.ts` 变换中 | interop 插件流水线 |

## 静态
### 源码参考位置
静态工具链的 Interop 处理详见 `01-61 interop变换.md`，此处仅列出关键差异。

### 转换前的原始代码
```typescript
// 同上动态工具链场景
@Component
struct ParentComp {
  build() { ChildComp({ text: 'hello' }) }
}
```

### 转换后的代码
```typescript
// 静态工具链通过 interop-plugins 处理 struct → class
class ParentComp extends CustomComponent {
  __initializeStruct(initializers, content) {
    this.__backing_ChildComp = __Interop_CreateStaticComponent_Internal(...)
  }
}
```

## 动静态差异说明

| 维度 | 动态工具链 | 静态工具链 |
|---|---|---|
| AST 类型 | TypeScript AST | es2panda AST |
| 静态创建 API | `__Interop_CreateStaticComponent_Internal` | 相同 |
| 选项类注入 | `insertGetOptionsAtTop`（文件级） | emit_transformer |
| Link 转换 | `transformLink` → `__Interop_createCompatibleStaticState_Internal` | 相同 |
| BuilderParam | `transformBuilderParam` + `getBuilderParamCount` | emit_transformer |
| bytecode 路径 | `generateBytecodePathFragement` | decl_transformer |
| V1/V2 校验 | `validateInteropProperty` | linter 规则 |
| AccessRecording | Partial Update 模式包裹 | 无 |
| 输出差异 | Legacy 和 Partial Update 一致 | parsed + checked |
