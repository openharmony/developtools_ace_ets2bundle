# Fast Build 插件流水线知识

本文只记录 `compiler/` 动态类型工具链的 Rollup fast build 协作边界，主线是 ESMODULE + ES2ABC。不展开具体前置转换、ABC 后端、cache/sourceMap 和 reload 规则；interop、webpack、混淆和 ts2abc 不在本文范围。

## 数据依赖主链

下图表达生产者到消费者的数据依赖，不表示 `compile_plugin.js` 的注册顺序：

```text
工程入口/依赖
  → etsChecker 建立 Program 与 TypeChecker
  → watchChangeFiles 维护 reload 变更输入
  → etsTransform 校验并转换 TS/ETS
  → apiTransform 执行系统 API 阶段
  → genAbc 初始化后端、接收模块并在 buildEnd 生成 ABC
  → ModuleMode 汇总描述 → es2abc
```

`compile_plugin.js` 的注册顺序固定：

| 阶段 | 主要 ArkCompiler 产物或作用 |
| --- | --- |
| memoryMonitor | 阶段内存统计 |
| watchChangeFiles | watch 集合；向 `changedFileList` 指向的 JSON 写变更信息 |
| etsChecker | `globalProgram`、TypeChecker、`hotReloadSupportFiles` |
| visualTransform | Visual/SuperVisual 变换；不在本知识域展开 |
| etsTransform | 前置 AST/code 与 `ModuleSourceFile` 输入 |
| apiTransform | 后端前的系统 API 检查 |
| genAbc | 配置、cache、sourceMap、模块描述和 ABC |
| terserPlugin | release 条件下的后续处理 |
| babelPlugin | JSBUNDLE 条件下的 CommonJS 处理 |
| createProgramPlugin | Program 创建时机补充 |

## 阶段边界

| 层 | 负责 | 不负责/常见误用 |
| --- | --- | --- |
| checker | TS 语义、root files、reload 支持文件 | 不生成 ABC |
| transform | UI/Sendable/import 等前置改写 | 不决定 es2abc 全部参数 |
| bridge | `ModuleSourceFile` 保存最终后端输入 | 不是持久化公共 API |
| backend | `ModuleInfo`、描述文件、命令与 ABC | 不应重复前置 AST 语义判断 |

## 约束

- 禁止只根据文件名移动插件或 hook；必须先画出生产者、消费者和清理时序。
- 必须区分插件注册顺序、Rollup hook 顺序和跨轮次状态依赖。
- 不要在 `compiler/` 引用 `arkui-plugins/` 的 es2panda AST 实现；两套工具链并行。
- 新增跨插件状态必须明确初始化、唯一所有者、消费者和 `cleanUp` 触发点。
- 跨阶段故障必须先定位第一个偏离预期的生产者，并检查真实中间产物；禁止从最终 ABC 反推单一责任文件。

## 修改前检查

- [ ] 变更发生在 checker、transform、bridge 还是 backend？
- [ ] 上游产物和下游消费者是否同时验证？
- [ ] 影响 ESMODULE、JSBUNDLE 还是两者？
- [ ] cache、watch、错误路径和下一轮构建是否仍能恢复干净状态？

## 代码和测试

- 入口：`compile_plugin.js`、`main.js`
- 阶段：`src/fast_build/ets_ui/rollup-plugin-ets-checker.ts`、`src/fast_build/ets_ui/rollup-plugin-ets-typescript.ts`、`src/fast_build/ark_compiler/rollup-plugin-gen-abc.ts`
- 测试：`test/ark_compiler_ut/ets_checker.test.ts`、`test/ark_compiler_ut/main.test.ts`、`test/ark_compiler_ut/`；至少覆盖 Program/checker、reload 支持集合、上下游接口和异常清理
