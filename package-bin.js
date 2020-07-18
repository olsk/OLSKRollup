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
		const configPath = require('path').join(process.cwd(), '__compiled/rollup-config.js');
		
		uWriteFile(configPath, `const OLSKRollupScaffold = require('OLSKRollupScaffold');\n\nexport default OLSKRollupScaffold.OLSKRollupScaffoldScanStart(process.cwd());`);

		require('child_process').spawn('rollup', [].concat.apply([], [
			watch ? ['-w'] : [],
			'-c', configPath,

			args.length
			? args
			: [],

			]), {
				stdio: 'inherit',
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
