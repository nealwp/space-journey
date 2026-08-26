import { ConsoleApplication } from "./console/core/ConsoleApplication";
import { CaptainConsole } from "./console/CaptainConsole";

async function main(): Promise<void> {
  const consoleApp = new ConsoleApplication();
  await consoleApp.init();

  const captainConsole = new CaptainConsole();
  consoleApp.root.addChild(captainConsole);

  consoleApp.app.ticker.add((ticker) => {
    captainConsole.update(ticker.deltaMS);
  });

  consoleApp.app.canvas.addEventListener("click", () => {
    captainConsole.focusTerminal();
  });

  window.addEventListener("beforeunload", () => {
    captainConsole.destroy();
    consoleApp.destroy();
  });
}

main();
