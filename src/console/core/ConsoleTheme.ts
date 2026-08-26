export const ConsoleTheme = {
  colors: {
    page: 0x10110f,
    chassis: 0x53544e,
    chassisDark: 0x30312e,
    bezel: 0x262824,
    bezelHighlight: 0x70716a,

    screen: 0x09100b,
    screenSecondary: 0x0c120d,

    text: 0xa8b09c,
    textDim: 0x68705f,
    green: 0x79a86b,
    yellow: 0xb3a44f,
    red: 0xb85848,

    grid: 0x273329,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 18,
  },

  border: {
    outer: 3,
    inner: 1,
  },

  font: {
    family: "monospace",
    labelSize: 11,
    valueSize: 12,
    terminalSize: 13,
    titleSize: 10,
  },
} as const;

export type TelemetryColor =
  | typeof ConsoleTheme.colors.text
  | typeof ConsoleTheme.colors.textDim
  | typeof ConsoleTheme.colors.green
  | typeof ConsoleTheme.colors.yellow
  | typeof ConsoleTheme.colors.red;
