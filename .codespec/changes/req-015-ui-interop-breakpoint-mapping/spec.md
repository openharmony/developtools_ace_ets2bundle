# 特性规格

> 状态：Approved（Define）/ Release Ready
> 适用仓：`developtools/ace_ets2bundle/arkui-plugins`
> 一期策略：以 AST `range` / `originalPeer` 作为事实源，不新增独立 sourcemap，不调整插件流水线

## 1. 需求摘要

| 项 | 内容 |
|----|------|
| 需求ID | `req-015-ui-interop-breakpoint-mapping` |
| 需求名称 | UI互操作界面断点调试行列号映射 |
| 目标对象 | ArkTS-Sta -> ArkTS-Dyn 的 UI interop 转换链路 |
| 交付形态 | 静态 ArkTS 工具链中的源码位置映射契约 |
| 主约束 | 不新增独立 sourcemap；不修改 `compiler/`；不改变插件顺序 |
| 核心行为 | 转换前后节点的源码位置连续性，以及一源多节点时的辅助节点 no-debug-line 标记 |

本需求解决的问题是：ArkUI 开发者在 UI 互操作场景中设置断点、单步执行和查看调用栈时，不应被 UI-Plugin / Interop 生成代码干扰，调试位置应稳定回到开发者可见源码。

一期不要求新增文件级 sourcemap，也不要求改变 `debugLine` 的注入机制。该需求定义的是工具链层的 AST 源位置契约，后续调试器消费可以建立在该契约之上。

## 2. 背景与目标

### 2.1 背景

ArkUI 的静态工具链在 `arkui-plugins` 中完成 Interop、UI 转换和检查阶段处理。当前链路能够生成或改写 AST，但 Interop 相关节点在转换前后的源码位置关系没有被系统性保留，导致：

- 断点可能命中到生成代码而不是开发者源码
- 单步进入同一源码行时可能反复停留
- 调试信息在 UI 互操作转换后出现位置漂移

### 2.2 目标

本需求的一期目标是：

1. 让 Interop 生成或改写的关键节点保留转换前源码位置关系
2. 让一源多节点场景中的辅助节点被明确标记为不落盘行列号
3. 让源码位置信息缺失时安全降级，不破坏编译和现有行为

## 3. 范围与边界

### 3.1 包含范围

| 范围 | 说明 |
|------|------|
| Interop parsed 变换 | struct -> class、build 方法改写、class definition 位置继承 |
| Interop checked 变换 | 主替换节点的源码位置映射，以及辅助节点 no-debug-line 标记 |
| 源位置契约 | 以 `range`、`startPosition`、`endPosition`、`originalPeer` 为一期契约 |
| 测试覆盖 | 补充或扩展定向 AST 单测与回归测试 |
| 降级策略 | 位置信息缺失时保持编译可继续执行 |

### 3.2 不包含范围

| 范围 | 说明 |
|------|------|
| 独立 sourcemap 文件 | 一期不新增文件级映射产物 |
| `compiler/` 动态工具链 | 不修改，不引入依赖 |
| 插件流水线 | 不调整 interop / ui / ui-syntax / memo 顺序 |
| 运行时 UI 语义 | 不改组件语义、布局或渲染行为 |
| 新生产依赖 | 不新增 npm 生产依赖 |

## 4. 术语

| 术语 | 定义 |
|------|------|
| 源节点 | 转换前的 ArkTS-Sta / UI 源代码 AST 节点 |
| 生成节点 | Interop 或 UI-Plugin 转换后生成或改写的 AST 节点 |
| range | 节点的源码范围，可由 `startPosition` / `endPosition` 或等价范围表达 |
| originalPeer | 节点对原始 AST 节点的回溯关系 |
| 主替换节点 | 与源节点语义一一对应、负责承接源码位置的生成节点 |
| 辅助节点 | 为完成转换而额外生成的节点，如包装器、初始化器、更新器等 |
| no-debug-line | 标识节点不应落盘为可重复停靠的调试行列号 |

## 5. 语义契约

### 5.1 位置连续性

当 Interop 生成的新节点与源节点存在语义一一对应关系时，生成节点应继续承接源节点的源码位置关系。这里的“承接”至少包含以下语义之一：

- 继承源节点的 `range`
- 建立到源节点的 `originalPeer` 关系
- 在后续消费链路中能够回溯到源节点位置

### 5.2 多节点生成

当一个源节点被拆分为多个生成节点时，应满足：

