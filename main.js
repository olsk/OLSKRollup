import pathPackage from 'path';

const production = !process.env.ROLLUP_WATCH;

import autoPreprocess from 'svelte-preprocess';
export const OLSKRollupSvelteConfig = function (inputData) {
	return {
		// enable run-time checks when not in production
		dev: !production,

		// CSS PREPROCESSING
		preprocess: autoPreprocess({ /* options */ }),

		// CSS SEPERATE FILE
		css: function (css) {
			return css.write(pathPackage.join(pathPackage.dirname(inputData), '__compiled/ui-style.css'));
		},
	}
}

import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import i18n from 'olsk-rollup-i18n';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
export const OLSKRollupDefaultPluginsSvelte = function (inputData, options = {
	OLSKRollupPluginLivereloadPort: 5000,
}) {
	return [
		// SVELTE
		svelte(OLSKRollupSvelteConfig(inputData)),

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
	]
}

export const OLSKRollupDefaultConfiguration = function (param1, param2) {
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
}

export const OLSKRollupScanStart = function (inputData) {
	return require('glob').sync('os-app/**/rollup-start.js', {
		cwd: inputData,		
	}).filter(function (e) {
		return !e.match(/node_modules|__external/);
	}).map(function (e, i) {
		let outputFunction = function (inputData) {
			return inputData;
		};

		try {
			outputFunction = require(pathPackage.join(__dirname, pathPackage.dirname(e), 'rollup-config-custom.js')).OLSKRollupConfigCustomFor;
		} catch(e) {
			if (!e.message.match(/Cannot find module .*rollup-config-custom\.js/)) {
				throw e;
			}
		}

		return outputFunction(OLSKRollupDefaultConfiguration(e, OLSKRollupDefaultPluginsSvelte(e, {
			OLSKRollupPluginLivereloadPort: 5000 + i,
		})));
	})
}
