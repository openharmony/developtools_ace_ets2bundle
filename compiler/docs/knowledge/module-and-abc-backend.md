# 模块桥接与 ABC 后端知识

本文只记录 `ModuleSourceFile`、`genAbc`、`ModuleMode` 到 es2abc 的后端主链；不覆盖上游 AST 转换、cache/sourceMap 生命周期和 reload 数据链。

## ESMODULE 主链

```text
genAbc.buildStart
  → initArkProjectConfig / cache / SourceMapGenerator / preload 初始化
genAbc.transform
  → preserveSourceMap / JS lazy import / ModuleSourceFile.newSourceFile
genAbc.beforeBuildEnd + moduleParsed
  → linter、声明、singleFileEmit 等补充检查
genAbc.buildEnd
  → generateModuleAbc → processModuleSourceFiles → ModuleMode
  → filesInfo.txt + npmEntries.txt + modules.cache → es2abc → modules.abc
genAbc.cleanUp
  → 清理跨构建对象
```

## 核心身份与边界

| 对象 | 身份 | 常见误用 |
| --- | --- | --- |
| `ModuleSourceFile` | 前置插件输出与后端缓存文件之间的桥 | 当成只由 `genAbc` 写入的对象 |
| `ModuleInfo` | 单个后端输入的路径、recordName、语言和包元数据 | 直接从源码路径猜 recordName |
| OHM URL / recordName | 由 Rollup meta、工程配置和 `src/ark_utils.ts` 计算的 Ark 运行时模块身份 | 与 Rollup module id 混用 |
| filesInfo | es2abc 的逐模块编译描述 | 改字段顺序但不验证解析端 |
| npmEntries | 外部包入口映射 | 当成普通模块清单 |
| modules.cache | 后端 cache 文件映射 | 与 transform cache 混为一层 |

| 模式 | 接入 hook | 后端输入 | 典型输出 |
| --- | --- | --- | --- |
| ESMODULE | `buildEnd` / `generateModuleAbc()` | `ModuleSourceFile`、`ModuleInfo`、三类描述文件 | `modules.abc` / `widgets.abc` |
| JSBUNDLE | `generateBundle` / `generateBundleAbc()` | Rollup bundle 的 JS chunk/asset、临时 JS | bundle 对应 ABC |

`filesInfo.txt` 的普通源码行是与 es2abc 对接的七字段协议，顺序固定为：

```text
cacheFilePath;recordName;moduleType;sourceFile;packageName;isSharedModule;originSourceLang
```

bytecode HAR 与 customized HAR 的 ABC 输入使用 `${abcPath};;;;${pkgName};` 特殊行，不得套用普通源码七字段校验。

## 约束

- recordName 错误必须按 Rollup `moduleInfo.meta`/工程配置 → `ModuleMode` → `src/ark_utils.ts` → filesInfo 排查；`ModuleSourceFile` 只用于核对物化后的源码与 cache 路径。
- 禁止调整普通源码行的 filesInfo 七字段顺序，也不得把特殊 HAR 行强制改成七字段；修改描述文件或 es2abc 参数前必须确认消费格式与模式分支。
- `generateModuleAbc()` 遇上游 error 或非 ESMODULE 会提前返回；不要把“未生成”直接归因于子进程。
- `compileHar` 且非 bytecode HAR 等分支可能只生成 sourceMap；判断缺失 ABC 前必须核对配置。
- 不要直接编辑 cache 中间文件验证修复；应从生产它的源码和元数据修正。
- ABC 未生成必须按中间源码 → `ModuleSourceFile` → 上游 error/模式 → module list → filesInfo → 子进程顺序定位。

## 修改前检查

- [ ] `ModuleSourceFile` 的两类输入（TS SourceFile、JS string）是否都保持？
- [ ] 普通源码行字段是否完整，特殊 HAR 行是否保持独立格式？
- [ ] 命令参数、成功/失败分支和错误格式是否覆盖？
- [ ] singleFileEmit、preview、HAR/HSP 与模式分支是否受影响？

## 代码和测试

- 代码：`src/fast_build/ark_compiler/rollup-plugin-gen-abc.ts`、`src/fast_build/ark_compiler/transform.ts`、`src/fast_build/ark_compiler/generate_module_abc.ts`、`src/fast_build/ark_compiler/module/module_source_file.ts`、`src/process_module_files.ts`、`src/fast_build/ark_compiler/module/module_mode.ts`、`src/ark_utils.ts`
- 测试：`test/ark_compiler_ut/module/module_source_file.test.ts`、`test/ark_compiler_ut/module/module_mode.test.ts`、`test/ark_compiler_ut/module/module_build_mode.test.ts`、`test/ark_compiler_ut/module/module_preview_mode.test.ts`、`test/ark_compiler_ut/module/module_hotfix_mode.test.ts`、`test/ark_compiler_ut/bundle/bundle_mode.test.ts`、`test/ark_compiler_ut/ark_utils.test.ts`
