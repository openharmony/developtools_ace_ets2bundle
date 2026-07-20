# ArkUI 工具链能力总览

## 概述

本目录基于对动态工具链（`compiler/`，TypeScript AST）和静态工具链（`arkui-plugins/`，es2panda AST）的深度静态代码分析，梳理出 ArkUI 声明式 UI 编译工具链已实现的 **编译转换规格**（71 篇）和 **校验规则规格**（34 篇），共 105 篇文档。

## 规格树结构

```text
docs/specs/
    |- 01-编译转换 (71 篇)
        |- 01-01 ~ 01-10: 声明式基础与组件 (10 篇)
        |- 01-11 ~ 01-12: 组件装饰器 V1/V2 (2 篇)
        |- 01-13 ~ 01-15: 内部状态与计算属性 (3 篇)
        |- 01-16 ~ 01-20: 参数传递与事件 (5 篇)
        |- 01-21: 双向同步 (1 篇)
        |- 01-22 ~ 01-26: 对象观察 V1/V2 (5 篇)
        |- 01-27 ~ 01-30: 跨层传递 V1/V2 (4 篇)
        |- 01-31 ~ 01-34: 存储同步 (4 篇)
        |- 01-35 ~ 01-37: 监听 V1/V2 (3 篇)
        |- 01-38 ~ 01-39: 环境变量 (2 篇)
        |- 01-40 ~ 01-43: 构建函数 (4 篇)
        |- 01-44 ~ 01-46: 样式扩展 (3 篇)
        |- 01-47 ~ 01-48: 复用 V1/V2 (2 篇)
        |- 01-49 ~ 01-51: 入口与生命周期 (3 篇)
        |- 01-52 ~ 01-55: 通用/系统装饰器 (4 篇)
        |- 01-56 ~ 01-59: 控制流 (4 篇)
        |- 01-60 ~ 01-61: 资源引用 (2 篇)
        |- 01-62 ~ 01-63: 双向数据绑定 (2 篇)
        |- 01-64 ~ 01-66: Interop 变换 (3 篇)
        |- 01-67 ~ 01-71: 编译基础设施 (5 篇)
    |- 02-校验规则 (34 篇)
        |- 02-01 ~ 02-03: struct/装饰器基础 (3 篇)
        |- 02-04 ~ 02-19: 装饰器使用校验 (16 篇)
        |- 02-20 ~ 02-22: 复用校验 (3 篇)
        |- 02-23 ~ 02-26: struct 校验 (4 篇)
        |- 02-27 ~ 02-29: 组件校验 (3 篇)
        |- 02-30 ~ 02-32: Entry/Preview 校验 (3 篇)
        |- 02-33 ~ 02-34: 命名与 UI 一致性 (2 篇)
```

## 01-编译转换

### 声明式基础与组件（01-01 ~ 01-10）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-01 | struct转换 | `@Component`/`@ComponentV2` struct → class 转换，生成构造函数、生命周期方法、`render`/`initialRender` |
| 01-02 | 尾随闭包 | 组件尾随闭包语法 → create/pop 模式或注入 `@BuilderParam` |
| 01-03 | 通用属性转换 | 链式属性调用 → `Component.attr(args)` 命令式序列 |
| 01-04 | 手势属性转换 | `.gesture()`/`.parallelGesture()`/`.priorityGesture()` → `Gesture.create(GesturePriority.XXX)` |
| 01-05 | 动画属性转换 | `.animation()` → `Context.animation()` + `lastStatement` 机制 |
| 01-06 | 多态样式转换 | `.stateStyles()` → `ViewStackProcessor.visualState()` 嵌套展开 |
| 01-07 | 事件属性转换 | `.onClick` 等事件属性 → `Component.attr(args)` 通用路径 |
| 01-08 | Modifier属性转换 | `attributeModifier`/`contentModifier` → `Component.attr.bind(this)(args)` |
| 01-09 | 组件转换 | 内置组件 create/pop、自定义组件实例化、7 个特殊组件处理（Button/Blank/Search/ContainerReader/XComponent/Navigation/TabContent/ListItem）、内置组件清单 |
| 01-10 | CustomDialog | `@CustomDialog` struct → `BaseCustomDialog` 子类 + Controller builder 变换 |

