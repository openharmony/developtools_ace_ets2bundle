# 2026-07-01 Implementation Verification

## 今日结论

REQ-015 继续处于 **Release Ready / Verification Passed**。本轮复核确认当前 `arkui-plugins` 运行时已经具备本需求所需的关键能力：

- `arkts.factory.updateETSModule.length === 2`
- `AstNode.prototype.setNoDebugLineFlag` 为可调用函数
- native `_AstNodeSetNoDebugLineFlag` 为可调用函数

因此，旧五参 `updateETSModule()` ABI 不一致与 no-debug-line native 缺失问题已经不再阻塞 REQ-015 的定向实现和验证。
同时，补齐 linter 构建所需 npm 缓存后，`ohos_sdk_pre` 已通过，最终 `out/sdk/ohos-sdk/linux/ets/static/api` 已包含 `ReusePoolOwnership` 和 `Component/ComponentV2.reusePool`。清理 SDK 输出目录中 `stdlib/std/core` 下遗留的旧 `AbcFile.ets` / `StackTrace.ets` 后，非 Interop checked 回归已恢复通过；完整 `arkui-plugins npm run test` 已通过。

## 验证命令

| 命令 | 结果 | 说明 |
|------|------|------|
| `git diff --check -- <REQ-015 相关文件>` | 通过 | 业务代码与环境补丁范围未发现 whitespace error |
| `node -e <libarkts runtime probe>` | 通过 | 输出两参 `updateETSModule`、`setNoDebugLineFlag function`、`nativeNoDebug function` |
| `npm run compile` | 通过 | `arkui-plugins` 成功编译 334 个文件并复制到 out SDK `ui-plugins` 目录 |
| `LD_LIBRARY_PATH=/data/home/l00580606/workspace/code/SDK_0327/code/out/sdk/ohos-sdk/linux/ets/static/build-tools/ets2panda/lib ./node_modules/.bin/jest test/ut/common/source-mapping.test.ts --config ./jest-test.config.js --runInBand --silent` | 通过 | helper 单测 7/7 通过，新增覆盖目标节点无既有 `range` 时仍继承 source range |
| `LD_LIBRARY_PATH=$INIT_CWD/../../../out/sdk/ohos-sdk/linux/ets/static/build-tools/ets2panda/lib ./node_modules/.bin/jest test/ut/interop-plugins/range-mapping.test.ts --config ./jest-test.config.js --runInBand --silent` | 通过 | Interop range-mapping 真实 AST 用例 1/1 通过 |
| `./build.sh --product-name ohos-sdk --gn-args is_debug=true sdk_build_arkts=true enable_notice_collection=false --build-target interface/sdk-js:ohos_ets_api interface/sdk-js:ohos_build_static_sdk_api` | 通过 | `out/sdk/ohos_ets/api`、`out/sdk/ohos_static/api`、`out/sdk/obj/interface/sdk-js/ohos_build_static_sdk_api` 均已包含 `ReusePoolOwnership` 和 `Component/ComponentV2.reusePool` |
| `./build.sh --product-name ohos-sdk --gn-args is_debug=true sdk_build_arkts=true enable_notice_collection=false --build-target ohos_sdk_pre` | 通过 | 补齐 npm cache 后，`out/sdk/build.log` 显示 `[597/597] STAMP obj/build/ohos/sdk/ohos_sdk_pre.stamp`，`ohos-sdk build success` |
| `rg -n "ReusePoolOwnership|reusePool" out/sdk/ohos-sdk/linux/ets/static/api` | 通过 | 最终 Linux SDK 静态 API 已包含 `arkui/component/customComponent.d.ets` 中的 `ReusePoolOwnership` 和 `Component/ComponentV2.reusePool` |
| `LD_LIBRARY_PATH=$INIT_CWD/../../../out/sdk/ohos-sdk/linux/ets/static/build-tools/ets2panda/lib ./node_modules/.bin/jest test/ut/common/source-mapping.test.ts test/ut/interop-plugins/range-mapping.test.ts test/ut/ui-plugins/decorators/state/state-basic-type.test.ts test/ut/ui-plugins/component/basic-navigation.test.ts test/ut/ui-plugins/builder-lambda/debug-line.test.ts test/ut/ui-plugins/wrap-builder/init-with-builder.test.ts test/ut/ui-plugins/wrap-builder/wrap-builder-in-ui.test.ts --config ./jest-test.config.js --runInBand --coverage=false` | 通过 | 7 个定向 suite 通过，15/15 tests passed，覆盖 Interop 映射、helper、非 Interop checked 回归 |
| `npm run test` | 通过 | 完整 `arkui-plugins` 测试通过，193/193 suites、236/236 tests passed；仅残留 Jest worker graceful-exit 提示 |

## AC 状态

| AC | 当前状态 |
|----|----------|
| AC-001 | 通过定向真实 AST 验证，struct -> class/class definition 保留源位置映射 |
| AC-002 | 通过定向真实 AST 验证，build method/function/body 保留源位置映射 |
| AC-003 | helper 级 no-debug-line 证据通过；非 Interop checked 回归恢复通过，checked 链路不再有基线阻塞 |
| AC-004 | helper 级安全降级证据通过 |
| AC-005 | 通过；`state-basic-type`、`basic-navigation`、`builder-lambda/debug-line`、`wrap-builder/init-with-builder`、`wrap-builder/wrap-builder-in-ui` 以及完整 `npm run test` 均通过 |

## 下一步

1. Release Gate 已完成，复核实现 diff 仅包含 REQ-015 范围。
2. 清理或记录本地 SDK 输出目录中已删除的陈旧生成文件，避免后续环境回滚重复触发 checked 基线问题。
3. 准备代码提交前检查清单，确保不提交环境副作用或无关 `.codespec` 以外文件。
