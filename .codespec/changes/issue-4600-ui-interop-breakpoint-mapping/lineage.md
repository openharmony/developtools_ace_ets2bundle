# Lineage

| 字段 | 值 |
|------|----|
| Lineage | new-on-legacy |
| Target Release | TBD |
| Source | Owner requirement + existing ArkUI static toolchain Interop transform chain |
| Source Issue | https://gitcode.com/openharmony/developtools_ace_ets2bundle/issues/4600 |
| Original Docs | REQ-015 SDD progress records and local CodeSpec draft |
| Source Code Evidence | `arkui-plugins/interop-plugins/decl_transformer.ts`, `arkui-plugins/ui-plugins/interop/*`, `koala-wrapper/src/arkts-api/peers/AstNode.ts` |
| Compatibility Boundary | 不改变公共 API、不改变插件顺序、不改变 UI 运行时语义、不修改 debugLine 注入机制 |
| Migration Status | renamed to `.codespec/changes/issue-4600-ui-interop-breakpoint-mapping` on 2026-07-02; linked to GitCode issue #4600 |
| Supersedes | initial local draft before GitCode issue binding |
| Superseded By | — |
