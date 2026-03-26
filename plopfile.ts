import type { NodePlopAPI } from "plop";

export default function (plop: NodePlopAPI) {
	plop.setGenerator("module", {
		description: "Create a new server module",
		prompts: [
			{
				type: "input",
				name: "name",
				message: "Module name (singular, lowercase):",
			},
		],
		actions: [
			{
				type: "add",
				path: "server/modules/{{name}}/{{name}}.schema.ts",
				templateFile: "plop-templates/module.schema.hbs",
			},
			{
				type: "add",
				path: "server/modules/{{name}}/{{name}}.service.ts",
				templateFile: "plop-templates/module.service.hbs",
			},
			{
				type: "add",
				path: "server/modules/{{name}}/{{name}}.route.ts",
				templateFile: "plop-templates/module.route.hbs",
			},
		],
	});
}
