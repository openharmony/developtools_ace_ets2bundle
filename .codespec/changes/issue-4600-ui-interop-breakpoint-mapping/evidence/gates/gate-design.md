# Design Gate

> 结论：Approved。设计已确定以 Interop 局部 range/original-node 继承为主，并用 no-debug-line 标记约束一源多辅助节点的调试落点。

## 检查表

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 正确目标模块 | 通过 | `arkui-plugins/interop-plugins`、`arkui-plugins/ui-plugins` |
| 架构边界 | 通过 | 不引入 `compiler/`，不更改插件流水线 |
| 关键设计决策 | 通过 | `design.md` D-001 至 D-005 |
| 修改点可定位 | 通过 | `design.md` 拟修改点表 |
| 风险有缓解 | 通过 | `design.md` 风险与缓解 |
| 测试策略明确 | 通过 | Interop range/originalPeer 正向测试，一源多节点 no-debug-line 检查，非 Interop 回归 |

## 实现约束

- 只编辑 TypeScript 源码和测试源码，不编辑 `arkui-plugins/lib/`。
- checked 阶段如产生 AST 变更，必须保持现有 recheck 约束；本需求主要改 parsed Interop range 映射和 checked Interop 辅助节点 no-debug-line 标记，不改变 pipeline。
- 不新增生产 npm 依赖。
