import { Aggregator, BlsWalletWrapper } from "bls-wallet-clients";
import { NETWORKS } from "../constants";

export const sendTransaction = async (provider, params, isSponsored = false) => {
  const network = NETWORKS.arbitrumGoerli;

  const privateKey = localStorage.getItem("privateKey");
  const verificationGateway = network.verificationGateway;
  const wallet = await BlsWalletWrapper.connect(privateKey, verificationGateway, provider);

  const nonce = await BlsWalletWrapper.Nonce(wallet.PublicKey(), verificationGateway, provider);
  const actions = params.map(tx => ({
    ethValue: tx.value ?? "0",
    contractAddress: tx.to,
    encodedFunction: tx.data ?? "0x",
  }));

  const bundle = wallet.sign({
    nonce,
    actions,
  });

  const proxyAggregator = "http://localhost:3501";
  const aggregatorUrl = isSponsored ? proxyAggregator : network.aggregator;

  const aggregator = new Aggregator(aggregatorUrl);
  const result = await aggregator.add(bundle);

  if ("failures" in result) {
    throw new Error(JSON.stringify(result));
  }

  return result;
};

export const getTransactionReceipt = async hash => {
  const aggregator = new Aggregator(NETWORKS.arbitrumGoerli.aggregator);
  const bundleReceipt = await aggregator.lookupReceipt(hash);

  return (
    bundleReceipt && {
      transactionHash: hash,
      transactionIndex: bundleReceipt.transactionIndex,
      blockHash: bundleReceipt.blockHash,
      blockNumber: bundleReceipt.blockNumber,
      logs: [],
      cumulativeGasUsed: "0x0",
      gasUsed: "0x0",
      status: "0x1",
      effectiveGasPrice: "0x0",
    }
  );
};

export const getAddress = async provider => {
  const privateKey = localStorage.getItem("privateKey");
  const verificationGateway = NETWORKS.arbitrumGoerli.verificationGateway;
  return await BlsWalletWrapper.Address(privateKey, verificationGateway, provider);
};
