/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	transform: {
		"^.+.tsx?$": ["ts-jest", {}]
	},
	testEnvironment: "node",
	modulePathIgnorePatterns: ["<rootDir>/.worktree/"],
	testPathIgnorePatterns: ["/node_modules/", "<rootDir>/.worktree/"]
};
