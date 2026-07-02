# 实施计划

## 当前阶段

Release Ready。Define、Specify、Design、Plan 和 Implement 验证已完成，当前进入 Release Ready。

## 任务列表

| 任务 | 内容 | 产出 | 关联 AC |
|------|------|------|---------|
| TASK-001 | 阅读 `decl_transformer.ts`、`factory.ts`、相关测试工具，确认 Interop 节点到源节点的最小继承集合 | 节点映射清单 | AC-001, AC-002 |
| TASK-002 | 在 `DeclTransformer.processComponent()` 中为生成 class/class definition 继承源 struct/definition range 和 original-node | 源码修改 | AC-001 |
| TASK-003 | 在 `DeclTransformer.transformMethodDefinition()` 中为更新后的 build method/function/function expression/empty block 继承源 build range 和 original-node | 源码修改 | AC-002 |
| TASK-004 | 在 Interop checked 生成路径中区分主替换节点和辅助节点；主节点继承 range/originalPeer，辅助节点设置 no-debug-line | 源码修改 | AC-003, AC-004 |
| TASK-005 | 新增或扩展 Interop range-mapping 测试，断言转换后关键节点回溯转换前节点 | 测试用例 | AC-001, AC-002, AC-003 |
| TASK-006 | 运行 `npm run compile`、`npm run test` 和必要的定向 jest；记录结果 | 验证记录 | AC-004, AC-005 |
| TASK-007 | 更新 pilot `REQ-015.md` 进展 | 试点进展 | 流程闭环 |

## 实现顺序

1. 先实现 Interop range/original-node 继承，确保转换源头不丢信息。
2. 再处理一源多辅助节点 no-debug-line 标记，避免单步重复停留。
3. 最后补测试和验证，避免先改快照掩盖源码问题。

## 验证命令

```bash
cd /data/home/l00580606/workspace/sdd/0618_REQ13/openHarmony/developtools/ace_ets2bundle/arkui-plugins
npm run compile
npm run test
```

Pilot 文档校验：

```bash
cd /data/home/l00580606/workspace/sdd/0618_REQ13/sdd-pilot
./scripts/validate.sh arkui
git diff --check
```

## 退出条件

- Interop 生成/更新的关键节点保留转换前 range/original-node。
- 一源多辅助生成节点设置 no-debug-line，且不误标主替换节点。
- 非 Interop range 行为不回归。
- `arkui-plugins` 编译和测试通过，或记录明确的环境阻塞。
- Pilot 进展文件同步到 `REQ-015.md`；如允许改动试点主表，再同步 `requirements.md`、`README.md`。
