const { throws, deepEqual } = require('assert');

const mod = require('./main');

describe('OLSKRollupScaffoldDefaultConfiguration', function test_OLSKRollupScaffoldDefaultConfiguration() {

	it('throws error if not object', function() {
		throws(function() {
			mod.OLSKRollupScaffoldDefaultConfiguration(null);
		}, /OLSKErrorInputNotValid/);
	});

	it('throws error if OLSKRollupStartDirectory not string', function() {
		throws(function() {
			mod.OLSKRollupScaffoldDefaultConfiguration({
				OLSKRollupStartDirectory: null,
			});
		}, /OLSKErrorInputNotValid/);
	});

	it('returns object', function() {
		deepEqual(mod.OLSKRollupScaffoldDefaultConfiguration({
			OLSKRollupStartDirectory: 'alfa/bravo',
		}), {
			input: 'alfa/bravo/rollup-start.js',
			output: {
				sourcemap: true,
				format: 'iife',
				name: 'Main',
				file: 'alfa/bravo/__compiled/ui-behaviour.js',
			},
			onwarn: mod._OLSKRollupScaffoldDefaultConfigurationWarnHandler,
		});
	});

	it('returns object', function() {
		deepEqual(mod.OLSKRollupScaffoldDefaultConfiguration({
			OLSKRollupStartDirectory: 'alfa/XYZBravo',
		}).output.name, 'XYZBravo');
	});

});
