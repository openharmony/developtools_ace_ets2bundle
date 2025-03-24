const fs = require('fs');
const path = require('path');

// 获取当前目录
const currentDirectory = process.cwd();
let workSpace = currentDirectory;
for (let i = 0; i < 4; i++) {
  workSpace = path.dirname(workSpace);
}
// JSON 文件路径
const jsonFilePath = path.join(__dirname, 'arktsconfig_template.json');
const outJsonFilePath = path.join(__dirname, 'dist/cache/arktsconfig.json');

try {
    // 读取 JSON 文件内容
    const data = fs.readFileSync(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(data);

    // 处理 baseUrl 字段
    if (jsonData.compilerOptions.baseUrl) {
        jsonData.compilerOptions.baseUrl = jsonData.compilerOptions.baseUrl.replace(/workspace/g, workSpace);
    }

    // 处理 Paths 字段
    if (jsonData.compilerOptions.paths) {
        for (const key in jsonData.compilerOptions.paths) {
            const values = jsonData.compilerOptions.paths[key];
            for (let i = 0; i < values.length; i++) {
              if (key.startsWith('@ohos.arkui.')) {
                values[i] = currentDirectory + "/dist/cache/" + key;
              } else {
                values[i] = values[i].replace(/workspace/g, workSpace);
              }
            }
        }
    }

    // 将修改后的内容写回 JSON 文件
    fs.writeFileSync(outJsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
} catch (error) {
    console.error('处理 JSON 文件时出错:', error);
}