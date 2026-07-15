# Hot/Cold Reload 知识

本文只记录 ESMODULE fast build 的 watch、hot reload 与 cold reload 数据链；不覆盖通用 cache/sourceMap 生命周期和 ABC 后端描述规则。

## 完整数据流

```text
main.js/config 先设置 projectConfig.changedFileList 路径
  → etsChecker 收集 hotReloadSupportFiles
  → watchChangeFiles.watchChange 区分 update 与 create/delete
  → beforeBuild 结合支持文件向该路径写 changed-file JSON
  → initArkProjectConfig 复制 reload 配置与 JSON 路径
  → generateModuleAbc 选择 ModuleHotreloadMode / ModuleColdreloadMode
  → 全量构建执行 compileAllFiles → full ABC/full sourceMap + --dump-symbol-table
  → 增量构建执行 compileChangeListFiles → patch ABC/reload sourceMap + --input-symbol-table + hot/cold 参数
```

## 状态与模式

| 状态/模式 | 来源 | 消费者 | 关键证据 |
| --- | --- | --- | --- |
| `hotReloadSupportFiles` | `src/ets_checker.ts` | watch 变更过滤 | 变更文件是否被判定支持 reload |
| modified/removed 集合 | `watchChange()` | `beforeBuild()` | update 与 create/delete 分类 |
| `changedFileList` | `main.js`/配置阶段设置的 JSON 文件路径 | `beforeBuild()` 写文件；reload mode 读取并解析 | hot 兼容 v1 `modifiedFiles`/v2 `modifiedFilesV2`；cold 读取 `modifiedFiles` |
| hot/cold 全量构建 | 全量 module list | 对应 reload mode | full ABC/full sourceMap、`--dump-symbol-table` |
| hot 增量构建 | changed files + 旧 symbol table | `ModuleHotreloadMode` | `--input-symbol-table --hot-reload` |
| cold 增量构建 | changed files + 旧 symbol table | `ModuleColdreloadMode` | patch ABC/reload sourceMap、`--input-symbol-table --cold-reload` |

## 约束

- reload 失败必须从 checker 支持集合开始排查，禁止直接在 mode 类中硬塞变更文件。
- create/delete 与 update 必须保留不同语义；路径归一化后再写 changed-file JSON，不要把 `changedFileList` 当内存数组。
- hot reload 的 v1/v2 路径格式与 cold reload 的 v1 格式必须分别验证，禁止假设两个 mode 的解析能力相同。
- 全量构建与增量构建的 symbol table 参数不可混用；hot 与 cold 参数不可互换。
- patch ABC 与 reload sourceMap 必须来自同一变更集合。
- watch 集合、changed list、mode 单例和 sourceMap 状态必须在正确轮次清理，不能污染下一轮。

## 修改前检查

- [ ] 文件是否进入 `hotReloadSupportFiles`，watch 事件类型是否正确？
- [ ] 配置是否先设置 JSON 路径，`beforeBuild()` 是否写入，路径是否被 `initArkProjectConfig()` 复制并由 mode 解析？
- [ ] `generateModuleAbc()` 是否选择预期 mode？
- [ ] 全量/增量、hot/cold、修改/新增/删除是否分别覆盖？
- [ ] patch ABC、symbol map 与 reload sourceMap 是否一致？

## 代码和测试

- 代码：`src/ets_checker.ts`、`src/fast_build/common/rollup-plugin-watch-change.ts`、`src/fast_build/ark_compiler/common/process_ark_config.ts`、`src/fast_build/ark_compiler/generate_module_abc.ts`、`src/fast_build/ark_compiler/module/module_hotreload_mode.ts`、`src/fast_build/ark_compiler/module/module_coldreload_mode.ts`
- 测试：`test/ark_compiler_ut/ets_checker.test.ts`、`test/ark_compiler_ut/common/process_ark_config.test.ts`、`test/ark_compiler_ut/module/module_hotreload_mode.test.ts`、`test/ark_compiler_ut/module/module_coldreload_mode.test.ts`
