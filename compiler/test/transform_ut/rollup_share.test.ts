import path from 'path';
import mocha from 'mocha';
import { expect } from 'chai';
import { RollUpPluginMock } from './helpers/mockRollupContext';

const PROJECT_ROOT = path.resolve(__dirname, '../../test/transform_ut');
const DEFAULT_PROJECT: string = 'application';

mocha.describe('test rollup mock', function () {
	mocha.before(function () {
		this.rollup = new RollUpPluginMock();
	});

	mocha.after(() => {
		delete this.rollup;
	});

	mocha.it('1-1: test rollup projectConfig', function () {
		this.rollup.preview(PROJECT_ROOT, DEFAULT_PROJECT);

		expect(this.rollup.share.projectConfig !== null).to.be.true;
	});
});