### 组件装饰器 V1/V2（01-11 ~ 01-12）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-11 | @Component | V1 组件装饰器，struct → `View`/`ViewPU` 子类，触发构造函数和生命周期方法生成 |
| 01-12 | @ComponentV2 | V2 组件装饰器，struct → `ViewV2`/`CustomComponentV2` 子类，`initParam`/`updateParam`/`resetParam` 管理 |

### 内部状态与计算属性（01-13 ~ 01-15）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-13 | @State | V1 内部状态 → `ObservedPropertySimple`/`ObservedPropertySimplePU` 或 `STATE_MGMT_FACTORY.makeState` |
| 01-14 | @Local | V2 内部状态 → `STATE_MGMT_FACTORY.makeLocal`，支持静态 `@Local` |
| 01-15 | @Computed | V2 计算属性 getter → `STATE_MGMT_FACTORY.makeComputed`，依赖自动追踪 |

### 参数传递与事件（01-16 ~ 01-20）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-16 | @Prop | V1 单向传递 → `SynchedPropertySimpleOneWay`（已 deprecated，由 @PropRef 替代） |
| 01-17 | @Param | V2 单向入参 → `STATE_MGMT_FACTORY.makeParam`，不可外部赋值 |
| 01-18 | @Once | V2 一次性入参 → `STATE_MGMT_FACTORY.makeParamOnce`，仅初始化时同步 |
| 01-19 | @Event | V2 事件回调 → 常规属性形式，默认空函数 |
| 01-20 | @Require | 标记必填项，放宽默认值要求，本身不生成运行时代码 |

### 双向同步（01-21）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-21 | @Link | V1 双向同步 → `SynchedPropertySimpleTwoWay`，不允许默认值 |

### 对象观察 V1/V2（01-22 ~ 01-26）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-22 | @ObjectLink | V1 对象引用 → `SynchedPropertyNesedObject`，immutable |
| 01-23 | @Observed | V1 可观察类标记，配合 @Track 实现精确追踪 |
| 01-24 | @ObservedV2 | V2 可观察类标记，配合 @Trace 实现细粒度监听 |
| 01-25 | @Track | V1 可追踪属性，仅用于 @Observed class |
| 01-26 | @Trace | V2 可观察属性，`fireChange` 通知，`UIUtils.makeObserved` |

### 跨层传递 V1/V2（01-27 ~ 01-30）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-27 | @Provide | V1 祖先提供 → `addProvidedVar`，支持 alias/allowOverride |
| 01-28 | @Consume | V1 后代消费 → `initializeConsume`，跨层级查找 |
| 01-29 | @Provider | V2 状态提供 → `STATE_MGMT_FACTORY.makeProvider` |
| 01-30 | @Consumer | V2 状态消费 → `STATE_MGMT_FACTORY.makeConsumer` |

### 存储同步（01-31 ~ 01-34）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-31 | @StorageLink | AppStorage 双向同步 → `AppStorage.SetAndLink` |
| 01-32 | @StorageProp | AppStorage 单向只读 → `AppStorage.SetAndProp`（已 deprecated） |
| 01-33 | @LocalStorageLink | LocalStorage 双向同步 → `createLocalStorageLink` |
| 01-34 | @LocalStorageProp | LocalStorage 单向只读 → `createLocalStorageProp`（已 deprecated） |

### 监听 V1/V2（01-35 ~ 01-37）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-35 | @Watch | V1 变更回调 → `declareWatch`，注册到 watchMap |
| 01-36 | @Monitor | V2 属性路径监听 → `STATE_MGMT_FACTORY.makeMonitor`，支持通配符 `.*` |
| 01-37 | @SyncMonitor | V2 同步监听 → `STATE_MGMT_FACTORY.makeSyncMonitor`，通配符总启用 |

