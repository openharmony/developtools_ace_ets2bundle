import path from 'path';
import fs from 'fs';
import mocha from 'mocha';
import sinon from 'sinon';
import { expect } from 'chai';

import {
	BUILD_ON,
} from '../../lib/pre_define';
import {
	resetComponentCollection,
	componentCollection
} from '../../lib/validate_ui_syntax';
import { 
	transformLog 
} from '../../lib/process_ui_syntax';
import {
	componentInfo,
	resetUtils,
	storedFileInfo
} from '../../lib/utils';
import main, {
	partialUpdateConfig, 
	projectConfig, 
	resetGlobalProgram, 
	resetMain, 
	resources, 
	sdkConfigs,
	systemModules
} from '../../main';
import { 
	etsChecker 
} from '../../lib/fast_build/ets_ui/rollup-plugin-ets-checker';
import { 
	etsTransform 
} from '../../lib/fast_build/ets_ui/rollup-plugin-ets-typescript';
import processStructComponentV2 from '../../lib/process_struct_componentV2';
import { 
	RollUpPluginMock 
} from './helpers/mockRollupContext';
import { 
	PartialUpdateConfig, 
	ProjectConfig 
} from './helpers/projectConfig';
import { 
	UT_VALIDATE_PAGES
} from './helpers/pathConfig';
import { 
	parseFileNameFromPath, 
	parseLog, 
	processExecInStr, 
	sourceReplace 
} from './helpers/parser';
import { 
	scanFileNames
} from './helpers/utils';

const PROJECT_ROOT: string = path.resolve(__dirname, '../../test/transform_ut');
const DEFAULT_PROJECT: string = 'application';
const TEST_CASES_PATH: string = path.resolve(PROJECT_ROOT, DEFAULT_PROJECT, 'entry/src/main/ets/pages');
const SYS_CONFIG_PATH: string = path.resolve(PROJECT_ROOT, DEFAULT_PROJECT, 'entry/src/main/ets/test/common');
const ERROR_COLLECTION_PATH: string = path.resolve(__dirname, '../../test/error.json');
const MAIN_PAGES: string[] = UT_VALIDATE_PAGES.map((p) => `pages/utForValidate/${p}`);

const systemModuleSet: Set<string> = new Set();
scanFileNames(SYS_CONFIG_PATH, systemModuleSet);

