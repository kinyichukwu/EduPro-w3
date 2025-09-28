import { Buffer } from "buffer";

// Provide Buffer globally for browser runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(window as any).Buffer) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Buffer = Buffer;
}

// Provide global alias for Node-style globals some libs expect
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(window as any).global) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).global = window as any;
}

// Some Solana/Node libs expect process env to exist minimally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(window as any).process) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).process = { env: {} } as any;
}


