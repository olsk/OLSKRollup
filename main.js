require('OLSKEnv').OLSKEnvGuard();

const mod = {

	_ValueProduction: !process.env.ROLLUP_WATCH,

	OLSKRollupScaffoldSvelteConfig (inputData) {
		return {
			// enable run-time checks when not in production
			dev: !mod._ValueProduction,

			// CSS PREPROCESSING
			preprocess: require('svelte-preprocess')({ /* options */ }),

			// CSS SEPERATE FILE
			css: function (css) {
				return css.write('ui-style.css');
			},
		};
	},

	OLSKRollupScaffoldDefaultPluginsSvelte (inputData) {
		return [
			// LOCALIZE
			require('OLSKRollupPluginLocalize')({
				baseDirectory: inputData._OLSKRollupScanDirectory,
			}),

			// SWAP
			inputData.OLSKRollupPluginSwapTokens && require('OLSKRollupPluginSwap')({
				OLSKRollupPluginSwapTokens: inputData.OLSKRollupPluginSwapTokens,
			}),

			// SVG
			require('rollup-plugin-svg-import')({ stringify: true }),

			// SVELTE
			require('rollup-plugin-svelte')(mod.OLSKRollupScaffoldSvelteConfig(inputData)),

			// NPM MODULES
			require('rollup-plugin-node-resolve')({
				browser: true
			}),
			require('rollup-plugin-commonjs')(),

			// MINIFY
			mod._ValueProduction && require('rollup-plugin-terser').terser(),
		];
	},

	_OLSKRollupScaffoldDefaultConfigurationWarnHandler (warning, handler) {
		if (warning.pluginCode === 'a11y-missing-attribute' && warning.frame.includes('role="presentation"')) {
			return;
		}
		
		if (['a11y-accesskey', 'a11y-autofocus'].includes(warning.pluginCode)) return;

		handler(warning);
	},

	OLSKRollupScaffoldDefaultConfiguration (inputData) {
		if (typeof inputData !== 'object' || inputData === null) {
			throw new Error('OLSKErrorInputNotValid');
		}

		if (typeof inputData.OLSKRollupStartDirectory !== 'string') {
			throw new Error('OLSKErrorInputNotValid');
		}

		let name = require('path').basename(inputData.OLSKRollupStartDirectory);

		if (name.slice(0, 3).match(/[^A-Z]/)) {
			name = 'Main';
		}
		
		return {
			input: require('path').join(inputData.OLSKRollupStartDirectory, 'rollup-start.js'),
			output: {
				sourcemap: true,
				format: 'iife',
				name,
				file: require('path').join(inputData.OLSKRollupStartDirectory, '__compiled/ui-behaviour.js'),
			},
			onwarn: mod._OLSKRollupScaffoldDefaultConfigurationWarnHandler,
		};
	},

	OLSKRollupScaffoldScanStart (param1, param2 = {}) {
		return require('glob').sync('**/rollup-start.js', {
			cwd: param1,
			realpath: true,
		}).filter(function (e) {
			if (mod._ValueProduction && !process.env.OLSK_ROLLUP_SCAFFOLD_CI && require('glob').sync('stub-*', { cwd: require('path').dirname(e) }).length && (!param2.OLSKRollupScanIncludeStubs || !param2.OLSKRollupScanIncludeStubs.includes(e)) ) {
				return false;
			}

			return !e.match(/node_modules|__external/);
		}).map(function (e, i) {
			const options = Object.assign(Object.assign({}, param2), {
				_OLSKRollupScanDirectory: param1,
				OLSKRollupStartDirectory: require('path').dirname(e),
			});

			let defaultConfiguration = Object.assign(mod.OLSKRollupScaffoldDefaultConfiguration(options), {
				plugins: mod.OLSKRollupScaffoldDefaultPluginsSvelte(options),
			});

			if (!require('fs').existsSync(require('path').join(options.OLSKRollupStartDirectory, 'rollup-config-custom.js'))) {
				return defaultConfiguration;
			}

			return require(require('path').join(options.OLSKRollupStartDirectory, 'rollup-config-custom.js')).OLSKRollupConfigCustom(defaultConfiguration, options);
		});
	},

};

Object.assign(exports, mod);