### 环境变量（01-38 ~ 01-39）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-38 | @Env | 系统环境变量 → `STATE_MGMT_FACTORY.makeEnv`，从 WritableEnvKey/ReadonlyEnvKey 读取 |
| 01-39 | @CustomEnv | 自定义环境变量 → `STATE_MGMT_FACTORY.makeCustomEnv`，从 `CustomEnvKey.create<T>()` 读取 |

### 构建函数（01-40 ~ 01-43）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-40 | @Builder | 自定义构建函数，追加 parent/myIds 参数，`@memo` 注解让 memo 插件介入 |
| 01-41 | @LocalBuilder | 局部构建方法 → 箭头函数属性，确保 `this` 词法绑定 |
| 01-42 | @BuilderParam | 组件插槽属性，尾随闭包注入最后一个 @BuilderParam |
| 01-43 | @WrapBuilder | 包装 @Builder 函数为 `WrappedBuilder` 对象，支持跨组件传递 |

### 样式扩展（01-44 ~ 01-46）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-44 | @Extend | 组件样式扩展函数 → 重命名为 `__{组件}__{属性}`，追加 elmtId/isInitialRender/this |
| 01-45 | @AnimatableExtend | 可动画属性扩展 → `createAnimatableProperty`/`updateAnimatableProperty` |
| 01-46 | @Styles | 可复用样式函数，body 缓存到 GLOBAL_STYLE_FUNCTION/INNER_STYLE_FUNCTION |

### 复用 V1/V2（01-47 ~ 01-48）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-47 | @Reusable | V1 组件复用 → `observeRecycleComponentCreation`，API >= 26 注册 `Reusable(name)` |
| 01-48 | @ReusableV2 | V2 组件复用 → `reuseOrCreateNewComponent`，`Reflect.defineProperty` 注入 `isReusable_` |

### 入口与生命周期（01-49 ~ 01-51）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-49 | @Entry | 页面入口 → `createEntryNode`/`createRegisterNamedRoute`，生成路由注册代码 |
| 01-50 | @Preview | 预览模式 → `getPreviewComponentFlag` 条件分支 + `storePreviewComponents` |
| 01-51 | 生命周期装饰器 | @ComponentInit/@ComponentAppear/@ComponentBuilt/@ComponentDisappear/@ComponentReuse/@ComponentRecycle/@ComponentActive/@ComponentInactive → `__initializeStruct` 中注入观察者调用 |

### 通用/系统装饰器（01-52 ~ 01-55）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-52 | @Memo | 函数缓存优化 → unmemoize 变换，展开为带缓存的命令式调用 |
| 01-53 | @Concurrent | 并发函数标记 → 注入 `'use concurrent'` 指令 |
| 01-54 | @Sendable | 跨线程共享标记 → 类/函数/类型别名注入 `'use sendable'` 指令 |
| 01-55 | @InsightIntent | 意图元数据提取 → 写入 `module.json` 的 `extractInsightIntents` 字段 |

### 控制流（01-56 ~ 01-59）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-56 | if条件分支 | `if`/`else` → `If.create()`/`If.branchId(id)`/`If.pop()`（Legacy）或 `ifElseBranchUpdateFunction(id, () => {})`（Partial Update） |
| 01-57 | ForEach | 数组渲染 → `ForEach.create()`/`forEachItemGenFunction`/`forEachUpdateFunction`/`ForEach.pop()` |
| 01-58 | LazyForEach | 懒加载渲染 → `LazyForEach.create()`/`__lazyForEachItemGenFunction`，支持 `optLazyForEach` |
| 01-59 | Repeat | 链式渲染 → `Repeat(arr, this).each(...).template(...).key(...).render(isInitialRender)` |

### 资源引用（01-60 ~ 01-61）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-60 | $r | `$r('app.type.name')` → `{ id, type, params, bundleName, moduleName }` 对象字面量 |
| 01-61 | $rawfile | `$rawfile('filename')` → `{ id: -1, type: 30000, params: [...] }` 对象，支持 HSP 跨模块校验 |

### 双向数据绑定（01-62 ~ 01-63）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-62 | $$语法 | `$$prop: var` → `{ value: var, changeEvent: (v) => { var = v } }`，26 个组件 28 个属性支持 |
| 01-63 | !!语法 | `!!var` → `{ value: var, $value: (v) => { var = v } }`，30 个组件属性支持 |

