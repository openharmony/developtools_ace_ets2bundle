import path from "path";
import fs from "fs";

export function scanFiles(filepath: string, fileList: Set<string>) {
	if (!fs.existsSync(filepath)) {
		return;
	}
	const files = fs.readdirSync(filepath);
	files.forEach((file) => {
		const child = path.join(filepath, file);
		const stat = fs.statSync(child);
		if (stat.isDirectory()) {
			scanFiles(child, fileList);
		} else {
			if (child.includes("mock")) {
				return;
			}
			fileList.add(child);
		}
	});
}