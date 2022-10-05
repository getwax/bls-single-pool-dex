import { ethers } from "ethers";
import { BlsWalletWrapper } from "bls-wallet-clients";
import config from "./config.json" assert { type: "json" };

(async () => {
  let wallet;
  const privateKey = config.privateKey;
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

  if (privateKey !== "0x0") {
    wallet = await BlsWalletWrapper.connect(privateKey, config.verificationGateway, provider);
  } else {
    console.log("existingPrivateKey not configured, generating...");

    const mnemonic = ethers.Wallet.createRandom().mnemonic;
    const node = ethers.utils.HDNode.fromMnemonic(mnemonic.phrase);
    const { privateKey } = node.derivePath("m/44'/60'/0'/0/0");

    wallet = await BlsWalletWrapper.connect(privateKey, config.verificationGateway, provider);

    console.log("set aggregatorProxyPrivateKey:", privateKey);
  }

  const balance = await provider.getBalance(wallet.address);
  console.log("balance:", ethers.utils.formatEther(balance), "ETH");

  if (balance.eq(0)) {
    console.log("aggregator proxy requires funds");
  }

  console.log("Proxy address: ", wallet.address);
})().catch(error => {
  setTimeout(() => {
    console.log("ERROR: ", error);
    throw error;
  });
});