### Interop 变换（01-64 ~ 01-66）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-64 | interop变换 | 静态工具链 struct→class 桥接，parsed 阶段清空 build 方法体，checked 阶段注解变换 |
| 01-65 | 动态Interop组件转换 | 动态工具链 V1/V2 混合编译场景，`createStaticComponent`/`createIfStaticComponent` 静态创建 |
| 01-66 | builder_lambda转换 | 链式 builder 调用展开为 instance calls 数组并重组，`animationStart`/`animationStop` 拆分 |

### 编译基础设施（01-67 ~ 01-71）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 01-67 | Entry节点生成 | `loadDocument`/`registerNamedRoute`/`loadEtsCard` 完整入口生成流程 |
| 01-68 | Worker转换 | `new Worker(scriptPath)` 脚本路径 `.ts` → `.js` 替换 |
| 01-69 | 声明合并 | HAR 包 `.d.ets`/`.d.ts` 声明文件合并为单一入口，双向映射解析 |
| 01-70 | Import转换 | 路径展开、Lazy Import（自动添加 `lazy` 关键字）、Kit Import（`@kit.*` → `@ohos.*`） |
| 01-71 | Visual转换 | `.visual` 文件解析生成的 ETS 代码注入到 `.ets` 源文件，sourcemap 生成 |

## 02-校验规则

### struct/装饰器基础（02-01 ~ 02-03）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 02-01 | struct装饰器 | struct 必须使用 @Component/@ComponentV2/@CustomDialog，不可使用无效装饰器 |
| 02-02 | 装饰器目标 | 装饰器只能用于允许的目标（struct/属性/方法/函数/getAccessor），V1/V2 不可混用 |
| 02-03 | V1V2混用 | V1 装饰器属性类型不可为 @ObservedV2 类，@Observed+@ObservedV2 不可同时使用/继承 |

### 装饰器使用校验（02-04 ~ 02-19）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 02-04 | @BuilderParam | 尾随闭包调用的组件必须有 @BuilderParam，ArkTS 1.1/1.2 差异 |
| 02-05 | @Require | @Require 不可与 private 同时使用 |
| 02-06 | @Once | @Once 只能装饰成员属性，必须与 @Param 同时使用 |
| 02-07 | @Computed | @Computed 仅用于 getter，不可有 setter，需在 @ComponentV2/@ObservedV2 中使用 |
| 02-08 | @Computed状态修改 | @Computed getter 中不可修改状态变量 |
| 02-09 | @Monitor | @Monitor 参数路径必须指向存在的状态变量，通配符 `.*` 必须在末尾 |
| 02-10 | @SyncMonitor | 与 @Monitor 类似但更严格（ERROR 级别），通配符总启用 |
| 02-11 | @Track | @Track 不可用于 @ObservedV2 类（应用 @Trace），仅用于 class 成员变量 |
| 02-12 | @Env | @Env 仅用于组件 struct，类型必须为白名单类，属性不可有默认值 |
| 02-13 | @CustomEnv | @CustomEnv key 必须由 `CustomEnvKey.create<T>()` 创建 |
| 02-14 | @Provider和@Consumer | @Provider/@Consumer 仅用于成员属性，不可多装饰器，不可外部初始化 |
| 02-15 | V2状态装饰器使用限制 | @Local/@Param/@Event 不可多个，@Param 无默认值需配 @Require，@Local 不可外部初始化 |
| 02-16 | 生命周期装饰器 | 生命周期装饰器仅用于方法，不可有参数（除 @ComponentReuse），不可为 static |
| 02-17 | @Concurrent | @Concurrent 仅 ESMODULE 模式，不可用于方法/generator/async |
| 02-18 | @Watch方法引用 | @Watch 参数必须指向 struct 中已存在的方法名 |
| 02-19 | @Watch配套使用 | @Watch 不可单独使用，必须配合其他状态管理装饰器 |

