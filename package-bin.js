#!/usr/bin/env node

const uWriteFile = function (param1, param2) {
	if (!require('fs').existsSync(require('path').dirname(param1))){
		require('fs').mkdirSync(require('path').dirname(param1));
	}

	require('fs').writeFileSync(param1, param2)
};

const mod = {

	// CONTROL

	ControlScanStart(args, watch) {
		const configPath = (function() {
			const custom = require('path').join(process.cwd(), 'rollup-config.js');

			if (require('fs').existsSync(custom)) {
				return custom;
			}

			const compiled = require('path').join(process.cwd(), '__compiled/rollup-config.js');
					
			uWriteFile(compiled, `const OLSKRollupScaffold = require('${ require('path').join(__dirname, 'main.js') }');\n\nexport default OLSKRollupScaffold.OLSKRollupScaffoldScanStart(process.cwd());`);

			return compiled;
		})();

		require('child_process').spawn('rollup', [].concat.apply([], [
			watch ? ['-w'] : [],
			'-c', configPath,

			args.length
			? args
			: [],

			]), {
				stdio: 'inherit',
				env: Object.assign(process.env, {
					OLSK_ROLLUP_SCAFFOLD_CI: args.includes('--ci'),
				}),
			});
	},

	// LIFECYCLE

	LifecycleScriptDidLoad() {
		if (process.argv[1].endsWith('olsk-rollup-watch')) {
			return mod.ControlScanStart(process.argv.slice(2), true);
		};

		if (process.argv[1].endsWith('olsk-rollup') && process.argv[2] === 'watch') {
			return mod.ControlScanStart(process.argv.slice(3), true);
		};

		mod.ControlScanStart(process.argv.slice(2));
	},

};

mod.LifecycleScriptDidLoad();