mocha.describe('test UT for validate testcases [non-preview mode]', function () {
  	this.timeout(10000);

	mocha.before(function () {
		resetUtils();
		resetGlobalProgram();
		resetMain();
		this.rollup = new RollUpPluginMock();
		this.rollup.build(PROJECT_ROOT, DEFAULT_PROJECT, MAIN_PAGES);

		// enable logger for etsTransform roll-up plugin
		this.rollup.share.flushLogger();
		this.rollup.share.setEnableLogger(true);
		this.rollup.share.setAllowedLoggerPrefix(['etsTransform']);

		this.globalProjectConfig = new ProjectConfig();
		this.globalProjectConfig.setPreview(false);
		this.globalProjectConfig.setIgnoreWarning(true);
		this.globalProjectConfig.scan(PROJECT_ROOT, DEFAULT_PROJECT, MAIN_PAGES);
		this.globalProjectConfig.mockCompileContextInfo(`${PROJECT_ROOT}/${DEFAULT_PROJECT}`, MAIN_PAGES);
		this.globalProjectConfig.mockCompileContextInfo(`${PROJECT_ROOT}/${DEFAULT_PROJECT}`, MAIN_PAGES);

		this.rollup.share.projectConfig.concat(this.globalProjectConfig);
		Object.assign(projectConfig, this.globalProjectConfig);

		this.globalPartialUpdateConfig = new PartialUpdateConfig();
		this.globalPartialUpdateConfig.setPartialUpdateMode(true);
		this.globalPartialUpdateConfig.mockDisableArkTSLinter();
		Object.assign(partialUpdateConfig, this.globalPartialUpdateConfig);

		Object.assign(main, { 
			sdkConfigs: [
				...sdkConfigs
					.filter((sdkConfig) => !sdkConfig['apiPath'].includes(SYS_CONFIG_PATH))
					.map((sdkConfig) => {
						sdkConfig['apiPath'].push(SYS_CONFIG_PATH);
						return sdkConfig;
					}
				),
			],
			systemModules: [...systemModules, ...systemModuleSet]
		});

		this.etsCheckerPlugin = etsChecker();
		this.etsTransformPlugin = etsTransform();

		// disable writing to local files
		sinon.stub(fs, 'writeSync');

		// run etsChecker once
		const buildStart = this.etsCheckerPlugin.buildStart.bind(this.rollup);
		buildStart();
	});

	mocha.after(() => {
		this.rollup?.share?.flushLogger();
		delete this.rollup;
		delete this.globalProjectConfig;
		delete this.globalPartialUpdateConfig;
		delete this.etsCheckerPlugin;
		delete this.etsTransformPlugin;

		resetUtils();
		resetGlobalProgram();
		resetMain();
		sinon.restore();
	});

	mocha.beforeEach(function () {
		resources.app["media"] = {icon:16777222};
		resources.app["font"] = {song:16777223};

		process.env.rawFileResource = './';
		process.env.compileMode = 'moduleJson';
		process.env.compiler = BUILD_ON;
		process.env.compileTool = 'rollup';

		transformLog.errors = [];
		componentInfo.id = 0;
		componentCollection.customComponents.clear();
		resetComponentCollection();
		storedFileInfo.setCurrentArkTsFile();

		// disable ignoreWarning to get log info
		Object.assign(projectConfig, { ignoreWarning: false });
	});

	mocha.afterEach(function () {
		this.rollup?.share?.flushLogger();
		processStructComponentV2.resetStructMapInEts();
	});

	UT_VALIDATE_PAGES.forEach((utPage, index) => {
		mocha.it(`1-${index + 1}: test ${utPage}`, function (done) {
			const sourceFilePath: string = path.resolve(TEST_CASES_PATH, `utForValidate/${utPage}.ets`);
			const sourceCode: string = fs.readFileSync(sourceFilePath, 'utf-8');

			storedFileInfo.addFileCacheInfo(sourceFilePath);

			const transform = this.etsTransformPlugin.transform.bind(this.rollup);
			const errorCollection: object = JSON.parse(fs.readFileSync(ERROR_COLLECTION_PATH, 'utf-8'));
			const errorKey: string = parseFileNameFromPath(sourceFilePath);
			const errorVals: object = errorCollection[errorKey] ?? {};

			const expectResults: {
				message: string,
				type: "ERROR" | "WARN"
			}[] = Array.isArray(errorVals) ? errorVals : [errorVals];

			const expectErrorMsgs: string[] = expectResults
				.filter((e) => e.type === "ERROR").map((e) => processExecInStr(e.message.trim()));
			const expectWarnMsgs: string[] = expectResults
				.filter((e) => e.type === "WARN").map((e) => processExecInStr(e.message.trim()));

			transform(sourceReplace(sourceCode), sourceFilePath)
				.then(_ => {
					const logger = this.rollup.share.getLogger('etsTransform');
					const errorMsgs: string[] = logger.getErrorMsgs();
					const warnMsgs: string[] = logger.getWarnMsgs();
					const infoMsgs: string[] = logger.getInfoMsgs();

					// console.error(`1-${index}: errorMsgs: `, JSON.stringify(errorMsgs));
					// console.error(`1-${index}: expectErrorMsgs: `, JSON.stringify(expectErrorMsgs));

					// console.error(`1-${index}: errorMsgs.length: ${errorMsgs.length}, expectErrorMsgs.length: ${expectErrorMsgs.length}`);
					// console.error(`1-${index}: warnMsgs.length: ${warnMsgs.length}, expectWarnMsgs.length: ${expectWarnMsgs.length}`);

					expect(errorMsgs.length === expectErrorMsgs.length).to.be.true;
					expect(warnMsgs.length === expectWarnMsgs.length).to.be.true;

					// console.error(`1-${index}: errorMsgs: `, JSON.stringify(errorMsgs));
					// console.error(`1-${index}: warnMsgs: `, JSON.stringify(warnMsgs));
					// console.error(`1-${index}: infoMsgs: `, JSON.stringify(infoMsgs));

					errorMsgs.forEach((err) => {
						const logInfo: string = parseLog(err);
						
						// console.error(`1-${index}: logInfo: `, logInfo);
						// console.error(`1-${index}: expectErrorMsgs: `, JSON.stringify(expectErrorMsgs));
						expect(expectErrorMsgs.includes(logInfo)).to.be.true;
					});

					warnMsgs.forEach((err) => {
						const logInfo: string = parseLog(err);
						
						// console.error(`1-${index}: logInfo: `, logInfo);
						// console.error(`1-${index}: expectWarnMsgs: `, JSON.stringify(expectWarnMsgs));
						expect(expectWarnMsgs.includes(logInfo)).to.be.true;
					});

					done();
				})
				.catch(err => done(err));
		});
	});
});
