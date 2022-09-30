// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = "7b0e75d38d424750b92791477924d133";

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

// BLOCKNATIVE ID FOR Notify.js:
export const BLOCKNATIVE_DAPPID = "0b58206a-f3c0-4701-a62f-73c7243e8c77";

export const ALCHEMY_KEY = "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";

export const NETWORKS = {
  localhost: {
    name: "localhost",
    color: "#666666",
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: "http://localhost:8545",
    verificationGateway: "0x3C17E9cF70B774bCf32C66C8aB83D19661Fc27E2",
    aggregator: "http://localhost:3000",
    proxyAggregator: "http://localhost:3501",
  },
  arbitrumGoerli: {
    name: "arbitrumGoerli",
    color: "#50a0ea",
    chainId: 421613,
    blockExplorer: "https://goerli-rollup-explorer.arbitrum.io/",
    rpcUrl: "https://goerli-rollup.arbitrum.io/rpc",
    verificationGateway: "0xAf96d6e0817Ff8658f0E2a39b641920fA7fF0957",
    aggregator: "https://arbitrum-goerli-paid.blswallet.org",
    proxyAggregator: "https://arbitrum-goerli-dex-proxy.blswallet.org/",
  },
};

export const NETWORK = chainId => {
  for (const n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
};
