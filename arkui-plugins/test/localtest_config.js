const fs = require('fs');
const path = require('path');

// 获取当前目录
const currentDirectory = process.cwd();
let workSpace = currentDirectory;
for (let i = 0; i < 4; i++) {
  workSpace = path.dirname(workSpace);
}
// JSON 文件路径
const jsonFilePath = path.join(__dirname, 'demo/localtest/build_config_template.json');
const outJsonFilePath = path.join(__dirname, 'demo/localtest/build_config.json');

try {
    // 读取 JSON 文件内容
    const data = fs.readFileSync(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(data);
    console.log(jsonData)
    // 处理 baseUrl 字段
    if (jsonData.buildSdkPath) {
        jsonData.buildSdkPath = jsonData.buildSdkPath.replace(/workspace/g, workSpace);
    }

    // 处理 plugins 字段
    if (jsonData.plugins.ui_plugin) {
      jsonData.plugins.ui_plugin = jsonData.plugins.ui_plugin.replace(/workspace/g, workSpace);
    }
    if (jsonData.plugins.memo_plugin) {
      jsonData.plugins.memo_plugin = jsonData.plugins.memo_plugin.replace(/workspace/g, workSpace);
    }

    // 将修改后的内容写回 JSON 文件
    fs.writeFileSync(outJsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
} catch (error) {
    console.error('处理 JSON 文件时出错:', error);
}