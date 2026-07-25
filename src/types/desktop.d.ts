export {};

declare global {
  interface Window {
    desktop?: {
      isElectron: boolean;
    };
  }
}
