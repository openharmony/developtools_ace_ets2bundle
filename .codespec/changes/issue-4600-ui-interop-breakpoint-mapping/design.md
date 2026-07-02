# 架构设计 — 互操作断点调试需求

## 设计元数据

| 字段 | 内容 |
|------|------|
| Design ID | DESIGN-09-02-01-01 |
| 关联需求 | proposal.md (REQ-09-02-01-01) |
| 目标 Feature | Feat-01 |
| CodeSpec ID | issue-4600-ui-interop-breakpoint-mapping |
| 关联 Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4600 |
| 复杂度 | 标准 |
| 目标版本 | TBD |
| Owner | @lixingchi1 |
| 状态 | Release Ready |

## 需求基线

| 项 | 补充说明 |
|----|----------|
| 交付范围 | Interop 转换前后 AST range/originalPeer 映射 + 辅助节点 no-debug-line 标记 |
| 明确不做 | 独立 sourcemap 文件、debugLine 机制修改、运行时语义修改 |
| 性能目标 | 只在节点创建/替换点补充位置映射，不做全量 AST 扫描 |
| 兼容性 | 非 Interop UI 转换行为不回归 |
| 验证方式 | arkui-plugins 编译、定向 Jest、非 Interop 回归、完整测试套 |

## 上下文和现状

### 涉及仓和模块

| 仓 | 模块 | 当前职责 | 影响 |
|----|------|----------|------|
| developtools/ace_ets2bundle | `arkui-plugins/interop-plugins/decl_transformer.ts` | Interop parsed 阶段 struct/class/build 转换 | 补充源码位置继承 |
| developtools/ace_ets2bundle | `arkui-plugins/ui-plugins/interop/interop.ts` | UI interop checked 转换入口 | 补充主替换节点映射 |
| developtools/ace_ets2bundle | `arkui-plugins/ui-plugins/interop/builder-interop.ts` | builder interop 包装和辅助节点生成 | 标记辅助节点 no-debug-line |
| developtools/ace_ets2bundle | `arkui-plugins/ui-plugins/interop/legacy-transformer.ts` | legacy interop 兼容转换 | 标记生成辅助结构 |
| developtools/ace_ets2bundle | `koala-wrapper/src/arkts-api/peers/AstNode.ts` | AST 节点 range/originalPeer/no-debug-line 基础能力 | 作为能力依赖 |

### 当前架构问题

1. Interop parsed 阶段生成 class、definition、build body 时，没有统一保留源节点位置。
2. Interop checked 阶段生成主替换节点与辅助节点时，主次职责没有明确区分。
3. 一个源节点生成多个节点时，辅助节点可能形成可停靠调试行，导致 step into 在同一源码行重复停留。
4. 位置信息缺失场景缺少统一安全降级 helper，容易形成散落的条件判断。

## 架构设计

### 核心设计决策

#### ADR-1: 映射契约 — 使用 AST range/originalPeer 作为一期事实源

**决策：** 一期不新增独立 sourcemap 文件，直接在 Interop 转换点建立转换后节点到源节点的 AST 位置关系。

**方案：**

- 对语义一一对应的生成节点复制源节点的 `range`、`startPosition`、`endPosition`。
- 优先建立 `originalPeer` 回溯关系，确保后续消费者可以定位源节点。
- 对缺失位置元信息的源节点做空操作降级，不抛出异常。

**取舍理由：** 当前静态 ArkTS 工具链已经围绕 AST 节点位置工作。使用既有数据结构能最小化影响面，并避免新增文件产物、协议和调试器消费链路。

#### ADR-2: 主辅节点分离 — 主替换节点承接位置，辅助节点 no-debug-line

**决策：** 一源多节点场景中，只有主替换节点承接源码位置；纯生成辅助节点使用 `setNoDebugLineFlag()`。

**方案：**

- 主替换节点：与开发者源码语义对应，继承源节点位置。
- 辅助节点：包装器、初始化器、更新器、临时变量等，标记为不落盘调试行。
- 辅助节点标记可以递归应用到纯生成子树，但不得误标复用源子树。

**取舍理由：** 断点调试需要保留开发者语义节点，同时避免工具链生成细节暴露成重复停靠点。

#### ADR-3: Helper 收敛 — 统一封装位置继承和 no-debug-line 标记

**决策：** 新增 common helper 统一处理源码位置继承、安全降级和辅助节点标记。

**方案：**

- `copySourceMapping(target, source)`：复制 range/originalPeer/position。
- `markGeneratedNoDebugLine(node)`：对纯生成节点设置 no-debug-line。
- `copySourceMappingIfPresent(...)`：缺失位置时安全跳过。

**取舍理由：** Interop parsed、checked、legacy 转换点较多，helper 能减少重复逻辑，也便于单测覆盖边界。

#### ADR-4: 验证边界 — 工具链单测优先，非 Interop 回归兜底

**决策：** 验证聚焦 AST 元信息，不依赖真实调试器端到端环境。

**方案：**

- common helper 单测验证位置复制、安全降级和 no-debug-line 行为。
- Interop range-mapping 单测验证转换链路中的主辅节点策略。
- 既有 builder lambda/debug-line、wrap builder、navigation 等场景做非 Interop 回归。
- 完整 `npm run test` 作为最终回归门禁。

## 关键流程

### parsed 阶段位置继承

```text
源 struct / build method
        |
        v
Interop DeclTransformer 创建 class / method / body
        |
        v
copySourceMapping(生成节点, 源节点)
        |
        v
后续 UI-Plugin 消费转换后 AST 时仍可回溯开发者源码位置
```

### checked 阶段主辅节点处理

```text
源 UI interop 节点
        |
        v
生成主替换节点 + 辅助节点
        |
        +--> 主替换节点: copySourceMapping(target, source)
        |
        +--> 辅助节点: markGeneratedNoDebugLine(helper)
        |
        v
调试行列号只停靠在开发者语义对应节点
```

## 关键数据和接口

| 能力 | 说明 | 使用原则 |
|------|------|----------|
| `range` | 源码范围 | 主替换节点继承 |
| `startPosition` / `endPosition` | 源码起止位置 | range 不完整时作为补充 |
| `originalPeer` | 源 AST 节点回溯关系 | 优先建立，便于后续消费者回源 |
| `setNoDebugLineFlag()` | 禁止节点落盘调试行 | 仅用于纯生成辅助节点 |

## DFX 设计

| 类别 | 设计 |
|------|------|
| 兼容性 | 不修改公共 API、不改变插件顺序、不改变 UI 运行时语义 |
| 可靠性 | 位置信息缺失时 helper 安全降级，不阻断编译 |
| 可维护性 | 映射逻辑集中在 common helper，转换点只表达主辅节点意图 |
| 可测试性 | 新增 helper 单测、Interop 链路单测，并保留完整回归 |
| 性能 | 不新增全量 AST 扫描，只在已创建/替换节点处补充元信息 |

## 风险和缓解

| 风险 | 影响 | 缓解 |
|------|------|------|
| 主替换节点识别不准确 | 断点位置仍可能偏移 | 仅在语义明确处继承位置，复杂场景通过用例补齐 |
| 辅助节点误标 | 真实断点可能丢失 | 区分纯生成节点和复用源子树，单测覆盖 |
| 上游位置元信息缺失 | 映射不完整 | 安全降级，保持编译通过 |
| 后续调试器需要文件级 sourcemap | 一期能力不足 | 作为后续扩展，不纳入本需求 |
