# ArkCompiler 前置转换知识

本文只记录 fast build ESMODULE + ES2ABC 基础主链进入 ABC 后端前的 TS/ETS AST 与 JS code 能力；不覆盖 JSBUNDLE，也不覆盖 `ModuleSourceFile` 之后的后端处理。

## 转换顺序与产物

| 能力 | 接入点 | 关键产物 | 常见误用 |
| --- | --- | --- | --- |
| shared module | `validateUISyntax()` → `collectSharedModule()` | `sharedModuleSet`，最终进入 filesInfo | 把 `use shared` 当后端参数 |
| Sendable | `processUISyntax()` | `use sendable`、构造函数/类型 AST 改写 | 先排查 es2abc 而不看中间源码 |
| import path expand | emit transformer，使用 TypeChecker | 指向真实声明来源的 import/export | 丢失 type-only 或 external 语义 |
| kit import | 位于 import path expand 之后 | `@kit.*` 到真实 API 模块映射 | 只检查 kit 配置，不检查最终模块请求 |
| lazy import（TS/ETS） | `processKitImport()` / `transformLazyImport()` | 借助 resolver 区分类型和值 | 与 JS 阶段重复或顺序颠倒 |
| lazy import（JS） | `genAbc.transform()` → `processJsCodeLazyImport()` | 最终 JS import 与 re-export 诊断 | 误认为只有一个接入点 |

推荐排查数据流：

```text
etsChecker TypeChecker/EmitResolver
  → processUISyntax
  → expandAllImportPaths
  → processKitImport / transformLazyImport
  → TS emit
  → genAbc.transform 的 JS lazy import
  → ModuleSourceFile
```

## 边界与规则

- Sendable 必须先验证 emit 后中间源码中的指令、构造函数、`super(...args)` 和可选属性，再进入后端排查。
- shared module 只在 `use shared` 位于 import 后第一个非 import 语句时收集；最终以 filesInfo 的 shared 字段证明生效。
- import path expand 必须复用 checker 语义；不要用字符串替换代替符号来源解析。
- kit import 必须保持在 import path expand 之后，并同时覆盖 import、export 与 lazy import 组合。
- lazy import 必须先判断 TS/ETS AST 层还是 JS code 层；namespace、type-only、JSON 和 re-export 需分别验证。
- 修改 transformer 后必须检查 `ModuleSourceFile` 中实际保存的源码/AST，而不能只检查 Rollup 返回值。
- lazy import 异常按 TS/ETS 接入点 → JS 接入点 → re-export/filter 排查；shared module 按 validate → collect → set → filesInfo shared 字段排查。

## 修改前检查

- [ ] 当前节点仍有 TypeChecker/EmitResolver 可用吗？
- [ ] transformer 顺序是否保持 UI → path expand → kit/lazy？
- [ ] type-only、namespace、JSON、系统 API、`.so`、HAR/HSP external 是否应跳过？
- [ ] import 与 export、TS/ETS 与 JS、成功与诊断分支是否都有测试？

## 代码和测试

- 代码：`src/process_ui_syntax.ts`、`src/process_sendable.ts`、`src/import_path_expand.ts`、`src/process_kit_import.ts`、`src/process_lazy_import.ts`
- shared：`src/fast_build/ark_compiler/check_shared_module.ts`
- 测试：`test/ark_compiler_ut/common/process_sendable.test.ts`、`test/ark_compiler_ut/common/check_shared_module.test.ts`、`test/ark_compiler_ut/common/import_path_expand.test.ts`、`test/ark_compiler_ut/common/process_kit_import.test.ts`、`test/ark_compiler_ut/common/process_lazy_import.test.ts`；至少覆盖正向、跳过、诊断和组合场景
