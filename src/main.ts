import { ConsoleApplication } from "./console/core/ConsoleApplication";
import { CaptainConsole } from "./console/CaptainConsole";
import { MockConsoleDataSource } from "./console/data/MockConsoleDataSource";

async function main(): Promise<void> {
  const consoleApp = new ConsoleApplication();
  await consoleApp.init();

  const dataSource = new MockConsoleDataSource();
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
