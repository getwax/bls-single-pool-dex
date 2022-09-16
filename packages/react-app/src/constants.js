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
    rpcUrl: "http://" + (global.window ? window.location.hostname : "localhost") + ":8545",
    verificationGateway: "0xa15954659EFce154a3B45cE88D8158A02bE2049A",
    aggregator: "http://localhost:3000",
  },
  mainnet: {
    name: "mainnet",
    color: "#ff8b9e",
    chainId: 1,
    rpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
    blockExplorer: "https://etherscan.io/",
  },
  arbitrumGoerli: {
    name: "arbitrumGoerli",
    color: "#50a0ea",
    chainId: 421613,
    blockExplorer: "https://goerli-rollup-explorer.arbitrum.io/",
    rpcUrl: "https://goerli-rollup.arbitrum.io/rpc",
    verificationGateway: "0xAf96d6e0817Ff8658f0E2a39b641920fA7fF0957",
    aggregator: "https://arbitrum-goerli.blswallet.org",
  },
};

export const NETWORK = chainId => {
  for (const n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
};
