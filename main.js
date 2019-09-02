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
			return css.write(pathPackage.join(pathPackage.dirname(inputData), '__compiled/ui-style.css'));
		},
	};
};

const svelte = require('rollup-plugin-svelte');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const i18n = require('olsk-rollup-plugin-localize');
const livereload = require('rollup-plugin-livereload');
const { terser } = require('rollup-plugin-terser');
exports.OLSKRollupDefaultPluginsSvelte = function (inputData, options = {
	OLSKRollupPluginLivereloadPort: 5000,
}) {
	return [
		// SVELTE
		svelte(exports.OLSKRollupSvelteConfig(inputData)),

		// NPM MODULES
		resolve({
			browser: true
		}),
		commonjs(),

		// LOCALIZE
		i18n({
			baseDirectory: 'os-app',
		}),

		// LIVERELOAD
		!production && livereload({
			watch: pathPackage.join(pathPackage.dirname(inputData), '__compiled'),
			port: options.OLSKRollupPluginLivereloadPort,
		}),

		// MINIFY
		production && terser()
	];
};

exports.OLSKRollupDefaultConfiguration = function (param1, param2) {
	return {
		input: pathPackage.join(pathPackage.dirname(param1), 'rollup-start.js'),
		output: {
			sourcemap: true,
			format: 'iife',
			name: 'Main',
			file: pathPackage.join(pathPackage.dirname(param1), '__compiled/ui-behaviour.js'),
		},
		onwarn (warning, handler) {
			if (['a11y-accesskey', 'a11y-autofocus'].indexOf(warning.pluginCode) !== -1) return;

			handler(warning);
		},
		plugins: param2,
	};
};

exports.OLSKRollupScanStart = function (inputData) {
	return require('glob').sync('**/rollup-start.js', {
		cwd: inputData,		
	}).filter(function (e) {
		return !e.match(/node_modules|__external/);
	}).map(function (e, i) {
		let outputFunction = function (inputData) {
			return inputData;
		};

		try {
			outputFunction = require(pathPackage.join(inputData, pathPackage.dirname(e), 'rollup-config-custom.js')).OLSKRollupConfigCustomFor;
		} catch(e) {
			if (!e.message.match(/Cannot find module .*rollup-config-custom\.js/)) {
				throw e;
			}
		}

		return outputFunction(exports.OLSKRollupDefaultConfiguration(e, exports.OLSKRollupDefaultPluginsSvelte(e, {
			OLSKRollupPluginLivereloadPort: 5000 + i,
		})));
	});
};
