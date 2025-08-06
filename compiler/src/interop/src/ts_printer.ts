import * as ts from "typescript";

export function printOriginNode(originNode: ts.Node | null) {
  if (!originNode) {
    console.log("originNode 为 null（未找到定义）");
    return;
  }
  const sourceFile = originNode.getSourceFile(); // 获取节点所在的源文件
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const nodeCode = printer.printNode(ts.EmitHint.Unspecified, originNode, sourceFile);
  console.log("=== originNode 对应的代码 ===");
  console.log(nodeCode);
}

