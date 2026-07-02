# 2026-06-26 Implementation Verification

## 变更范围核对

| 类别 | 文件 |
|------|------|
| 公共 helper | `arkui-plugins/common/source-mapping.ts` |
| parsed Interop | `arkui-plugins/interop-plugins/decl_transformer.ts` |
| checked Interop | `arkui-plugins/ui-plugins/interop/builder-interop.ts`、`arkui-plugins/ui-plugins/interop/interop.ts`、`arkui-plugins/ui-plugins/interop/legacy-transformer.ts` |
| 测试 | `arkui-plugins/test/demo/mock/interop/range-mapping.ets`、`arkui-plugins/test/ut/interop-plugins/range-mapping.test.ts` |

## 今日推进

- 修复本地验证链路：补齐 out SDK 路径映射，恢复 Linux native `es2panda.node` 加载路径，使 `arkui-plugins` jest 能进入实际测试执行。
- 处理 `ets1.2/libarkts` 与 `koala-wrapper` API 差异：`source-mapping` helper 对 `range` 和 `setNoDebugLineFlag()` 采用公开 API 优先、native bridge 兜底的方式。
- 修正 Interop module 更新路径：无 import 过滤变化时不调用 `updateETSModule()`，避免旧运行时五参签名在无变化场景下误触发。
- 调整定向测试读取 simultaneous 模式下的 external source AST，并按源码位置值验证 `startPosition`、`endPosition`、`range`，避免比较 wrapper 指针造成误判。

## AC 追溯

| AC | 实现状态 | 说明 |
|----|----------|------|
| AC-001 | 定向验证通过 | `range-mapping.test.ts` 检查 struct -> class 后 class/class definition 可回溯源 struct/definition，且源码位置值一致 |
| AC-002 | 定向验证通过 | `range-mapping.test.ts` 检查 build method/function/body 映射到转换前节点，清空 body 后保留源码位置值 |
| AC-003 | 代码草案完成，待回归确认 | checked Interop 主节点映射回源节点，initializer/updater/instantiate 等辅助节点标记 no-debug-line |
| AC-004 | 代码草案完成，待回归确认 | helper 对空节点安全返回，并兼容不同 libarkts API |
| AC-005 | 待补齐 | 完整 `npm run test` 或相关非 Interop 回归尚未执行完成 |

## 验证命令

| 命令 | 结果 | 说明 |
|------|------|------|
| `git diff --check` | 通过 | 未发现 diff whitespace error |
| `npm run compile` | 通过 | Babel 成功编译 322 个文件，并复制到 out SDK `ui-plugins` 目录 |
| `LD_LIBRARY_PATH=$INIT_CWD/../../../out/sdk/ohos-sdk/linux/ets/static/build-tools/ets2panda/lib ./node_modules/.bin/jest test/ut/interop-plugins/range-mapping.test.ts --config ./jest-test.config.js --runInBand --silent` | 通过 | 新增 Interop range-mapping 定向单测通过 |

## 当前结论

实现仍处于 Implement 阶段。今日已解除本地编译和定向 jest 的主要环境阻塞，AC-001/AC-002 已有自动化证据；下一步需补齐 AC-003/AC-004 的更直接断言或相关 checked Interop 回归，并运行必要的非 Interop 回归后再进入 Review。
