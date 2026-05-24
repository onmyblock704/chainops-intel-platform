import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, arbitrum, base, polygon } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "ChainOps DeFi Nexus",

  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,

  chains: [
    mainnet,
    arbitrum,
    base,
    polygon,
  ],

  ssr: false,
});

