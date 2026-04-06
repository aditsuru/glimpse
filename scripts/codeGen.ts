import fs from "node:fs";
import path from "node:path";

const moduleName = process.argv[2];

if (!moduleName) {
	console.error("Usage: tsx scripts/codegen.ts <module-name>");
	process.exit(1);
}

const pascal = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
const base = path.join("src/modules", moduleName);
const componentsDir = path.join(base, "components");

// ── Create directories ────────────────────────────────────────────
fs.mkdirSync(componentsDir, { recursive: true });

// ── File templates ────────────────────────────────────────────────
const files: Record<string, string> = {
	[`${moduleName}.schema.ts`]: `import * as z from "zod"\n\nexport const ${moduleName}Schema = {}\n`,

	[`${moduleName}.service.ts`]: `import type { db as DBType } from "@/drizzle/db"\n\nexport class ${pascal}Service {\n  constructor(\n    private db: typeof DBType,\n    private userId: string\n  ) {}\n}\n`,

	[`${moduleName}.route.ts`]: `import { base } from "@/server/os"\n\nexport const ${moduleName}Router = base.router({})\n`,

	[`${moduleName}.queries.ts`]: ``,

	[`components/${pascal}.tsx`]: `export default function ${pascal}() {\n  return null\n}\n`,
};

// ── Write files ───────────────────────────────────────────────────
for (const [filename, content] of Object.entries(files)) {
	const filepath = path.join(base, filename);

	if (fs.existsSync(filepath)) {
		console.log(`⚠  Skipped  ${filename} (already exists)`);
		continue;
	}

	fs.writeFileSync(filepath, content);
	console.log(`✅ Created  ${filename}`);
}

console.log(`\nDone. Module: ${moduleName}`);
