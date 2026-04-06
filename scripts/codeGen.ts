// scripts/codegen.ts
import fs from "fs";
import path from "path";

const moduleName = process.argv[2];
if (!moduleName) throw new Error("Usage: tsx scripts/codegen.ts <module>");

const pascal = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
const dir = path.join("src/modules", moduleName);

// Read the schema to extract operation names
const schemaPath = path.join(dir, `${moduleName}.schema.ts`);
if (!fs.existsSync(schemaPath)) {
	throw new Error(`Write ${moduleName}.schema.ts first`);
}

const schemaContent = fs.readFileSync(schemaPath, "utf-8");

// Extract top-level keys from the schema object
// Matches: get:, create:, delete:, etc.
const operationRegex = /^\s{2}(\w+):/gm;
const operations: string[] = [];
let match;
while ((match = operationRegex.exec(schemaContent)) !== null) {
	// Skip nested keys (they have more indentation)
	operations.push(match[1]);
}

// ─── SERVICE ──────────────────────────────────────────────────────
const serviceMethods = operations
	.map(
		(op) => `
  async ${op}(
    input: z.infer<typeof ${moduleName}Schema.${op}.input>
  ): Promise<z.infer<typeof ${moduleName}Schema.${op}.output>> {
    // TODO: implement
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Not implemented" })
  }`
	)
	.join("\n");

const serviceContent = `import { ORPCError } from "@orpc/server"
import type * as z from "zod"
import type { db as DBType } from "@/drizzle/db"
import type { ${moduleName}Schema } from "./${moduleName}.schema"

export class ${pascal}Service {
  constructor(
    private db: typeof DBType,
    private userId: string
  ) {}
${serviceMethods}
}
`;

// ─── ROUTE ────────────────────────────────────────────────────────
const handlers = operations
	.map(
		(op) => `
  ${op}: ${moduleName}Procedure
    .input(${moduleName}Schema.${op}.input)
    .output(${moduleName}Schema.${op}.output)
    .handler(async ({ input, context }) => {
      return await context.${moduleName}Service.${op}(input)
    }),`
	)
	.join("\n");

const routeContent = `import { authedProcedure, base } from "@/server/os"
import { ${moduleName}Schema } from "./${moduleName}.schema"
import { ${pascal}Service } from "./${moduleName}.service"

const ${moduleName}Procedure = authedProcedure.use(({ context, next }) => {
  const ${moduleName}Service = new ${pascal}Service(
    context.db,
    context.session.user.id
  )
  return next({ context: { ${moduleName}Service } })
})

export const ${moduleName}Router = base.router({${handlers}
})
`;

// ─── QUERIES ──────────────────────────────────────────────────────
// Heuristic: ops starting with get/list/fetch → query, else → mutation
const queryOps = operations.filter((op) =>
	/^(get|list|fetch|search|check)/.test(op)
);
const mutationOps = operations.filter(
	(op) => !/^(get|list|fetch|search|check)/.test(op)
);

const queryHooks = queryOps
	.map((op) => {
		const hookName = `use${pascal}${op.charAt(0).toUpperCase() + op.slice(1)}`;
		return `
export const ${hookName} = (input: z.infer<typeof ${moduleName}Schema.${op}.input>) =>
  useQuery(orpc.${moduleName}.${op}.queryOptions({ input }))`;
	})
	.join("\n");

const mutationHooks = mutationOps
	.map((op) => {
		const hookName = `use${op.charAt(0).toUpperCase() + op.slice(1)}${pascal}`;
		return `
export const ${hookName} = () =>
  useMutation(orpc.${moduleName}.${op}.mutationOptions())`;
	})
	.join("\n");

const queriesContent = `"use client"
import { useMutation, useQuery } from "@tanstack/react-query"
import type * as z from "zod"
import { orpc } from "@/lib/client/orpc"
import type { ${moduleName}Schema } from "./${moduleName}.schema"

// ─── Queries ──────────────────────────────────────────────
${queryHooks}

// ─── Mutations ────────────────────────────────────────────
${mutationHooks}
`;

// ─── WRITE FILES ──────────────────────────────────────────────────
const write = (filename: string, content: string) => {
	const filepath = path.join(dir, filename);
	if (fs.existsSync(filepath)) {
		console.log(`⚠️  Skipping ${filename} (already exists)`);
		return;
	}
	fs.writeFileSync(filepath, content);
	console.log(`✅ Generated ${filename}`);
};

write(`${moduleName}.service.ts`, serviceContent);
write(`${moduleName}.route.ts`, routeContent);
write(`${moduleName}.queries.ts`, queriesContent);
