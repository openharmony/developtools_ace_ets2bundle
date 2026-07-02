# 2026-06-30 Environment Verification

## 今日结论

REQ-015 仍处于 **Implementing / Verification In Progress**。用户提供的 ArkTS SDK 描述裁剪与 Node 18 环境修正已经生效，`AstNodeSetNoDebugLineFlag` 已进入生成 SDK 头文件；但完整 `ohos_sdk_pre` 构建继续阻塞在 `ets1.2/libarkts` 源码与当前 `ets_frontend` public API / SDK IDL 不一致，尚不能作为 Review Gate 通过证据。

该阻塞仍归类为环境/工具链基线一致性问题，不归因于 REQ-015 的 Interop range-mapping 业务改动。

## 环境动作

| 项目 | 结果 |
|------|------|
| SDK 描述 | 已按用户提供的 ArkTS static SDK 模块列表替换 `build/ohos/sdk/ohos_sdk_description_std.json`，当前 JSON 为 35 项 |
| Node 版本 | `build/build_scripts/build.sh` 临时切换到 Node `18.20.1`；仅修改 `nodejs/current` 软链不足以影响 OH 构建脚本 |
| out 目录 | 按删除 out 的目标执行为保留备份式重建：旧目录已保留为 `out_bak_20260630_envcheck`，新 `out` 由构建重新生成 |
| SDK 导出 | `developtools/ace_ets2bundle/ets1.2/libarkts/sdk/.../es2panda_lib.h` 已出现 `AstNodeSetNoDebugLineFlag` |
| 验证运行时 | 为继续跑 REQ-015 定向验证，已从 `out_bak_20260630_envcheck` 恢复 `out/sdk/ohos-sdk/linux/ets/static` 与 `ets1.2/libarkts/lib` 的可用运行时目录 |

## 完整 SDK 构建阻塞

执行命令：

```bash
./build.sh --product-name ohos-sdk --gn-args 'is_debug=true sdk_build_arkts=true enable_notice_collection=false' --build-target ohos_sdk_pre
```

当前失败点：

| 文件 | 失败原因 |
|------|----------|
| `ets1.2/libarkts/native/src/bridges.cpp` | 引用了当前 SDK IDL 不存在的 `Es2pandaImportFlags`，并以 7 参调用当前 6 参的 `ETSParserBuildImportDeclaration` |
| `ets1.2/libarkts/native/src/bridges.cpp` | 调用当前 SDK IDL 不存在的 `ETSParserGetGlobalProgramAbsName`；当前可用接口为 `ETSParserGetGlobalProgramConst` + `ProgramAbsoluteNameConst` |
| `ets1.2/libarkts/native/src/common.cpp` | 使用当前 interop 头中不存在的 `interop_memcpy`，当前可用接口为 `interop_memory_copy` |
| `ets1.2/libarkts/src/arkts-api/ImportStorage.ts` | 从生成枚举导入不存在的 `Es2pandaImportFlags` |

同时，`arktscgen` 构建流程曾覆盖 `ets1.2/libarkts` 源码树，产生大量 `libarkts` 脏文件。该类文件属于环境排障副作用，不纳入 REQ-015 业务代码提交范围。

## REQ-015 定向验证

| 命令 | 结果 | 说明 |
|------|------|------|
| `npm run compile` | 通过 | `arkui-plugins` 成功编译 334 个文件并复制到恢复后的 out SDK `ui-plugins` 目录 |
| `LD_LIBRARY_PATH=$INIT_CWD/../../../out/sdk/ohos-sdk/linux/ets/static/build-tools/ets2panda/lib ./node_modules/.bin/jest test/ut/common/source-mapping.test.ts --config ./jest-test.config.js --runInBand --silent` | 通过 | helper 单测 6/6 通过，覆盖 range/originalPeer 复制、no-debug-line 调用、native bridge fallback 与安全降级 |
| `LD_LIBRARY_PATH=$INIT_CWD/../../../out/sdk/ohos-sdk/linux/ets/static/build-tools/ets2panda/lib ./node_modules/.bin/jest test/ut/interop-plugins/range-mapping.test.ts --config ./jest-test.config.js --runInBand --silent` | 通过 | Interop parsed 真实 AST range-mapping 单测 1/1 通过 |
| `LD_LIBRARY_PATH=$INIT_CWD/../../../out/sdk/ohos-sdk/linux/ets/static/build-tools/ets2panda/lib ./node_modules/.bin/jest test/ut/ui-plugins/builder-lambda/debug-line.test.ts test/ut/ui-plugins/wrap-builder/init-with-builder.test.ts test/ut/ui-plugins/wrap-builder/wrap-builder-in-ui.test.ts --config ./jest-test.config.js --runInBand --silent` | 阻塞 | 既有非 Interop UI 回归继续在 `ComponentTransformer.visitETSModule()` 的旧五参 `updateETSModule()` 运行时签名处失败 |
| `git diff --check -- <REQ-015 相关文件>` | 通过 | REQ-015 业务代码与 SDD 交付件范围未发现 whitespace error |

## 当前判断

- AC-001 / AC-002：继续有真实 AST 自动化证据。
- AC-003 / AC-004：helper 级证据继续有效，真实 no-debug-line native 落盘仍需等待 `libarkts` 新运行时产物一致后补证。
- AC-005：仍被原始 `libarkts` 运行时 ABI 不一致阻塞。

进入 Review 前仍需要完成至少一项：

1. 修复或同步 `ets1.2/libarkts` 源码、generated API、SDK IDL 和打包产物的一致性后，补跑非 Interop UI 回归。
2. 若环境 owner 给出正式豁免依据，则将当前 Interop 定向证据作为阶段性 Review 输入，并在 Release 前补完整回归。
