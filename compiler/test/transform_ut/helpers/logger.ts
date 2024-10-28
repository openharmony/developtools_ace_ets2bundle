/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Logger {
	private prefix: string;
	private errorMsgs: string[] = [];
	private warnMsgs: string[] = [];
	private infoMsgs: string[] = [];
	static instances = [];

	constructor(prefix: string) {
		this.prefix = prefix;
	}

	public getErrorMsgs(): string[] {
		return this.errorMsgs;
	}

	public getWarnMsgs(): string[] {
		return this.warnMsgs;
	}

	public getInfoMsgs(): string[] {
		return this.infoMsgs;
	}

	public debug(msg: string) {
		console.debug(msg);
	}

	public error(msg: string) {
		this.errorMsgs.push(msg);
	}

	public warn(msg: string) {
		this.warnMsgs.push(msg);
	}

	public info(msg: string) {
		this.infoMsgs.push(msg);
	}

	public getPrefix() {
		return this.prefix;
	}

	public static getLogger(prefix: string): Logger {
		for (const instance of Logger.instances) {
			if (instance.getPrefix() == prefix) {
				return instance;
			}
		}
	}

	public static createLogger(prefix: string): Logger {
		const logger = new Logger(prefix);
		Logger.instances.push(logger);
		return logger;
	}

	public static flush(): void {
		Logger.instances = [];
	}

	public static removeLogger(prefix: string): void {
		Logger.instances = Logger.instances.filter(
			(instance) => instance.getPrefix() !== prefix
		);
	}
}

export {
	Logger
}