# 架构设计

## 需求基线

基于 `proposal.md` 与 `spec.md`，一期实现目标是：在 `arkui-plugins` 静态 UI 转换链路中，补齐 Interop 生成/改写节点的转换前源码 range/originalPeer 继承；对一源多辅助节点设置 no-debug-line，避免调试单步在同一源码行重复停留。

## 上下文和现状

- 插件流水线固定：`interop-plugin` parsed -> `ui-plugin` parsed/checked -> `ui-syntax-plugin` checked -> `memo-plugin` checked。
- `interop-plugins/decl_transformer.ts` 在 parsed 阶段执行 struct -> class 转换，并清空 `build` 方法体。
- `@koalaui/libarkts` 的 `AstNode` 支持 `originalPeer`、`startPosition`、`endPosition`、`range`。
- `ui-plugins/builder-lambda-translators/factory.ts` 已有 `setBuilderLambdaRange()`，说明 UI 插件已经采用显式 range 拷贝来表达转换前后位置。
- `ui-plugins/interop` 和 `ui-plugins/interop/builder-interop` 会生成 `compatibleComponent` 包装调用、initializer/updater lambda 等辅助节点，需要区分主替换节点与辅助生成节点。

## 关键设计决策

| 决策 | 内容 | 理由 |
|------|------|------|
| D-001 | 一期使用 AST range/original-node 作为映射契约，不新增独立 sourcemap 文件 | 符合用户澄清和静态工具链现状，降低跨调试器协议风险 |
| D-002 | 增加小型 range/original-node 继承 helper，供 Interop 转换复用 | 保持改动集中，避免重复手写 `startPosition/endPosition/range/originalPeer` |
| D-003 | `processComponent()` 生成 class 后显式继承 struct/class definition 的源码位置关系 | struct -> class 是 Interop 最大结构转换点，后续 UI 插件会消费生成 class 树 |
| D-004 | `transformMethodDefinition()` 更新 build 方法时保留 method/function/body 的源 range | 清空 body 容易丢失原 build 位置信息，是断点和单步最敏感区域 |
| D-005 | 主替换节点保留源 range/originalPeer；同源辅助节点调用 `setNoDebugLineFlag()` | 保证断点能映射到源码，同时避免一个源码行对应多个生成节点造成重复停留 |

## 拟修改点

| 文件 | 修改内容 |
|------|----------|
| `arkui-plugins/common/source-mapping.ts` | 新增小型 helper，统一设置 `originalPeer`、`startPosition`、`endPosition`、`range`，并提供生成辅助子树 no-debug-line 标记 |
| `arkui-plugins/interop-plugins/decl_transformer.ts` | 在 `processComponent()`、`transformMethodDefinition()`、WrappedBuilder 类型改写处对关键节点设置 range/originalPeer |
| `arkui-plugins/ui-plugins/interop/*.ts` | 对 `compatibleComponent` 主替换节点继承源 range；对 initializer/updater、附加 instantiate 方法等辅助生成节点设置 no-debug-line |
| `arkui-plugins/test/demo/interop/*.ets` | 新增专用 range-mapping 样例 |
| `arkui-plugins/test/ut/...` | 新增单测，验证 Interop 后 range/originalPeer 映射契约 |

## 设计细节

### Interop range 继承

Interop 生成节点时应遵循以下策略：

1. 新节点与源节点语义等价时，设置 `target.originalPeer = source.originalPeer`，并继承 `source.startPosition` / `source.endPosition` / `source.range`。
2. 新节点只对应源节点的一部分时，优先继承对应子节点 range，例如 class definition 对应 struct definition、build function 对应原 build function。
3. 如果源节点没有可靠 start/end，则不强制写入，保持现有行为，避免空指针或无效 range 导致编译异常。

### 辅助生成节点 no-debug-line

一个源节点拆出多个生成节点时应遵循以下策略：

1. 保留作为语义替换结果的主节点 range/originalPeer，例如 `compatibleComponent(...)` 替换原调用。
2. 对 initializer/updater lambda、附加 instantiate 方法、生成接口等辅助节点调用 `setNoDebugLineFlag()`。
3. 标记辅助子树时跳过复用的原始源子树，避免误标开发者可断点节点。

### 测试策略

- 新增 AST 级测试：验证 struct -> class 后关键节点 `originalPeer` 和 range 未丢失。
- 新增或扩展转换产物检查：验证 `compatibleComponent` 主节点与辅助节点处理符合 range/no-debug-line 规则。
- 保留现有 UI 转换测试作为非 Interop 回归，确认既有 range 行为不变。

## 兼容性影响

- 不改变 ArkUI 运行时调用、组件生命周期、状态管理语义。
- 不改变插件顺序，不引入 `compiler/` 依赖。
- 不改 `debugLine` 行为；本需求只提供正确 range/originalPeer 与 no-debug-line 元信息。
- original-node/range 继承属于 AST 元信息增强，对非调试构建应无用户可见影响。

## 风险与缓解

| 风险 | 影响 | 缓解 |
|------|------|------|
| 某些生成节点对应源节点范围不唯一 | 行列号可能指向较大的语法范围 | 只在语义明确的 Interop 节点继承；复杂场景先保留当前节点 range |
| `getOriginalNode()` 在部分节点上不可用或返回当前节点 | 回溯源节点失败 | 保留当前节点 range，不中断编译 |
| 测试 fixture 不稳定 | 快照维护成本上升 | 优先断言关键 range/originalPeer，不扩大快照范围 |
| 后续调试器要求独立 sourcemap | 一期能力不完全覆盖 | 在 proposal 中明确 A-3 为后续扩展，不阻塞当前范围 |

## 后续 Task 拆分

- TASK-001: 梳理 Interop 关键节点与源节点对应关系。
- TASK-002: 实现 Interop class/class definition range/original-node 继承。
- TASK-003: 实现 build 方法更新后的 method/function/body range/original-node 继承。
- TASK-004: 实现一源多辅助节点的 no-debug-line 标记。
- TASK-005: 新增 Interop range-mapping 自动化测试。
- TASK-006: 运行编译、测试和 pilot 文档校验。
