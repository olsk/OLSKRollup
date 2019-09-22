import { throws, deepEqual } from 'assert';

const mainModule = require('./main');

describe('OLSKRollupDefaultConfiguration', function testOLSKRollupDefaultConfiguration() {

	it('throws error if not object', function() {
		throws(function() {
			mainModule.OLSKRollupDefaultConfiguration(null);
		}, /OLSKErrorInputInvalid/);
	});

	it('throws error if OLSKRollupStartDirectory not string', function() {
		throws(function() {
			mainModule.OLSKRollupDefaultConfiguration({
				OLSKRollupStartDirectory: null,
			});
		}, /OLSKErrorInputInvalid/);
	});

	it('returns object', function() {
		deepEqual(mainModule.OLSKRollupDefaultConfiguration({
			OLSKRollupStartDirectory: 'alfa/bravo',
		}), {
			input: 'alfa/bravo/rollup-start.js',
			output: {
				sourcemap: true,
				format: 'iife',
				name: 'Main',
				file: 'alfa/bravo/__compiled/ui-behaviour.js',
			},
			onwarn: mainModule._OLSKRollupDefaultConfigurationWarnHandler,
		});
	});

	it('returns object', function() {
		deepEqual(mainModule.OLSKRollupDefaultConfiguration({
			OLSKRollupStartDirectory: 'alfa/XYZBravo',
		}).output.name, 'XYZBravo');
	});

});
