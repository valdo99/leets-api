module.exports = {
	env: {
		commonjs: true,
		es2020: true,
		node: true,
	},
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: "module",
	},
	rules: {
		indent: ["error", 4, { SwitchCase: 1 }],
		//quotes: ['error', 'single', { avoidEscape: true }],
		"require-jsdoc": "off",
		semi: ["error", "always"],
		"semi-spacing": ["error", { before: false, after: true }],
		"semi-style": ["error", "last"],
		//'padded-blocks': ["error", "always"],
		eqeqeq: ["error", "always"],
		camelcase: ["error", { properties: "never", ignoreDestructuring: false }],
		"comma-spacing": ["error", { before: false, after: true }],
		"no-var": "error",
	},
};
