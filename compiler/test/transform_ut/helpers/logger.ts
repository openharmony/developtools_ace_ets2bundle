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