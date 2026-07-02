# Specify Gate

> 结论：Approved。规格已将一期范围收敛为 Interop range/original-node 适配，并明确不新增独立 sourcemap 产物。

## 检查表

| 检查项 | 结果 | 证据 |
|--------|------|------|
| 用户故事已记录 | 通过 | `spec.md` US-1 至 US-3 |
| 验收标准可验证 | 通过 | `spec.md` AC-001 至 AC-005 均有验证方式 |
| 范围和非范围清晰 | 通过 | `spec.md` 范围基线、非功能要求 |
| 现有能力复用明确 | 通过 | 使用 `range/startPosition/endPosition/originalPeer` 和 `setNoDebugLineFlag()` |
| 降级行为明确 | 通过 | AC-004 |
| 跨模块边界明确 | 通过 | 不改 `compiler/`，不改插件顺序 |

## 待实现确认

- 最终测试 fixture 已选新增专用 `range-mapping.ets`，避免继续沿用 debugLine 口径。
- 如调试器后续要求独立 sourcemap 文件，需另起扩展范围。
