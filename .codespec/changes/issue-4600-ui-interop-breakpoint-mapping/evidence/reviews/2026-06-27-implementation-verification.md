# 2026-06-27 Implementation Verification

## 变更范围核对

| 类别 | 文件 |
|------|------|
| 公共 helper | `arkui-plugins/common/source-mapping.ts` |
| parsed Interop | `arkui-plugins/interop-plugins/decl_transformer.ts` |
| checked Interop | `arkui-plugins/ui-plugins/interop/builder-interop.ts`、`arkui-plugins/ui-plugins/interop/interop.ts`、`arkui-plugins/ui-plugins/interop/legacy-transformer.ts` |
| 测试 | `arkui-plugins/test/demo/mock/interop/range-mapping.ets`、`arkui-plugins/test/ut/interop-plugins/range-mapping.test.ts`、`arkui-plugins/test/ut/common/source-mapping.test.ts` |

## 今日推进

- 补充 `common/source-mapping` helper 单测，直接覆盖 `setSourceNodeMapping()` 的源码位置复制、no-debug-line 调用、安全空节点/空 source 降级，以及一源多节点时只标记生成子树节点。
- 补充 helper 对不同 libarkts API 形态的 fallback 覆盖：当 `range` accessor 不可用时走 `_AstNodeRangeConst/_AstNodeSetRange` native bridge；当节点公开 `setNoDebugLineFlag()` 不可用时走 `_AstNodeSetNoDebugLineFlag` native bridge。
- 复跑真实 AST 的 Interop parsed 定向用例，确认 struct -> class、class definition、build method/function/body 的 `range` / `originalPeer` 映射仍然正确。
- 完成 `arkui-plugins npm run compile`，确认新增 helper 与测试不会破坏插件编译输出。
- 尝试补跑非 Interop UI 回归，定位到当前本地 `ets1.2/libarkts` 打包产物与源码 API 不一致：既有 UI 用例在 `ComponentTransformer.visitETSModule()` 调用两参 `updateETSModule()` 时触发五参运行时的 `Expected Number` 异常，属于验证环境/API 版本阻塞，暂未作为本需求代码问题处理。

## AC 追溯

| AC | 实现状态 | 说明 |
|----|----------|------|
| AC-001 | 定向验证通过 | `range-mapping.test.ts` 检查 struct -> class 后 class/class definition 可回溯源 struct/definition，且源码位置值一致 |
| AC-002 | 定向验证通过 | `range-mapping.test.ts` 检查 build method/function/body 映射到转换前节点，清空 body 后保留源码位置值 |
| AC-003 | helper 级验证通过，checked AST 回归待补 | `source-mapping.test.ts` 验证一源多节点场景下生成节点触发 `setNoDebugLineFlag()`，复用源节点不被误标，并覆盖公开 API / native bridge 两种 no-debug-line 调用路径；checked Interop 真实 AST 断言仍待补齐 |
| AC-004 | helper 级验证通过 | `source-mapping.test.ts` 验证 `node/source` 缺失时安全返回，不改变已有节点元数据，并覆盖 `range` native bridge fallback |
| AC-005 | 环境/API 阻塞 | 相关 UI 回归用例被当前本地 `ets1.2/libarkts` `updateETSModule()` 打包产物签名阻塞，尚未形成有效通过证据 |

## 验证命令

| 命令 | 结果 | 说明 |
|------|------|------|
| `git diff --check` | 通过 | 未发现 diff whitespace error |
| `npm run compile` | 通过 | Babel 成功编译 322 个文件，并复制到 out SDK `ui-plugins` 目录 |
| `LD_LIBRARY_PATH=$INIT_CWD/../../../out/sdk/ohos-sdk/linux/ets/static/build-tools/ets2panda/lib ./node_modules/.bin/jest test/ut/common/source-mapping.test.ts --config ./jest-test.config.js --runInBand --silent` | 通过 | helper 单测 6 个用例通过，覆盖公开 API 与 native bridge fallback |
| `LD_LIBRARY_PATH=$INIT_CWD/../../../out/sdk/ohos-sdk/linux/ets/static/build-tools/ets2panda/lib ./node_modules/.bin/jest test/ut/interop-plugins/range-mapping.test.ts --config ./jest-test.config.js --runInBand --silent` | 通过 | Interop range-mapping 定向单测通过 |
| `LD_LIBRARY_PATH=$INIT_CWD/../../../out/sdk/ohos-sdk/linux/ets/static/build-tools/ets2panda/lib ./node_modules/.bin/jest test/ut/ui-plugins/builder-lambda/debug-line.test.ts test/ut/ui-plugins/wrap-builder/init-with-builder.test.ts test/ut/ui-plugins/wrap-builder/wrap-builder-in-ui.test.ts --config ./jest-test.config.js --runInBand --silent` | 阻塞 | 既有 UI 用例在 `updateETSModule()` 运行时签名不匹配处失败，未进入有效业务断言 |

## 当前结论

实现仍处于 Implement 阶段。AC-001/AC-002 已有真实 AST 自动化证据，AC-003/AC-004 已补充 helper 级直接证据；进入 Review 前仍需解决当前本地 `libarkts` API/打包产物不一致问题，或在一致环境中补跑非 Interop UI 回归与 checked Interop 真实 AST 断言。
