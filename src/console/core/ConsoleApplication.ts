import { Application, Container } from "pixi.js";
import { DESIGN_WIDTH, DESIGN_HEIGHT } from "./ConsoleLayout";
import { ConsoleTheme } from "./ConsoleTheme";

export interface Disposable {
  destroy(): void;
}

export class ConsoleApplication implements Disposable {
  readonly app: Application;
  readonly root: Container;

  private onResizeBound: () => void;

  constructor() {
    this.app = new Application();
    this.root = new Container();
    this.onResizeBound = this.onResize.bind(this);
  }

  async init(): Promise<void> {
    await this.app.init({
      resizeTo: window,
      antialias: false,
      background: ConsoleTheme.colors.page,
      backgroundAlpha: 1,
    });

    document.body.appendChild(this.app.canvas);

    this.app.stage.addChild(this.root);

    this.onResize();
    window.addEventListener("resize", this.onResizeBound);
  }

  private onResize(): void {
    const vw = this.app.renderer.width;
    const vh = this.app.renderer.height;

    const scale = Math.min(vw / DESIGN_WIDTH, vh / DESIGN_HEIGHT);

    this.root.scale.set(scale);

    const scaledW = DESIGN_WIDTH * scale;
    const scaledH = DESIGN_HEIGHT * scale;

    this.root.x = Math.round((vw - scaledW) / 2);
    this.root.y = Math.round((vh - scaledH) / 2);
  }

  destroy(): void {
    window.removeEventListener("resize", this.onResizeBound);
    this.app.destroy(true, { children: true });
  }
}
