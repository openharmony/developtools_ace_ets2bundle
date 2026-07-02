# Release

> 状态：Release Ready。Review Gate 已完成，REQ-015 的实现、验证和 SDD 交付件已闭环；代码提交前仍需按仓库策略确认提交范围。

## Release Gate

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 需求范围 | 通过 | 仅覆盖 `arkui-plugins` Interop range/originalPeer 映射与辅助节点 no-debug-line 标记，不修改 `compiler/`，不改变插件流水线 |
| 规格追溯 | 通过 | AC-001 至 AC-005 均在 `review.md` 和 `evidence/reviews/2026-07-01-implementation-verification.md` 中有验证记录 |
| 编译验证 | 通过 | `arkui-plugins npm run compile` 通过，成功编译 334 个文件 |
| 定向验证 | 通过 | `source-mapping.test.ts` 7/7、`range-mapping.test.ts` 1/1 通过 |
| 回归验证 | 通过 | `state-basic-type`、`basic-navigation`、`builder-lambda/debug-line`、`wrap-builder/init-with-builder`、`wrap-builder/wrap-builder-in-ui` 通过 |
| 完整验证 | 通过 | `arkui-plugins npm run test` 通过，193/193 suites、236/236 tests passed |
| SDK 验证 | 通过 | `ohos_sdk_pre` 通过，最终 Linux SDK 静态 API 包含 `ReusePoolOwnership` |
| 环境副作用 | 已处理 | 清理 SDK 输出目录旧 `stdlib/std/core/AbcFile.ets` 与 `StackTrace.ets` 后 checked 基线恢复；不纳入代码提交 |

## Release 结论

REQ-015 当前满足 Release Ready 条件：实现已完成，SDD Define/Specify/Design/Plan/Implement/Review 交付件齐备，验证链路已闭环。

## 提交注意事项

- 代码提交应仅包含 REQ-015 相关源码、测试 fixture、单测和 `.codespec` 交付件。
- 不提交 SDK 输出目录、npm cache、`out/` 目录或其他环境副作用。
- 若进入远程 PR，建议在描述中注明本地完整测试结果和 SDK 输出目录陈旧 stdlib 文件清理背景。
