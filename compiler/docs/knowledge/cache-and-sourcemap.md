# Cache 与 SourceMap 生命周期知识

本文只记录 fast build 的多层 cache 和 sourceMap 生命周期；不覆盖通用插件编排和 reload mode 语义。

## Cache 分层

| 层 | 关键状态/判断 | 失效或清理触发 | 常见误用 |
| --- | --- | --- | --- |
| etsChecker | TS target、Program 语义状态 | target 变化或 checker 重建 | 只清后端 cache |
| etsTransform | 配置、raw resource、const enum、文件记录 | bundle/module/runtime/resource/version 等变化 | 后端重编译却复用错误中间源码 |
| genAbc | `ARK_COMPILER_META_INFO`、`IS_CACHE_INVALID` | `checkArkCompilerCacheInfo()` 比较失败 | 与文件 hash cache 混用 |
| ModuleMode | `gen_hash.json`、`modules.cache` | meta 失效、hash/文件缺失 | 缓存文件不存在仍按增量继续 |

失效判断必须从上到下追踪：

```text
etsChecker → etsTransform → genAbc meta → ModuleMode file/hash cache
```

## SourceMap 生命周期

| 阶段 | 动作 | 证据 |
| --- | --- | --- |
| `genAbc.buildStart` | `SourceMapGenerator.init()` | generator 绑定本轮 Rollup 对象 |
| `etsTransform.transform` | TS emit 生成 map | emit 输出 map |
| `genAbc.transform` | 保存 combined sourcemap 并补包信息 | `preserveSourceMap()` / `updateSourceMap()` |
| `ModuleSourceFile` 处理 TS `SourceFile` | 经 `src/process_module_files.ts` 的 `writeFileSyncByNode()` 重打印节点并更新 map | cache 源码与重生成 map 对齐 |
| `ModuleSourceFile` 处理 JS/string | 经 `src/fast_build/ark_compiler/utils.ts` 的 `writeFileContentToTempDir()` 写临时源码，不再更新 map | 使用 `genAbc.transform` 已 preserve 的 map |
| `ModuleMode.generateAbc` | 构建/合并模块 sourceMap | debug/release 输出或 cache map |
| `genAbc.cleanUp` | 清理内存对象 | 下一轮无陈旧条目 |

## 约束

- 新增 cache key 必须对应确定的失效条件；影响输出的配置不得遗漏在 meta 比较之外。
- 清理必须作用在拥有该状态的层；禁止用“全删 cache”掩盖错误失效逻辑。
- sourceMap 问题必须逐阶段检查 emit、combined map、cache 写入、最终合并，禁止只看 buildEnd 输出。
- 路径归一化、包信息和 debug/release 输出差异必须与 recordName/OHM URL 规则共同验证。
- 构建结束或异常路径都必须清理单例/静态集合，避免跨轮次污染。

## 修改前检查

- [ ] 哪一层拥有状态，key 是什么，何时分配、失效和清理？
- [ ] 配置变化会同时影响前置源码和后端 ABC 吗？
- [ ] 缓存初始化、缓存命中、缓存失效、缓存依赖文件缺失和异常五条路径是否覆盖？
- [ ] sourceMap 的 source、路径、包信息与生成文件是否一一对应？

## 代码和测试

- 代码：`src/fast_build/ets_ui/rollup-plugin-ets-checker.ts`、`src/fast_build/ets_ui/rollup-plugin-ets-typescript.ts`、`src/fast_build/ark_compiler/cache.ts`、`src/fast_build/ark_compiler/generate_sourcemap.ts`、`src/fast_build/ark_compiler/module/module_source_file.ts`、`src/process_module_files.ts`、`src/fast_build/ark_compiler/utils.ts`、`src/fast_build/ark_compiler/module/module_mode.ts`
- 测试：`test/ark_compiler_ut/common/cache.test.ts`、`test/ark_compiler_ut/common/generate_sourcemap.test.ts`、`test/ark_compiler_ut/common/file_info_cache.test.ts`、`test/transform_ut/helpers/cache.ts`