- 负责承接语义的主替换节点保留源码位置
- 为变换辅助而额外生成的节点设置 `setNoDebugLineFlag()`
- 复用的源子树不得被误标为 no-debug-line

### 5.3 安全降级

当源节点缺少可用位置信息时：

- 变换不能失败
- 不得引入新的诊断错误
- 生成结果应保持现有可编译行为

## 6. 场景定义

### 场景 A: struct -> class 位置保持

ArkTS-Sta UI struct 经 Interop parsed 阶段转换为 class 或 class definition。此时新节点应保留源 struct / definition 的位置关系，避免后续 UI 链路只看到生成位置。

### 场景 B: build 方法改写

源 struct 中的 `build` 方法在 Interop 中被清空、重写或替换时，更新后的 method / function / body 仍应回溯到原 build 方法位置，不能退化为生成代码的默认位置。

### 场景 C: 一源多节点

当同一个源节点同时派生主替换节点和多个辅助节点时，主节点承担位置映射，辅助节点承担转换支持逻辑。辅助节点必须被标记为 no-debug-line，避免调试器在同一源码行上重复停靠。

### 场景 D: 位置信息缺失

如果上游节点本身没有可用 range 或 originalPeer，Interop 应沿用当前行为，不因位置元信息缺失而中断编译。

## 7. 功能要求

| 编号 | 要求 |
|------|------|
| FR-1 | Interop parsed 阶段生成的新 class / class definition 必须保留源 struct / definition 的源码位置关系。 |
| FR-2 | Interop parsed 阶段对 build 方法的改写必须保留原 build 方法或原 body 的源码位置关系。 |
| FR-3 | Interop checked 阶段生成的主替换节点必须继承源节点位置；辅助节点必须显式标记 no-debug-line。 |
| FR-4 | 当源码位置信息缺失时，转换必须安全降级，不得阻断编译。 |
| FR-5 | 非 Interop 的现有 UI 转换行为不得因本需求发生回归。 |

## 8. 非功能要求

| 类别 | 要求 |
|------|------|
| 兼容性 | 不改变 ArkUI 运行时语义，不改变公共 API |
| 性能 | 位置继承仅发生在节点创建或更新点，不引入全量 AST 扫描 |
| 可维护性 | 优先采用局部 helper 和明确规则，避免跨模块散落复制逻辑 |
| 可测试性 | 至少覆盖 Interop range/originalPeer 映射、no-debug-line 标记和非 Interop 回归 |

## 9. 验收标准

| AC | 验收标准 | 验证方式 |
|----|----------|----------|
| AC-001 | struct -> class / class definition 的转换后节点保留源位置关系 | AST 单测 |
| AC-002 | build 方法改写后，method / function / body 仍可回溯到原 build 位置 | AST 单测 |
| AC-003 | 一源多节点场景中，主替换节点保留位置，辅助节点标记 no-debug-line | AST 单测 |
| AC-004 | 缺失源码位置信息时，编译安全降级且不报新增错误 | 定向回归 |
| AC-005 | 现有非 Interop builder lambda / custom component / wrap builder 场景不回归 | 既有回归测试 |

## 10. 验证映射

| 验证项 | 命令 / 方式 |
|--------|-------------|
| 编译 | `cd arkui-plugins && npm run compile` |
| 单测 | `cd arkui-plugins && npm run test` |
| 定向测试 | 新增或扩展 Interop range-mapping 相关 jest 用例 |
| 文档校验 | `git diff --check` |
| Pilot 校验 | `cd sdd-pilot && ./scripts/validate.sh arkui` |

## 11. 风险与处理

| 风险 | 影响 | 处理 |
|------|------|------|
| 生成节点语义与源节点不是严格 1:1 | 位置可能过粗或过细 | 仅在语义明确处继承位置，复杂场景优先保证可编译 |
| 辅助节点误标为可断点节点 | 单步停靠重复 | 主节点与辅助节点分离，辅助节点统一 no-debug-line |
| 上游节点缺失位置元信息 | 映射不完整 | 安全降级，不阻断构建 |
| 后续消费方要求独立 sourcemap | 一期能力不足 | 作为后续扩展，不纳入本需求 |

## 12. 结论

本需求一期的规格已收敛为：

1. 静态 ArkTS UI 工具链中的 Interop 节点位置继承
2. 一源多节点场景中的 no-debug-line 控制
3. 位置信息缺失时的安全降级

在不改变插件顺序、不引入独立 sourcemap 的前提下，本规格定义了后续实现、测试和验收的统一契约。
