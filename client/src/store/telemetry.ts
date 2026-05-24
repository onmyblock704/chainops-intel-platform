import { create } from "zustand";

interface BlockData {
  number: number;
  hash: string;
  timestamp: number;
}

interface TelemetryState {
  latestBlock: BlockData | null;
  gasPrice: string;
  rpcLatency: number;
  wsStatus: "connected" | "disconnected";
  setLatestBlock: (block: BlockData) => void;
  setGasPrice: (gas: string) => void;
  setRpcLatency: (latency: number) => void;
  setWsStatus: (status: "connected" | "disconnected") => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  latestBlock: null,
  gasPrice: "--",
  rpcLatency: 0,
  wsStatus: "disconnected",

  setLatestBlock: (block) =>
    set({
      latestBlock: block,
    }),

  setGasPrice: (gas) =>
    set({
      gasPrice: gas,
    }),

  setRpcLatency: (latency) =>
    set({
      rpcLatency: latency,
    }),

  setWsStatus: (status) =>
    set({
      wsStatus: status,
    }),
}));