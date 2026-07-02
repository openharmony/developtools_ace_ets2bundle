# 需求文档 — 互操作断点调试需求

## 一、原始需求

### 基本信息

| 字段 | 内容 |
|------|------|
| 需求ID | REQ-09-02-01-01 |
| 需求名称 | 互操作断点调试需求 |
| 来源 | 需求 Owner 提出 |
| CodeSpec ID | issue-4600-ui-interop-breakpoint-mapping |
| 关联 Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4600 |
| 目标仓 | `developtools/ace_ets2bundle` |
| 目标模块 | `arkui-plugins` |
| 优先级 | P0 |
| 状态 | Baselined |

### 原始描述

ArkTS-Sta 调用 ArkTS-Dyn 时，ArkUI 会经过 UI-Plugin / Interop 转换。转换会生成或改写 AST 节点，断点调试需要将转换前开发者源码的行列号映射到转换后的节点上，效果类似 TypeScript compiler 的 sourcemap 映射，但一期不新增独立 sourcemap 产物。

### 背景与痛点

| 用户类型 | 当前痛点 | 影响 |
|----------|----------|------|
| ArkUI 应用开发者 | 在 UI 互操作代码上设置断点后，调试位置可能落到生成代码或转换后位置 | 断点命中、单步进入、调用栈定位不稳定 |
| ArkUI 工具链开发者 | Interop parsed/checked 阶段未系统保留转换前后节点源码位置关系 | 后续调试信息消费者无法稳定回溯开发者源码 |
| 调试器使用者 | 一个源节点生成多个辅助节点时，可能在同一源码行重复停靠 | Step into 体验重复、低效 |

### 初始范围

**包含：**

- Interop parsed 阶段 struct -> class、build 方法改写、class definition 的源码位置继承
- Interop checked 阶段主替换节点的 `range` / `originalPeer` 映射
- 一源多节点辅助节点的 `setNoDebugLineFlag()` 标记
- 缺失源码位置元信息时的安全降级
- arkui-plugins 定向单测、非 Interop 回归和完整测试验证

**不包含：**

- 不新增独立 sourcemap 文件
- 不修改 `debugLine` 注入逻辑
- 不修改 `compiler/` 动态工具链
- 不改变 UI 运行时语义、组件布局或渲染行为
- 不调整插件执行顺序

### 初始假设

| 假设 | 类型 | 验证方式 | 状态 |
|------|------|----------|------|
| 静态 ArkTS AST 节点已具备 range/originalPeer/position 能力 | 技术 | 代码核对 | 已验证 |
| Interop 转换是当前缺口 | 技术 | `interop-plugins` 与 `ui-plugins/interop` 代码核对 | 已验证 |
| 本需求不依赖 debugLine 机制修改 | 范围 | Owner 澄清 | 已确认 |
| 一源多节点辅助节点需使用 `setNoDebugLineFlag()` | 技术 | Owner 澄清 + API 核对 | 已确认 |

---

## 二、澄清记录

### 待澄清问题

| 编号 | 问题 | 为什么需要澄清 | 状态 |
|------|------|----------------|------|
| Q-1 | 需求目标仓是否为 `arkui_ace_engine` 还是工具链仓 | 决定代码分析和提交范围 | 已澄清：工具链仓 `developtools/ace_ets2bundle` |
| Q-2 | 本期是否需要新增 sourcemap 文件 | 决定交付架构 | 已澄清：不新增，沿用 AST range 映射 |
| Q-3 | 是否需要修改 debugLine 逻辑 | 决定影响面 | 已澄清：无关，仅设置正确 range |
| Q-4 | 一源多节点如何避免重复停靠 | 决定辅助节点策略 | 已澄清：使用 `setNoDebugLineFlag()` |
| Q-5 | FuncID 归属 | 归档元数据 | 已澄清：09-02-01 |

### 讨论记录

| 日期 | 参与人 | 讨论主题 | 结论 | 后续动作 |
|------|--------|----------|------|----------|
| 2026-06-23 | Owner | 需求范围 | 工具链需求，目标目录为 `developtools/ace_ets2bundle/arkui-plugins` | 按工具链 SDD 推进 |
| 2026-06-23 | Owner | 转换前后映射 | 静态侧一般以 range 表达，当前 Interop 未适配 | 设计 range/originalPeer 映射 |
| 2026-06-24 | Owner | debugLine 边界 | 本需求与 debugLine 无关，仅设置正确 range | 不修改 debugLine 机制 |
| 2026-06-24 | Owner | 多节点生成 | 辅助节点需设置 `setNoDebugLineFlag()` | 纳入规格和测试 |
| 2026-06-24 | Owner | FuncID | funcid 为 09-02-01 | 更新归档元数据 |

### 方案探索

| 编号 | 方案概述 | 优势 | 风险/代价 | 选择结论 |
|------|----------|------|-----------|----------|
| A-1 | 新增独立 sourcemap 产物 | 映射表达完整，调试器可直接消费 | 改动大，需新增产物协议和消费链路 | 不选，一期范围过大 |
| A-2 | 在 Interop 转换点继承 AST `range` / `originalPeer`，辅助节点 no-debug-line | 影响面小，贴合现有工具链数据结构 | 复杂转换场景需逐点识别主节点与辅助节点 | 选择 |
| A-3 | 修改 debugLine 注入位置 | 可局部修复部分调试行 | 与真实需求不匹配，无法解决转换前后节点映射 | 不选 |

**取舍理由：** A-2 与现有静态 ArkTS AST 能力一致，不新增调试产物，也不改变插件流水线。通过主替换节点承接源码位置、辅助节点禁止落盘调试行，可以同时解决断点漂移和重复停靠问题。

### 子系统影响

| 问题 | 回答 | 状态 |
|------|------|------|
| 涉及哪些子系统？ | `developtools/ace_ets2bundle/arkui-plugins` | 已确认 |
| 是否跨仓？ | 否 | 已确认 |
| 是否涉及公共 API？ | 否 | 已确认 |
| 是否影响运行时？ | 否 | 已确认 |

### 进入规格阶段条件

- [x] 原始问题和期望结果已记录
- [x] 需求来源和责任人已明确
- [x] 初始范围和不包含项已记录
- [x] 关键假设和待澄清问题已列出
- [x] 技术方案方向已收敛
