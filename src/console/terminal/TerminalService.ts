export interface TerminalService {
  send(message: string): Promise<string>;
}

export class MockTerminalService implements TerminalService {
  async send(_message: string): Promise<string> {
    return "apologies, I am unable to connect to the ships systems at this time.";
  }
}
