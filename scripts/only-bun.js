/**
 * Guarda de package manager: este projeto usa Bun.
 * Executado via `preinstall` — aborta `npm install`, `yarn install`
 * e `pnpm install` com um erro claro, liberando apenas o Bun.
 *
 * Limitação: `npm install --ignore-scripts` pula o preinstall;
 * o `package-lock.json` está no .gitignore como segunda camada.
 */

const userAgent = process.env.npm_config_user_agent ?? "";
const packageManager = userAgent.split(" ")[0].split("/")[0];

const BLOCKED = ["npm", "yarn", "pnpm"];

if (BLOCKED.includes(packageManager)) {
  console.error(
    `\nERRO: este projeto usa Bun. Não use ${packageManager}.\n` +
      `Rode "bun install" e instale pacotes com "bunx expo install <pacote>".\n`,
  );
  process.exit(1);
}
