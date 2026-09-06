import { ConsoleTheme } from "../core/ConsoleTheme";

export class TerminalInputController {
  private textarea: HTMLTextAreaElement;
  private onSubmit: (message: string) => void;
  private onInput: (value: string) => void;

  constructor(
    onSubmit: (message: string) => void,
    onInput: (value: string) => void
  ) {
    this.onSubmit = onSubmit;
    this.onInput = onInput;

    this.textarea = document.createElement("textarea");
    this.textarea.style.position = "fixed";
    this.textarea.style.left = "-9999px";
    this.textarea.style.top = "-9999px";
    this.textarea.style.width = "1px";
    this.textarea.style.height = "1px";
    this.textarea.style.opacity = "0";
    this.textarea.setAttribute("aria-hidden", "true");
    this.textarea.autocomplete = "off";
    this.textarea.autocapitalize = "off";
    this.textarea.spellcheck = false;

    this.textarea.addEventListener("keydown", this.handleKeydown);
    this.textarea.addEventListener("input", this.handleInput);

    document.body.appendChild(this.textarea);
  }

  focus(): void {
    this.textarea.focus();
  }

  clear(): void {
    this.textarea.value = "";
  }

  getValue(): string {
    return this.textarea.value;
  }

  destroy(): void {
    this.textarea.removeEventListener("keydown", this.handleKeydown);
    this.textarea.removeEventListener("input", this.handleInput);
    this.textarea.remove();
  }

  private handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = this.textarea.value.trim();
      if (value.length > 0) {
        this.onSubmit(value);
      }
    }
  };

  private handleInput = (): void => {
    this.onInput(this.textarea.value);
  };
}
