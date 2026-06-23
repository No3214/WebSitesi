export const VERCEL_ENV_DASHBOARD_PATH =
  "Vercel Dashboard > kozbeyli-konagi > Settings > Environment Variables";

export const VERCEL_ENVIRONMENT = "Production";
export const VERCEL_CLI_INSTALL_COMMAND = "npm i -g vercel";
export const VERCEL_CLI_AUTH_COMMANDS = ["vercel login", "vercel whoami"];

const SAFE_ENV_NAME = /^[A-Z0-9_]+$/;

function uniqueSafeEnvNames(names = []) {
  return [...new Set(names)].filter((name) => SAFE_ENV_NAME.test(name));
}

function cliCommandsForEnvNames(envNames, commands = []) {
  const generated = envNames.map((name) => `vercel env add ${name} production`);
  const exactExistingCommands = commands.filter((command) => generated.includes(command));
  return [...new Set([...exactExistingCommands, ...generated])];
}

export function buildVercelEnvSetupGuidance(missingEnv = [], commands = []) {
  const envNames = uniqueSafeEnvNames(missingEnv);
  if (envNames.length === 0) return undefined;

  return {
    provider: "Vercel",
    environment: VERCEL_ENVIRONMENT,
    dashboardPath: VERCEL_ENV_DASHBOARD_PATH,
    envNames,
    cliInstallCommand: VERCEL_CLI_INSTALL_COMMAND,
    cliAuthCommands: [...VERCEL_CLI_AUTH_COMMANDS],
    cliCommands: cliCommandsForEnvNames(envNames, commands),
    manualChecklist: [
      `Open ${VERCEL_ENV_DASHBOARD_PATH}.`,
      `Add or update only these ${VERCEL_ENVIRONMENT} env names: ${envNames.join(", ")}.`,
      "Keep secret values in Vercel/provider dashboards; do not paste values into repository evidence.",
      "Trigger a production redeploy after env changes.",
      "Run npm run launch:audit:live after the redeploy.",
    ],
  };
}
