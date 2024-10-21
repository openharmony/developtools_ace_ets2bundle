import path from 'path';
import fs from 'fs';
import mocha from 'mocha';
import sinon from 'sinon';
import { expect } from 'chai';

import {
  BUILD_ON
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
  storedFileInfo
} from '../../lib/utils';
import {
	partialUpdateConfig, 
	projectConfig, 
	resources 
} from '../../main';
import { 
	etsChecker 
} from '../../lib/fast_build/ets_ui/rollup-plugin-ets-checker';
import { 
	etsTransform 
} from '../../lib/fast_build/ets_ui/rollup-plugin-ets-typescript';
import { 
	RollUpPluginMock 
} from './helpers/mockRollupContext';
import { 
	PartialUpdateConfig, 
	ProjectConfig 
} from './helpers/projectConfig';
import { 
	CACHE_PATH,
	UT_PARTIAL_UPFATE_PAGES
} from './helpers/pathConfig';
import { 
	parseCode, 
	sourceReplace 
} from './helpers/parser';

const PROJECT_ROOT: string = path.resolve(__dirname, '../../test/transform_ut');
const DEFAULT_PROJECT: string = 'application';
const TEST_CASES_PATH: string = path.resolve(PROJECT_ROOT, DEFAULT_PROJECT, 'entry/src/main/ets/pages');
const OUTPUTS_PATH: string = path.resolve(PROJECT_ROOT, DEFAULT_PROJECT, 'entry/build', CACHE_PATH, 'entry/src/main/ets/pages');

mocha.describe('test UT for partial update testcases [non-preview mode]', function () {
	this.timeout(7500);

	mocha.before(function () {
		this.rollup = new RollUpPluginMock();
		this.rollup.build(PROJECT_ROOT, DEFAULT_PROJECT);

		this.globalProjectConfig = new ProjectConfig();
		this.globalProjectConfig.setPreview(false);
		this.globalProjectConfig.setIgnoreWarning(true);
		this.globalProjectConfig.scan(PROJECT_ROOT, DEFAULT_PROJECT);
		this.globalProjectConfig.mockCompileContextInfo(`${PROJECT_ROOT}/${DEFAULT_PROJECT}`);
		this.globalProjectConfig.concat(RollUpPluginMock.mockArkProjectConfig(PROJECT_ROOT, DEFAULT_PROJECT, true));

		this.rollup.share.projectConfig.concat(this.globalProjectConfig);
		Object.assign(projectConfig, this.globalProjectConfig);

		this.globalPartialUpdateConfig = new PartialUpdateConfig();
		this.globalPartialUpdateConfig.setPartialUpdateMode(true);
		this.globalPartialUpdateConfig.mockDisableArkTSLinter();

		Object.assign(partialUpdateConfig, this.globalPartialUpdateConfig);

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
	});

	UT_PARTIAL_UPFATE_PAGES.forEach((utPage, index) => {
		mocha.it(`1-${index + 1}: test ${utPage}`, function (done) {
			const sourceFilePath: string = path.resolve(TEST_CASES_PATH, `utForPartialUpdate/${utPage}.ets`);
			const sourceCode: string = fs.readFileSync(sourceFilePath, 'utf-8');
			
			const targetFilePath: string = path.resolve(OUTPUTS_PATH, `utForPartialUpdate/${utPage}.js`);
			const targetCode: string = fs.readFileSync(targetFilePath, 'utf-8');

			storedFileInfo.addFileCacheInfo(sourceFilePath);

			const transform = this.etsTransformPlugin.transform.bind(this.rollup);

			// expect(sourceCode !== null).to.be.true;
			// done();

			transform(sourceReplace(sourceCode), sourceFilePath)
				.then(res => {
					console.error(`1-${index}: result: `, res.code);
	
					expect(parseCode(res.code)).eql(parseCode(targetCode));
					// expect(res !== null).to.be.true;
					done();
				})
				.catch(err => done(err));
		});
	});
});
