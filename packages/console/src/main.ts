import { ConsoleApplication } from "./console/core/ConsoleApplication";
import { CaptainConsole } from "./console/CaptainConsole";
import { WebSocketConsoleDataSource } from "./console/data/WebSocketConsoleDataSource";

const SYSTEMS_WS_URL =
  (import.meta.env.VITE_SYSTEMS_WS_URL as string | undefined) ??
  `ws://${window.location.hostname}:8080`;

async function main(): Promise<void> {
  const consoleApp = new ConsoleApplication();
  await consoleApp.init();

  const dataSource = new WebSocketConsoleDataSource(SYSTEMS_WS_URL);
  const captainConsole = new CaptainConsole(dataSource);
  consoleApp.root.addChild(captainConsole);

  await captainConsole.start();

  consoleApp.app.ticker.add((ticker) => {
    captainConsole.update(ticker.deltaMS);
  });

  consoleApp.app.canvas.addEventListener("click", () => {
    captainConsole.focusTerminal();
  });

  window.addEventListener("beforeunload", () => {
    dataSource.destroy();
    captainConsole.destroy();
    consoleApp.destroy();
  });
}

main();
