import path from 'path';
import mocha from 'mocha';
import { expect } from 'chai';
import { RollUpPluginMock } from './helpers/mockRollupContext';
import { ProjectConfig } from './helpers/projectConfig';

const PROJECT_ROOT = path.resolve(__dirname, '../../test/transform_ut');
const DEFAULT_PROJECT: string = 'application';

mocha.describe('test rollup', function () {
	mocha.before(function () {
		this.rollup = new RollUpPluginMock();
	});

	mocha.after(() => {
		delete this.rollup;
	});

	mocha.it('1-1: test rollup projectConfig', function () {
		// const projectConfig = new ProjectConfig();
		// projectConfig.setPreview(true);
		// projectConfig.scan(PROJECT_ROOT, DEFAULT_PROJECT);
		// projectConfig.mockCompileContextInfo(`${PROJECT_ROOT}/${DEFAULT_PROJECT}`);
		// projectConfig.concat(RollUpPluginMock.mockArkProjectConfig(PROJECT_ROOT, DEFAULT_PROJECT, true));

		// console.error('1-1: ', projectConfig);
		// expect(projectConfig !== null).to.be.true;

		// this.rollup.build(PROJECT_ROOT, DEFAULT_PROJECT);
		this.rollup.preview(PROJECT_ROOT, DEFAULT_PROJECT);

		// console.error('1-1: ', this.rollup.share.projectConfig);
		expect(this.rollup.share.projectConfig !== null).to.be.true;
	});
});