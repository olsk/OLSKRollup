const { throws, deepEqual } = require('assert');

const mainModule = require('./main');

describe('OLSKRollupDefaultConfiguration', function testOLSKRollupDefaultConfiguration() {

	it('throws error if not object', function() {
		throws(function() {
			mainModule.OLSKRollupDefaultConfiguration(null);
		}, /OLSKErrorInputNotValid/);
	});

	it('throws error if OLSKRollupStartDirectory not string', function() {
		throws(function() {
			mainModule.OLSKRollupDefaultConfiguration({
				OLSKRollupStartDirectory: null,
			});
		}, /OLSKErrorInputNotValid/);
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
			onwarn: mainModule._OLSKRollupScaffoldDefaultConfigurationWarnHandler,
		});
	});

	it('returns object', function() {
		deepEqual(mainModule.OLSKRollupDefaultConfiguration({
			OLSKRollupStartDirectory: 'alfa/XYZBravo',
		}).output.name, 'XYZBravo');
	});

});
