# Review

> 状态：Release Ready。实现草案已覆盖 `range/originalPeer` 映射和辅助节点 `no-debug-line` 标记；本地编译、定向 Interop range-mapping 单测、helper no-debug-line/安全降级单测已通过。2026-07-01 复核确认当前运行时已暴露两参 `updateETSModule()`、`AstNode.setNoDebugLineFlag()` 和 native `_AstNodeSetNoDebugLineFlag()`，`ohos_sdk_pre` 已通过且最终 Linux SDK 静态 API 已包含 `ReusePoolOwnership`；清理 SDK 输出目录陈旧 stdlib 文件后，非 Interop checked 回归与完整 `npm run test` 均已通过。

## GA: Proposal Gate

- Define Gate 已通过，目标仓已校正为 `developtools/ace_ets2bundle/arkui-plugins`。
- 一期范围已确认：不新增独立 sourcemap，不修改 `debugLine` 注入逻辑，只增强 Interop 转换前后 AST 位置元数据。

## GB: Design Baseline Gate

- Specify / Design / Plan 均已形成基线。
- 设计约束保持一致：主替换节点继承 `range/originalPeer`，一源多辅助生成节点设置 `setNoDebugLineFlag()`。
- 实现文件仍在 Plan 批准范围内，未修改 `compiler/` 动态工具链，未修改插件流水线，未新增生产依赖。

## GC: Final Delivery Gate

| 检查项 | 当前结果 | 证据 |
|--------|----------|------|
| 代码范围符合 Plan | 通过 | 仅涉及 `arkui-plugins` Interop 转换、`common/source-mapping.ts`、新增 range-mapping 测试和 `.codespec` 交付件 |
| AC-001 struct -> class 映射 | 通过定向验证 | `range-mapping.test.ts` 检查 class/class definition 可回溯源 struct/definition，且源码位置值一致 |
| AC-002 build 方法映射 | 通过定向验证 | `range-mapping.test.ts` 检查 build method/function/body 可回溯转换前节点，且清空 body 后源码位置值一致 |
| AC-003 一源多辅助节点 | 通过 | `source-mapping.test.ts` 验证生成节点触发 no-debug-line、复用源节点不被误标，并覆盖公开 API 与 native bridge no-debug-line fallback；完整 checked 回归已恢复通过 |
| AC-004 安全降级 | helper 级验证通过 | `source-mapping.test.ts` 验证 `node/source` 缺失时安全返回，不改变已有节点元数据，覆盖目标节点无既有 `range` 时继承 source range，并覆盖 `range` native bridge fallback |
| AC-005 非 Interop 回归 | 通过 | `state-basic-type`、`basic-navigation`、`builder-lambda/debug-line`、`wrap-builder/init-with-builder`、`wrap-builder/wrap-builder-in-ui` 通过；完整 `npm run test` 通过 |
| 局部编译 | 通过 | `npm run compile` 成功编译 334 个文件并复制到 out SDK ui-plugins 目录 |
| 定向 jest | 通过 | `test/ut/interop-plugins/range-mapping.test.ts` 1/1 通过；`test/ut/common/source-mapping.test.ts` 7/7 通过 |
| 完整测试 | 通过 | `npm run test` 通过，193/193 test suites、236/236 tests passed；仅残留 Jest worker graceful-exit 提示 |
| SDK 构建环境 | 通过 | 当前 `arkui-plugins` 运行时可见两参 `updateETSModule()`、`AstNode.setNoDebugLineFlag()`、native `_AstNodeSetNoDebugLineFlag()`；补齐 npm cache 后完整 `ohos_sdk_pre` 通过，最终 `out/sdk/ohos-sdk/linux/ets/static/api` 已包含 `ReusePoolOwnership` |

## 环境问题归因

- `test/ut/ui-plugins/builder-lambda/debug-line.test.ts`、`test/ut/ui-plugins/wrap-builder/init-with-builder.test.ts`、`test/ut/ui-plugins/wrap-builder/wrap-builder-in-ui.test.ts` 的失败栈均停在 `ui-plugins/component-transformer.ts:857`，该文件不是 REQ-015 本地改动范围。
- 当前本地 diff 只涉及 Interop/source-mapping 范围，`component-transformer.ts`、`struct-translators/factory.ts`、`builder-lambda-translators/builder-factory.ts` 无本地 diff。
- 2026-07-01 复核确认：当前 `arkts.factory.updateETSModule.length === 2`，`AstNode.prototype.setNoDebugLineFlag` 与 native `_AstNodeSetNoDebugLineFlag` 均已暴露；旧五参 ABI 与 no-debug-line native 缺失不再阻塞 REQ-015 定向验证。
- 2026-07-01 非 Interop 回归曾失败在 `ES2PANDA_STATE_CHECKED`，完整错误信息指向 SDK 输出目录遗留的旧 `stdlib/std/core/AbcFile.ets` 与 `stdlib/std/core/StackTrace.ets`，而当前源码树仅保留 `arkruntime/AbcFile.ets` 和 `arkruntime/StackTrace.ets`。
- 2026-07-01 清理上述 SDK 输出目录陈旧文件后，`state-basic-type`、`basic-navigation`、`builder-lambda/debug-line`、`wrap-builder/init-with-builder`、`wrap-builder/wrap-builder-in-ui` 均恢复通过，确认该阻塞为原始 SDK 输出目录残留问题，不是 REQ-015 修改引入。
- 2026-07-01 进一步复查 SDK 基线后，`interface/sdk-js:ohos_ets_api` 与 `interface/sdk-js:ohos_build_static_sdk_api` 小目标已生成含 `ReusePoolOwnership` 的静态 API；补齐 `commander/json5/minipass/string-width-cjs/strip-ansi-cjs/wrap-ansi-cjs` 等 npm cache 后，`ohos_sdk_pre` 已通过，最终 Linux SDK 静态 API 已刷新。
- 2026-06-30 复检确认：用户提供的 `ohos_sdk_description_std.json` 替换和 Node `18.20.1` 生效后，生成 SDK 头文件已包含 `AstNodeSetNoDebugLineFlag`；剩余 `ohos_sdk_pre` 构建失败集中在 `ets1.2/libarkts` 被生成模板覆盖后与当前 SDK IDL 不匹配。
- 详细分析见 `evidence/reviews/2026-06-27-environment-triage.md`。
- 2026-06-30 环境复检见 `evidence/reviews/2026-06-30-environment-verification.md`。

## 结论

当前结论为 **Release Ready**。REQ-015 所需的 `range/originalPeer` 映射和 no-debug-line 标记能力在当前环境下可编译、可定向验证，SDK 构建链路已恢复，非 Interop checked 回归和完整 `npm run test` 已通过。Release Gate 已完成，后续仅需按仓库策略提交代码与交付件。
