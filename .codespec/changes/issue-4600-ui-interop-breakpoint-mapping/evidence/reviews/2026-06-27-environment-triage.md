# 2026-06-27 Environment Triage

## 结论

当前 `builder-lambda/debug-line` 与 `wrap-builder` 回归失败判定为 **原始环境/`libarkts` 打包产物不一致问题**，不是 REQ-015 的 Interop range/no-debug-line 改动引入。

该问题不阻塞 REQ-015 的代码草案继续推进，但会阻塞 AC-005 的完整非 Interop 回归通过证据，以及 AC-003 中 `setNoDebugLineFlag()` 的真实 native 落盘行为验证。

## 事实依据

| 检查项 | 结果 |
|--------|------|
| 失败栈 | 均在 `ui-plugins/component-transformer.ts:857` 的既有 `arkts.factory.updateETSModule(node, newStatements)` 处失败 |
| 本地 diff 范围 | 仅 `interop-plugins/decl_transformer.ts`、`ui-plugins/interop/*.ts`、`common/source-mapping.ts` 及新增测试/SDD 文档；`component-transformer.ts`、`struct-translators/factory.ts`、`builder-lambda-translators/builder-factory.ts` 无本地 diff |
| REQ-015 相关测试 | `test/ut/common/source-mapping.test.ts` 与 `test/ut/interop-plugins/range-mapping.test.ts` 均通过 |
| 编译 | `arkui-plugins npm run compile` 通过，当前基线编译 333 个文件 |
| `updateETSModule` 源码 | `ets1.2/libarkts/src/arkts-api/node-utilities/ETSModule.ts` 为两参实现 |
| `updateETSModule` 运行时 | `ets1.2/libarkts/lib/libarkts.js` 实际加载五参实现，`arkts.factory.updateETSModule.length === 5` |
| no-debug-line 源码 | `ets1.2/libarkts/src/arkts-api/peers/AstNode.ts` 有 `setNoDebugLineFlag()` |
| no-debug-line 运行时 | 当前 `lib/libarkts.js` / generated native module 未暴露 `setNoDebugLineFlag` / `_AstNodeSetNoDebugLineFlag` |

## 影响分析

- 非 Interop UI 回归失败发生在 parsed 阶段的通用 `ComponentTransformer`，尚未进入 REQ-015 修改的 checked Interop helper 路径。
- 失败原因是现有 UI 插件按两参 `updateETSModule()` 调用，而当前加载的 `libarkts` 打包产物实际执行五参版本并要求 `flag` 为 number。
- REQ-015 在 `DeclTransformer.transformImportDecl()` 中已规避“无 import 变化仍触发旧签名”的局部风险；但通用 UI 插件的大量既有 `updateETSModule()` 两参调用不属于本需求范围。
- `setNoDebugLineFlag()` 当前只能通过 helper 单测验证调用意图，无法在当前 native/JS 打包产物上验证真实落盘标记。

## 后续建议

1. 由环境/工具链 owner 同步 `ets1.2/libarkts` 的 `src`、`lib`、`types`、native generated API，确保 `updateETSModule()` 与 `setNoDebugLineFlag()` 的源码和运行时产物一致。
2. 环境恢复后补跑：
   - `test/ut/ui-plugins/builder-lambda/debug-line.test.ts`
   - `test/ut/ui-plugins/wrap-builder/init-with-builder.test.ts`
   - `test/ut/ui-plugins/wrap-builder/wrap-builder-in-ui.test.ts`
   - 完整或更大范围 `npm run test`
3. REQ-015 可继续推进本地实现与文档，但进入 Review/Release 前需补齐上述回归证据。
