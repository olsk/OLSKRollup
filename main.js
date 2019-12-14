const mod = {

	_ValueProduction: !process.env.ROLLUP_WATCH,

	OLSKRollupSvelteConfig (inputData) {
		return {
			// enable run-time checks when not in production
			dev: !mod._ValueProduction,

			// CSS PREPROCESSING
			preprocess: require('svelte-preprocess')({ /* options */ }),

			// CSS SEPERATE FILE
			css: function (css) {
				return css.write(require('path').join(inputData.OLSKRollupStartDirectory, '__compiled/ui-style.css'));
			},
		};
	},

	OLSKRollupDefaultPluginsSvelte (inputData) {
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
			require('rollup-plugin-svelte')(exports.OLSKRollupSvelteConfig(inputData)),

			// NPM MODULES
			require('rollup-plugin-node-resolve')({
				browser: true
			}),
			require('rollup-plugin-commonjs')(),

			// LIVERELOAD
			!mod._ValueProduction && require('rollup-plugin-livereload')({
				watch: require('path').join(inputData.OLSKRollupStartDirectory, '__compiled'),
				port: inputData.OLSKRollupPluginLivereloadPort,
			}),

			// MINIFY
			mod._ValueProduction && require('rollup-plugin-terser').terser(),
		];
	},

	_OLSKRollupDefaultConfigurationWarnHandler (warning, handler) {
		if (warning.pluginCode === 'a11y-missing-attribute' && warning.frame.includes('role="presentation"')) {
			return;
		}
		
		if (['a11y-accesskey', 'a11y-autofocus'].indexOf(warning.pluginCode) !== -1) return;

		handler(warning);
	},

	OLSKRollupDefaultConfiguration (inputData) {
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
			onwarn: mod._OLSKRollupDefaultConfigurationWarnHandler,
		};
	},

	OLSKRollupScanStart (param1, param2 = {}) {
		return require('glob').sync('**/rollup-start.js', {
			cwd: param1,
			realpath: true,
		}).filter(function (e) {
			if (mod._ValueProduction && require('glob').sync('stub-*', { cwd: require('path').dirname(e) }).length && (!param2.OLSKRollupScanIncludeStubs || !param2.OLSKRollupScanIncludeStubs.includes(e)) ) {
				return false;
			};

			return !e.match(/node_modules|__external/);
		}).map(function (e, i) {
			const options = Object.assign(Object.assign({}, param2), {
				_OLSKRollupScanDirectory: param1,
				OLSKRollupStartDirectory: require('path').dirname(e),
				OLSKRollupPluginLivereloadPort: parseInt(process.env.OLSK_ROLLUP_PLUGIN_LIVERELOAD_PORT || 5000) + i,
			});

			let defaultConfiguration = Object.assign(exports.OLSKRollupDefaultConfiguration(options), {
				plugins: exports.OLSKRollupDefaultPluginsSvelte(options),
			});

			if (!require('fs').existsSync(require('path').join(options.OLSKRollupStartDirectory, 'rollup-config-custom.js'))) {
				return defaultConfiguration;
			};

			return require(require('path').join(options.OLSKRollupStartDirectory, 'rollup-config-custom.js')).OLSKRollupConfigCustom(defaultConfiguration, options);
		});
	},

};

Object.assign(exports, mod);
