import { Aggregator, BlsWalletWrapper } from "bls-wallet-clients";
import { NETWORKS } from "../constants";

export const sendTransaction = async (provider, params) => {
  const network = NETWORKS["localhost"];

  const privateKey = localStorage.getItem("privateKey");
  const verificationGateway = network.verificationGateway;
  const wallet = await BlsWalletWrapper.connect(
    privateKey,
    verificationGateway,
    provider
  );

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

  const aggregator = new Aggregator(network.aggregator);
  const result = await aggregator.add(bundle);

  if ("failures" in result) {
    throw new Error(JSON.stringify(result));
  }

  return result;
};

export const getTransactionReceipt = async (hash) => {
  const aggregator = new Aggregator(NETWORKS["localhost"].aggregator);
  return await aggregator.lookupReceipt(hash);
};

export const getAddress = async provider => {
  const privateKey = localStorage.getItem("privateKey");
  const verificationGateway = NETWORKS["localhost"].verificationGateway;
  return await BlsWalletWrapper.Address(privateKey, verificationGateway, provider);
};
