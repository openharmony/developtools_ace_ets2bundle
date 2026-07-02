# 互操作断点调试需求

> ArkUI 工具链 CodeSpec 规范模板 | 版本: v0.2
> 规格口径以 `developtools/ace_ets2bundle/arkui-plugins` 当前 Interop 转换链路和本目录 SDD 产物为准。

---

## 元信息

| 字段 | 内容 |
|------|------|
| 需求编号 | REQ-09-02-01-01 |
| 需求名称 | 互操作断点调试需求 |
| 特性编号 | FEAT-09-02-01-01 |
| 需求来源 | GitCode issue 4600 |
| 关联 Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4600 |
| 优先级 | P0 |
| 目标版本 | TBD |
| SIG归属 | SIG_ArkUI |
| 状态 | Release Ready |
| 复杂度 | 标准 |
| 创建日期 | 2026-06-23 |
| 最后更新 | 2026-07-02 |

---

## 一、需求目标与规格

### 1.1 US-1：Interop parsed 阶段保留源节点位置

**角色：** ArkUI 工具链开发者
**Want：** 在 struct -> class、build 方法改写等 parsed 阶段转换中保留源 AST 节点的源码位置
**以便：** 后续 UI-Plugin 和调试信息消费者可以回溯到开发者源码
**优先级：** P0

#### AC验收标准

| AC编号 | 验收标准（Given/WHEN/THEN格式） | 类型 |
|--------|----------------------------------|------|
| AC-1.1 | Given ArkTS-Sta UI struct 进入 Interop parsed 阶段，WHEN struct 被转换为 class，THEN 生成 class 节点继承源 struct 的 range/originalPeer 信息 | 正常 |
| AC-1.2 | Given struct definition 在 Interop parsed 阶段被重建，WHEN 生成 class definition，THEN class definition 可回溯到原 definition 的源码位置 | 正常 |
| AC-1.3 | Given build 方法在 Interop parsed 阶段被改写，WHEN method/function/body 节点更新完成，THEN 改写后的主体仍可回溯到原 build 方法或 body 位置 | 正常 |
| AC-1.4 | Given 源节点缺失 range/originalPeer，WHEN 执行 Interop parsed 转换，THEN 转换安全降级且不产生新增编译错误 | 边界 |

---

### 1.2 US-2：Interop checked 阶段主替换节点保留位置

**角色：** ArkUI 调试链路开发者
**Want：** compatibleComponent 等 checked 阶段主替换节点继承转换前源码位置
**以便：** 断点命中和调用栈显示稳定落回开发者可见源码
**优先级：** P0

#### AC验收标准

| AC编号 | 验收标准（Given/WHEN/THEN格式） | 类型 |
|--------|----------------------------------|------|
| AC-2.1 | Given UI 互操作节点在 checked 阶段生成主替换节点，WHEN 替换完成，THEN 主替换节点继承源节点 range/originalPeer | 正常 |
| AC-2.2 | Given compatibleComponent 包装转换生成主调用节点，WHEN 后续调试信息落盘，THEN 主调用节点对应开发者源码行列号而非生成代码默认位置 | 正常 |
| AC-2.3 | Given 源节点位置信息缺失，WHEN checked 阶段生成主替换节点，THEN 继续生成可编译 AST，不因映射缺失中断 | 边界 |

---

### 1.3 US-3：一源多节点辅助节点不落盘调试行

**角色：** ArkUI 应用调试者
**Want：** 一个源节点生成多个辅助节点时，只在主语义节点停靠断点
**以便：** Step into 不会在同一源码行反复停留
**优先级：** P0

#### AC验收标准

| AC编号 | 验收标准（Given/WHEN/THEN格式） | 类型 |
|--------|----------------------------------|------|
| AC-3.1 | Given 一个源节点生成主替换节点和多个辅助节点，WHEN 转换完成，THEN 主替换节点保留源码位置，辅助节点设置 `setNoDebugLineFlag()` | 正常 |
| AC-3.2 | Given 辅助节点包含子树，WHEN no-debug-line 标记应用，THEN 生成子树中不应落盘的节点均不会形成重复调试停靠点 | 正常 |
| AC-3.3 | Given 源子树被复用为主语义节点的一部分，WHEN 标记辅助节点，THEN 不误标复用源子树导致真实断点丢失 | 边界 |

---

### 1.4 US-4：非 Interop 转换不回归

**角色：** ArkUI 工具链维护者
**Want：** 本需求只影响 Interop range 映射和辅助节点调试标记
**以便：** builder lambda、wrap builder、navigation 等既有 UI 转换行为保持稳定
**优先级：** P1

#### AC验收标准

