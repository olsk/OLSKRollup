const pathPackage = require('path');

const production = !process.env.ROLLUP_WATCH;

const autoPreprocess = require('svelte-preprocess');
exports.OLSKRollupSvelteConfig = function (inputData) {
	return {
		// enable run-time checks when not in production
		dev: !production,

		// CSS PREPROCESSING
		preprocess: autoPreprocess({ /* options */ }),

		// CSS SEPERATE FILE
		css: function (css) {
			return css.write(pathPackage.join(inputData.OLSKRollupStartDirectory, '__compiled/ui-style.css'));
		},
	};
};

const i18n = require('OLSKRollupPluginLocalize');
const swap = require('OLSKRollupPluginSwap');
const svelte = require('rollup-plugin-svelte');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const livereload = require('rollup-plugin-livereload');
const { terser } = require('rollup-plugin-terser');
exports.OLSKRollupDefaultPluginsSvelte = function (inputData) {
	return [
		// LOCALIZE
		i18n({
			baseDirectory: inputData._OLSKRollupScanDirectory,
		}),

		// SWAP
		inputData.OLSKRollupPluginSwapTokens && swap({
			OLSKRollupPluginSwapTokens: inputData.OLSKRollupPluginSwapTokens,
		}),

		// SVELTE
		svelte(exports.OLSKRollupSvelteConfig(inputData)),

		// NPM MODULES
		resolve({
			browser: true
		}),
		commonjs(),

		// LIVERELOAD
		!production && livereload({
			watch: pathPackage.join(inputData.OLSKRollupStartDirectory, '__compiled'),
			port: inputData.OLSKRollupPluginLivereloadPort,
		}),

		// MINIFY
		production && terser()
	];
};

exports._OLSKRollupDefaultConfigurationWarnHandler = function (warning, handler) {
	if (['a11y-accesskey', 'a11y-autofocus'].indexOf(warning.pluginCode) !== -1) return;

	handler(warning);
};

exports.OLSKRollupDefaultConfiguration = function (inputData) {
	if (typeof inputData !== 'object' || inputData === null) {
		throw new Error('OLSKErrorInputNotValid');
	}

	if (typeof inputData.OLSKRollupStartDirectory !== 'string') {
		throw new Error('OLSKErrorInputNotValid');
	};

	let name = require('path').basename(inputData.OLSKRollupStartDirectory);

	if (name.slice(0, 3).match(/[^A-Z]/)) {
		name = 'Main';
	};
	
	return {
		input: require('path').join(inputData.OLSKRollupStartDirectory, 'rollup-start.js'),
		output: {
			sourcemap: true,
			format: 'iife',
			name,
			file: require('path').join(inputData.OLSKRollupStartDirectory, '__compiled/ui-behaviour.js'),
		},
		onwarn: exports._OLSKRollupDefaultConfigurationWarnHandler,
	};
};

exports.OLSKRollupScanStart = function (param1, param2 = {}) {
	return require('glob').sync('**/rollup-start.js', {
		cwd: param1,
		realpath: true,
	}).filter(function (e) {
		if (production && require('glob').sync('stub-*', { cwd: pathPackage.dirname(e) }).length && (!param2.OLSKRollupScanIncludeStubs || !param2.OLSKRollupScanIncludeStubs.includes(e)) ) {
			return false;
		};

		return !e.match(/node_modules|__external/);
	}).map(function (e, i) {
		const options = Object.assign(Object.assign({}, param2), {
			_OLSKRollupScanDirectory: param1,
			OLSKRollupStartDirectory: pathPackage.dirname(e),
			OLSKRollupPluginLivereloadPort: parseInt(process.env.OLSK_ROLLUP_PLUGIN_LIVERELOAD_PORT || 5000) + i,
		});

		let defaultConfiguration = Object.assign(exports.OLSKRollupDefaultConfiguration(options), {
			plugins: exports.OLSKRollupDefaultPluginsSvelte(options),
		});

		if (!require('fs').existsSync(pathPackage.join(options.OLSKRollupStartDirectory, 'rollup-config-custom.js'))) {
			return defaultConfiguration;
		};

		return require(pathPackage.join(options.OLSKRollupStartDirectory, 'rollup-config-custom.js')).OLSKRollupConfigCustom(defaultConfiguration, options);
	});
};