### 复用校验（02-20 ~ 02-22）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 02-20 | reuse属性 | reuse 仅用于 @ComponentV2+@ReusableV2，reuseId 不可用于 V2+ReusableV2 |
| 02-21 | 全局复用池 | poolAccepts 不可自引用，必须为 @Reusable/@ReusableV2 组件 |
| 02-22 | @ReusableV2 | @Reusable+@ReusableV2 不可同时使用，@ReusableV2 仅用于 @ComponentV2 |

### struct 校验（02-23 ~ 02-26）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 02-23 | struct成员 | 属性必须有类型注解，必须/禁止初始化规则，可选性/静态/protected 限制 |
| 02-24 | struct属性类型 | @ObjectLink 必须为 @Observed 类，@Prop 不可为 any/bigint，V1 装饰器不可装饰 Function 类型 |
| 02-25 | build方法 | struct 必须有且仅有一个无参数的 build 方法 |
| 02-26 | build方法变量修改 | build 方法和 @Builder 方法内不可修改状态变量 |

### 组件校验（02-27 ~ 02-29）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 02-27 | 子组件限制 | 原子组件不可有子组件，单子节点组件只能有一个，特定组件只能包含指定子组件 |
| 02-28 | 组件构造参数 | @Link/@ObjectLink 必须通过构造函数初始化，@Consume 等不可通过构造函数初始化 |
| 02-29 | 组件嵌套 | 组件嵌套关系正确性，复用组件 V2 兼容性，@ComponentV2 中不可使用 @Link 组件 |

### Entry/Preview 校验（02-30 ~ 02-32）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 02-30 | Entry和Preview | @Entry 不超过 1 个，@Preview 不超过 10 个，@Entry struct 不可导出 |
| 02-31 | @Entry和LocalStorage | @LocalStorageLink 时 @Entry 必须传 storage 参数 |
| 02-32 | Entry状态装饰器禁止 | @Entry 组件不可使用 @Prop/@Link/@ObjectLink（需父组件传入） |

### 命名与 UI 一致性（02-33 ~ 02-34）

| 编号 | 文档 | 能力概述 |
|---|---|---|
| 02-33 | 命名冲突 | struct 不可与内置组件/属性同名，组件 .id() 不可重复 |
| 02-34 | UI一致性 | 属性不可被调用，build 必须有单个根节点，@WrapBuilder 参数校验，@CustomDialog 必须含 Controller |

## 双工具链架构

| 维度 | 动态工具链（compiler/） | 静态工具链（arkui-plugins/） |
|---|---|---|
| AST 基础 | TypeScript Compiler API | es2panda AST（`@koalaui/libarkts`） |
| 转换方式 | 声明式 → 命令式 create/pop 序列 | struct → class + property translator 变换 |
| 状态管理 | `ObservedPropertySimple` 等包装类 | `STATE_MGMT_FACTORY.makeXxx` 工厂调用 |
| 组件定义 | `components/*.json`（145 个）+ `component_map.ts` | `predefines.ts` 枚举 + `arkuiImportList.ts`（165 个） |
| 校验规则 | `validate_ui_syntax.ts`（数字错误码） | `collectors/ui-collectors/validators/rules/`（规则名标识 + FixSuggestion） |
| 运行时关系 | 不可交叉依赖 | 不可交叉依赖 |

## 关键发现

1. **@Type 装饰器已从 SDK 移除**：`pre_define.ts` 仍保留 `TYPE` 常量（遗留代码），SDK 声明中已无 `@Type`，由 `@Trace` 完全替代
2. **@Prop/@StorageProp/@LocalStorageProp 已 deprecated**：SDK 使用 `@PropRef`/`@StoragePropRef`/`@LocalStoragePropRef`，动态工具链仍使用旧名
3. **静态工具链 66 个校验规则全部注册**：`collectors/ui-collectors/validators/rules/` 目录下 66 个规则文件在 `index.ts` 中全部 `export *`，无被注释的规则
4. **IStateMgmtFactory 接口**：SDK 声明文件定义的 `STATE_MGMT_FACTORY: IStateMgmtFactory` 全局常量提供所有装饰器变量的工厂方法，与静态工具链的 `StateManagementTypes` 枚举一一对应