| AC编号 | 验收标准（Given/WHEN/THEN格式） | 类型 |
|--------|----------------------------------|------|
| AC-4.1 | Given 非 Interop builder lambda 场景，WHEN 执行 arkui-plugins 测试，THEN 既有 debug-line 用例通过 | 回归 |
| AC-4.2 | Given wrap builder 和 navigation 相关 UI 转换，WHEN 执行定向回归，THEN 输出 AST 和既有断点行为不因本需求变化 | 回归 |
| AC-4.3 | Given 完整 arkui-plugins 测试套，WHEN 执行 `npm run test`，THEN 所有既有用例通过 | 回归 |

---

## 二、规则定义

### 2.1 功能规则（FR）

| 规则ID | 描述 | 触发条件 | 作用对象 | 关联AC |
|--------|------|----------|----------|--------|
| FR-1.1 | Interop parsed 阶段生成的新 class/class definition 必须继承源 struct/definition 的位置关系 | struct -> class 转换 | class、class definition | AC-1.1, AC-1.2 |
| FR-1.2 | build 方法改写后 method/function/body 必须保留原 build 位置关系 | build 方法清空、替换或重建 | method、function、body | AC-1.3 |
| FR-2.1 | Interop checked 阶段主替换节点必须继承源节点 range/originalPeer | compatibleComponent 或等价主替换 | 主替换节点 | AC-2.1, AC-2.2 |
| FR-3.1 | 一源多节点的辅助生成节点必须设置 no-debug-line | 源节点派生包装器、初始化器、更新器等辅助节点 | 辅助节点及其生成子树 | AC-3.1, AC-3.2 |
| FR-3.2 | 不得将仍承载开发者源码语义的复用源子树误标为 no-debug-line | 辅助节点标记传播 | 复用源子树 | AC-3.3 |
| FR-4.1 | 源位置信息缺失时必须安全降级 | source range/originalPeer 不可用 | 所有转换点 | AC-1.4, AC-2.3 |
| FR-5.1 | 非 Interop 既有转换行为不得回归 | builder lambda、wrap builder、navigation 等场景 | 既有 UI 转换 | AC-4.1, AC-4.2, AC-4.3 |

### 2.2 非功能规则（NFR）

| 规则ID | 类别 | 描述 | 验证方式 |
|--------|------|------|----------|
| NFR-1 | 兼容性 | 不改变 ArkUI 运行时语义，不改变公共 API，不新增生产依赖 | 代码审查 + 编译 |
| NFR-2 | 性能 | 位置继承仅发生在节点创建/替换点，不引入全量 AST 扫描 | 代码审查 + 测试耗时观察 |
| NFR-3 | 可维护性 | 映射和 no-debug-line 逻辑使用局部 helper 收敛，避免散落复制 | 代码审查 |
| NFR-4 | 可测试性 | 提供 common helper 单测、Interop range-mapping 单测和非 Interop 回归 | Jest |
| NFR-5 | 可观测性 | 验证证据归档到 `.codespec/changes/issue-4600-ui-interop-breakpoint-mapping/evidence/` | 文档检查 |

---

## 三、测试设计

### 3.1 测试矩阵

| 测试ID | 覆盖规则 | 场景 | 期望结果 | 类型 |
|--------|----------|------|----------|------|
| TC-001 | FR-1.1 | struct -> class 转换 | class 节点继承源 struct range/originalPeer | 单测 |
| TC-002 | FR-1.2 | build 方法改写 | method/function/body 可回溯到原 build 位置 | 单测 |
| TC-003 | FR-2.1 | compatibleComponent 主替换节点 | 主节点继承源节点位置 | 单测 |
| TC-004 | FR-3.1 | 一源多辅助节点 | 辅助节点设置 no-debug-line | 单测 |
| TC-005 | FR-4.1 | 缺失位置信息 | 转换不中断、无新增诊断 | 单测 |
| TC-006 | FR-5.1 | builder lambda/debug-line | 既有用例通过 | 回归 |
| TC-007 | FR-5.1 | wrap builder/navigation | 定向回归通过 | 回归 |
| TC-008 | NFR-4 | 完整 arkui-plugins 测试 | 236/236 tests 通过 | 回归 |

### 3.2 验证命令

```bash
cd developtools/ace_ets2bundle/arkui-plugins
npm run compile
npm run test
```

定向验证：

```bash
npx jest test/ut/common/source-mapping.test.ts
npx jest test/ut/interop-plugins/range-mapping.test.ts
```

### 3.3 验收出口

- [x] 规格覆盖 Interop parsed、checked、一源多节点和安全降级场景
- [x] 设计明确主替换节点与辅助节点职责边界
- [x] 实现验证已覆盖新增 helper、Interop range mapping、非 Interop 回归和完整测试套
- [x] 交付件已绑定 GitCode issue 并按 `.codespec/changes/issue-*` 目录格式归档
