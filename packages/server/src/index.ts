import { PowerSystem } from "@space-journey/system-power";
import { SystemRegistry } from "./registry";
import { SystemTransport } from "./transport";

async function main(): Promise<void> {
  const registry = new SystemRegistry();
  registry.register(new PowerSystem());

  const transport = new SystemTransport(registry);
  transport.listen();

  await registry.start();

  const shutdown = async (): Promise<void> => {
    await registry.stop();
    transport.close();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}

main();