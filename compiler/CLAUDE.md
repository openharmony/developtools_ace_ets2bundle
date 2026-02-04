# ArkTS ETS2Bundle Compiler

这是一个 **Rollup 插件集合**，用于在编译过程中转换 ArkTS 语言（HarmonyOS 的 TypeScript 超集）到 JavaScript/ABC 字节码。

> 💡 **新开发者必读**: 如果你刚接触这个代码库，建议先阅读 [快速开始](#快速开始) 部分，了解基本概念和开发流程。

## 目录

```
compiler/
├── compile_plugin.js          # 主入口，导出所有插件
├── main.js                    # 全局配置和状态管理
├── src/                       # 核心 TypeScript 实现
│   ├── ets_checker.ts         # TypeScript LanguageService 封装
│   ├── process_component_build.ts    # 组件构建转换 (3864行，核心文件)
│   ├── process_ui_syntax.ts          # UI 语法处理
│   ├── validate_ui_syntax.ts         # UI 语法验证
│   ├── process_component_class.ts    # 组件类处理
│   ├── process_component_member.ts   # 组件成员处理
│   ├── process_custom_component.ts   # 自定义组件处理
│   ├── gen_abc_plugin.ts      # 旧版 ABC 生成插件 (webpack)
│   ├── ark_utils.ts           # ArkTS 工具函数
│   ├── utils.ts               # 通用工具函数
│   ├── pre_define.ts          # 常量和预定义
│   ├── component_map.ts       # 内置组件映射
│   ├── compile_info.ts        # 编译信息管理
│   └── fast_build/            # 新版快速构建 (rollup)
│       ├── ark_compiler/      # ArkTS 编译器核心
│       ├── ets_ui/            # ETS UI 转换
│       ├── system_api/        # 系统 API 检查
│       ├── visual/            # 可视化支持
│       ├── common/            # 通用工具
│       └── meomry_monitor/    # 内存监控
└── declarations/              # TypeScript 声明文件
```

---

## 快速开始

### 5分钟了解这个代码仓

**问题 1: 这个代码仓是做什么的？**

简单来说，这是一个 **转换器**，把 ArkTS 代码（开发者写的）转换成 JavaScript 代码，再转换成 ABC 字节码（设备运行的）。

```
开发者写 ArkTS 代码 (例如: @Component struct MyComponent { ... })
    ↓
【本代码仓工作】转换成 JavaScript
    ↓
Ark Compiler 生成 ABC 字节码
    ↓
设备运行
```

**问题 2: 为什么要转换？**

ArkTS 使用了声明式 UI 语法（类似 SwiftUI），但 Ark 虚拟机只能运行命令式代码。所以需要把"声明式"转成"命令式"。

```typescript
// 声明式 (开发者写的)
Column() {
    Text('Hello')
    Button('Click')
}

// 命令式 (转换后的)
Column.create();
Text.create('Hello');
Button.create('Click');
Button.pop();
Text.pop();
Column.pop();
```

**问题 3: 核心文件是哪些？**

| 文件 | 作用 | 优先级 |
|------|------|--------|
| `compile_plugin.js` | 插件入口，定义插件链 | ⭐⭐⭐ |
| `src/ets_checker.ts` | 类型检查，收集文件 | ⭐⭐⭐ |
| `src/process_component_build.ts` | **核心转换逻辑** | ⭐⭐⭐⭐⭐ |
| `src/validate_ui_syntax.ts` | UI 语法验证 | ⭐⭐⭐⭐ |
| `src/component_map.ts` | 组件和属性映射表 | ⭐⭐⭐ |

**问题 4: 如何开始阅读代码？**

推荐的阅读顺序：

1. 先看 `compile_plugin.js` (了解插件链)
2. 再看 `src/fast_build/ets_ui/rollup-plugin-ets-typescript.ts` (了解转换入口)
3. 然后看 `src/process_component_build.ts` 的 `processComponentBuild()` 函数
4. 遇到问题时查看 FAQ 部分

### 开发环境设置

#### 1. 克隆代码

```bash
git clone <repository-url>
cd compiler
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 构建项目

```bash
npm run build
```

#### 4. 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- ark_compiler_ut
```

### 第一个任务：理解一个简单组件的转换

让我们看一个最简单的例子：

**输入 (Index.ets)**:
```typescript
@Component
struct Hello {
    @State message: string = 'Hello World';

    build() {
        Text(this.message)
            .fontSize(20)
    }
}
```

**转换过程**：

1. **validate_ui_syntax.ts**: 验证 `@Component` 装饰器、`@State` 装饰器是否正确
2. **process_component_class.ts**: 识别这是一个自定义组件，生成构造函数
3. **process_component_member.ts**: 处理 `@State message`，转换为 `ObservedPropertySimple`
4. **process_component_build.ts**: 转换 `build()` 方法
   - `Text(this.message)` → `Text.create(this.message.get())`
   - `.fontSize(20)` → `Text.fontSize(20)`

**输出 (简化后)**:
```javascript
class Hello {
    constructor() {
        this.message = new ObservedPropertySimple('Hello World', this);
    }

    render() {
        Text.create(this.message.get());
        Text.fontSize(20);
        Text.pop();
    }
}
```

### 调试第一个转换

如果你想实际调试这个转换：

1. 创建一个测试文件 `test.ets`:
```typescript
@Component
struct TestComponent {
    build() {
        Text('Hello')
    }
}
```

2. 启用调试模式编译:
```bash
hvigorw --mode module -p product=default --analyze=normal --parallel --incremental
export ark_log=verbose  # 启用详细日志
```

3. 查看输出:
   - 临时文件: `/.preview/default/cache/default/temporary/`
   - 转换后的 JS: 同目录下的 `.js` 文件

4. 在关键位置打断点:
   - `src/process_component_build.ts:processComponentBuild()`
   - `src/fast_build/ets_ui/rollup-plugin-ets-typescript.ts:transform()`

---

## 整体架构

### 编译流程

```
ArkTS 源码 (.ets)
    ↓
[Parser → Checker] (ArkTS Compiler，不在本代码仓)
    ↓
────────────────────────────────────────
│ 本代码仓开始 (Transform 阶段)        │
────────────────────────────────────────
    ↓
etsChecker 插件 (类型检查 + 收集文件)
    ↓
etsTransform 插件 (核心转换)
    ├─→ validate_ui_syntax (验证 UI 语法)
    ├─→ process_ui_syntax (处理 UI 语法)
    └─→ process_component_* (转换组件结构)
           ↓
    JavaScript 代码 (.js)
           ↓
genAbc 插件 (生成字节码)
    ├─→ transformForModule (模块转换)
    └─→ generateModuleAbc / generateBundleAbc
           ↓
    .abc 文件 (Ark 字节码)
────────────────────────────────────────
```

### 插件链 (compile_plugin.js)

```javascript
exports.sdkPlugins = (projectConfig) => [
    memoryMonitor(),        // 0: 内存监控
    watchChangeFiles(),     // 1: 监听文件变化
    etsChecker(),           // 2: ETS 类型检查
    visualTransform(),      // 3: 可视化转换
    etsTransform(),         // 4: ETS 转换 (核心)
    apiTransform(),         // 5: API 检查和转换
    genAbc(),               // 6: 生成 ABC 字节码
    terserPlugin(),         // 7: 代码压缩 (Release 模式)
    babelPlugin(),          // 8: Babel 转换 (JSBundle 模式)
    createProgramPlugin()   // 9: 创建 TS Program
];
```

## 编译模式

### ESMODULE 模式 (har/hsp)

- 按模块编译
- 每个 .ets 文件生成对应的 .abc 文件
- 适用于 HAR 包和 HSP 包开发

### JSBUNDLE 模式

- 打包编译
- 所有代码打包成单个 .abc 文件
- 适用于应用发布

## 核心模块详解

### 1. 类型检查: ets_checker.ts (2099行)

**职责**:
- 创建 TypeScript LanguageService
- 解析模块引用 (resolveModuleNames)
- 执行 ArkTS Linter 检查
- 收集所有需要编译的文件
- 增量编译支持

**关键输出**:
- `globalProgram`: TypeScript Program 实例
- `SOURCE_FILES`: 源文件映射表
- `allModuleIds`: 所有模块 ID

### 2. UI 转换核心: process_component_build.ts (3864行)

**职责**: 将 ArkTS 声明式 UI 转换为命令式 JS 代码

**主要转换**:
```typescript
// 输入 ArkTS
@Component
struct MyComponent {
    build() {
        Column() {
            Text('Hello')
                .fontSize(20)
        }
    }
}

// 输出 JavaScript (简化示意)
MyComponent.prototype.render = function() {
    this.observeComponentCreation2(...);
    Column.create();
    Text.create('Hello');
    Text.fontSize(20);
    Text.pop();
    Column.pop();
}
```

**核心函数**:
- `processComponentBuild()` - 处理 build() 方法
- `processComponentBlock()` - 处理组件块
- `processComponentChild()` - 处理子组件

### 3. UI 语法处理: process_ui_syntax.ts (2250行)

**职责**:
- 处理 `$$` 语法 (双向绑定)
- 处理 `$$_` 语法
- 处理属性和事件绑定
- 处理样式属性

### 4. UI 语法验证: validate_ui_syntax.ts (2962行)

**职责**:
- 验证装饰器使用
- 验证组件继承关系
- 验证状态管理装饰器
- 收集组件信息

**关键集合**:
- `componentCollection`: 组件收集
- `linkCollection`: @Link 装饰器收集
- `localStorageLinkCollection`: 本地存储收集

### 5. 组件成员处理: process_component_member.ts (1494行)

**处理的装饰器**:

| 装饰器 | 用途 | 转换为 |
|--------|------|--------|
| `@State` | 组件内部状态 | ObservedPropertySimple |
| `@Prop` | 父组件传递属性 | SynchedPropertySimpleOneWay |
| `@Link` | 双向绑定 | SynchedPropertySimpleTwoWay |
| `@Provide` / `@Consume` | 依赖注入 | SynchedPropertyNestedObject |
| `@StorageLink` / `@StorageProp` | 本地存储 | SynchedPropertyNestedObject |
| `@Builder` | 自定义构建函数 | 静态方法 |
| `@CustomDialog` | 自定义对话框 | CustomDialogController |
| `@Watch` | 监听器 | watch 回调 |

### 6. 组件类处理: process_component_class.ts (1281行)

**职责**:
- 识别 `@Component` 装饰器
- 处理构造函数生成
- 处理生命周期方法:
  - `aboutToAppear()`
  - `aboutToDisappear()`
  - `aboutToBeDeleted()` (部分更新)
- 生成状态管理代码

### 7. 自定义组件: process_custom_component.ts (1735行)

**职责**:
- 处理自定义组件
- 处理 `@Reusable` 装饰器 (复用组件)
- 处理组件参数传递

## fast_build 目录

### ark_compiler/ - ArkTS 编译器核心

**主要文件**:
- `transform.ts` - 转换入口，处理 JS/ETS 文件
- `rollup-plugin-gen-abc.ts` - genAbc 插件主文件
- `generate_module_abc.ts` - 模块模式 ABC 生成
- `generate_bundle_abc.ts` - bundle 模式 ABC 生成
- `generate_sourcemap.ts` - sourcemap 生成
- `babel-plugin.ts` - Babel 转换插件
- `process_decorator.ts` - 装饰器处理
- `process_mock.ts` - mock 处理

**common/**:
- `ark_define.ts` - 常量定义 (ESMODULE, JSBUNDLE 等)
- `gen_abc.ts` - ABC 生成通用逻辑
- `ob_config_resolver.ts` - 混淆配置解析
- `process_ark_config.ts` - Ark 配置处理

**module/**:
- `module_source_file.ts` - 模块源文件管理
- `module_mode.ts` - 模块模式
- `module_build_mode.ts` - 构建模式
- `module_hotreload_mode.ts` - 热重载模式
- `module_preview_mode.ts` - 预览模式

### ets_ui/ - ETS UI 转换

**主要文件**:
- `rollup-plugin-ets-typescript.ts` - etsTransform 插件 (核心)
- `rollup-plugin-ets-checker.ts` - etsChecker 插件
- `arkoala-plugin.ts` - Arkoala 插件

### system_api/ - 系统 API 检查

**主要文件**:
- `rollup-plugin-system-api.ts` - API 检查插件
- `api_check_utils.ts` - API 检查工具
- `api_validator/` - API 验证器
- `api_checker/` - API 版本检查器

## 关键数据结构

### ModuleInfo (gen_abc_plugin.ts)

```typescript
class ModuleInfo {
    filePath: string;          // 原始文件路径
    tempFilePath: string;      // 临时文件路径
    buildFilePath: string;     // 构建输出路径
    abcFilePath: string;       // ABC 文件路径
    isCommonJs: boolean;       // 是否 CommonJS
    recordName: string;        // 记录名称
    sourceFile: string;        // 源文件
    packageName: string;       // 包名
}
```

### projectConfig (main.js)

```javascript
{
    projectPath: string,           // 项目路径
    buildPath: string,             // 构建输出路径
    cachePath: string,             // 缓存路径
    compileMode: 'esmodule' | 'jsbundle',
    buildMode: 'Debug' | 'Release',
    enableDebugLine: boolean,      // 是否启用调试行
    buildArkMode: string,          // Ark 构建模式
    // ... 更多配置
}
```

## 重要常量 (pre_define.ts)

### 组件方法
- `COMPONENT_BUILD_FUNCTION`: 'build'
- `COMPONENT_RENDER_FUNCTION`: 'render'
- `COMPONENT_INITIAL_RENDER_FUNCTION`: 'initialRender'
- `COMPONENT_CREATE_FUNCTION`: 'create'
- `COMPONENT_POP_FUNCTION`: 'pop'

### 装饰器
- `COMPONENT_DECORATOR`: '@Component'
- `COMPONENT_STATE_DECORATOR`: '@State'
- `COMPONENT_PROP_DECORATOR`: '@Prop'
- `COMPONENT_LINK_DECORATOR`: '@Link'
- `COMPONENT_BUILDER_DECORATOR`: '@Builder'

### 控制流
- `COMPONENT_IF`: 'if'
- `COMPONENT_FOREACH`: 'forEach'
- `COMPONENT_LAZYFOREACH': 'lazyForEach'

## 内置组件 (component_map.ts)

### 容器组件
- Column, Row, Stack, Grid, List
- Flex, RelativeContainer, GridRow

### 基础组件
- Text, Image, Button, TextInput
- Toggle, Checkbox, Radio, Slider

### 媒体组件
- Video, ImageAnimator

### 绘制组件
- Rect, Circle, Ellipse, Path

### 其他
- Web, XComponent, Canvas

## 增量编译

### 缓存机制
- TypeScript 增量编译 (`tsBuildInfoFile`)
- 文件哈希验证 (`gen_hash.json`)
- SourceMap 缓存 (`sourcemaps.json`)
- 模块列表缓存 (`modulelist.json`)

### 热重载
- 文件变化监听
- 增量编译
- Patch ABC 生成

## 工具函数

### ark_utils.ts
- `genAbcFileName()`: 生成 ABC 文件名
- `genProtoFileName()`: 生成 proto 文件名
- `buildCachePath()`: 构建缓存路径
- `getPackageInfo()`: 获取包信息
- `isTs2Abc()`: 判断是否 ts2abc 模式
- `isEs2Abc()`: 判断是否 es2abc 模式

### utils.ts
- `toUnixPath()`: 转换为 Unix 路径
- `genTemporaryPath()`: 生成临时路径
- `genBuildPath()`: 生成构建路径
- `hasDecorator()`: 检查是否有装饰器
- `emitLogInfo()`: 输出日志信息

## 性能优化

### 1. 多线程编译
- Worker 池处理文件转换
- 最大 worker 数量: `MAX_WORKER_NUMBER`

### 2. 内存监控
- 实时监控内存使用
- 自动触发 GC
- 内存泄漏检测

### 3. 缓存策略
- 文件哈希验证
- 增量编译
- SourceMap 缓存

### 4. 性能事件
- CompileEvent 系统
- 分阶段性能统计

## 错误处理

### 日志收集
- `log_message_collection.ts`: 日志收集器
- `compile_info.ts`: 编译信息管理
- `hvigor_error_code/`: 错误码定义

### 错误类型
- TypeScript 编译错误
- ArkTS 语法错误
- UI 语法错误
- API 版本错误

## 测试

### 单元测试
- `test/ark_compiler_ut/`: Ark 编译器单元测试
- `test/system_api_ut/`: 系统 API 单元测试

### 测试数据
- `test/ark_compiler_ut/testdata/`: 测试用例数据

## 调试技巧

### 1. 启用调试日志
```bash
export ark_log=verbose
```

### 2. 查看中间产物
- 临时文件: `${cachePath}/temporary/`
- Proto 文件: `${cachePath}/protos/`
- SourceMap: `${buildPath}/sourcemaps`

### 3. 性能分析
- 查看 CompileEvent 输出
- 内存监控日志
- 构建时间统计

## 关键概念

### ArkTS vs TypeScript
- ArkTS 是 TypeScript 的超集
- 增加了装饰器 (`@Component`, `@State` 等)
- 增加了声明式 UI 语法
- 增加了状态管理机制

### 部分更新模式 (Partial Update)
- 减少重渲染范围
- 使用 `elmtId` 跟踪元素
- 支持组件复用

### 组件复用 (Reusable)
- `@Reusable` 装饰器
- 复用池管理
- 减少内存占用

## 依赖关系

### 外部依赖
- TypeScript: 类型系统和 AST
- Rollup: 构建工具
- Babel: JS 转换
- Ark Compiler: 生成 ABC 字节码

### 内部依赖
```
genAbc
  └─→ transform
       └─→ etsTransform
            ├─→ etsChecker
            │    └─→ globalProgram
            ├─→ process_ui_syntax
            │    └─→ validate_ui_syntax
            └─→ process_component_*
                 └─→ component_map
```

## 版本演进

### 旧版 (webpack)
- `gen_abc_plugin.ts`: Webpack 插件
- 使用 cluster 多进程
- 适用场景: 旧项目

### 新版 (rollup)
- `fast_build/`: Rollup 插件
- 单进程 + Worker
- 性能更好
- 适用场景: 新项目

## 配置文件

### tsconfig.json
TypeScript 编译器配置

### build-profile.json
构建配置，包含:
- compileMode: 编译模式
- buildMode: 构建模式
- enableDebugLine: 是否生成调试行

### oh-package.json5
包配置，定义依赖关系

## 术语表

| 术语 | 说明 |
|------|------|
| ArkTS | HarmonyOS 的 TypeScript 超集 |
| ABC | Ark Bytecode，Ark 虚拟机字节码 |
| HAR | Harmony Archive，HarmonyOS 共享包 |
| HSP | Harmony Shared Package |
| ESMODULE | ES 模块模式 |
| JSBUNDLE | JS 打包模式 |
| Partial Update | 部分更新渲染模式 |
| Reusable | 组件复用 |
| LazyForEach | 懒加载列表渲染 |

## 相关资源

- [ArkTS 官方文档](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-get-started-V5)
- [OpenHarmony 源码](https://gitee.com/openharmony)
- [Ark Compiler](https://gitee.com/openharmony/ark_compiler_runtime)

## 维护者

- Huawei Device Co., Ltd.
- OpenHarmony 开发社区

## 许可证

Apache License 2.0
