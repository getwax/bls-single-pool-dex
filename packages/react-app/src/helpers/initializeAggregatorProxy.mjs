import { ethers } from "ethers";
import { BlsWalletWrapper } from "bls-wallet-clients";
import * as fs from "fs";
import pk from "./../../aggregatorProxyPrivateKey.js";
const { privateKey } = pk;

// Steps
// Fund aggregator proxy
// Call initializeAggregatorProxy()
// Call sendSponsoredTransaction()

(async () => {
  let wallet;
  const provider = new ethers.providers.JsonRpcProvider("https://goerli-rollup.arbitrum.io/rpc");
  // const existingPrivateKey = localStorage.getItem("aggregatorProxyPrivateKey");
  const verificationGateway = "0xAf96d6e0817Ff8658f0E2a39b641920fA7fF0957";

  if (privateKey !== "0x0") {
    console.log("PK", privateKey);
    wallet = await BlsWalletWrapper.connect(privateKey, verificationGateway, provider);
  } else {
    console.log("existingPrivateKey not configured, generating...");

    const mnemonic = ethers.Wallet.createRandom().mnemonic;
    const node = ethers.utils.HDNode.fromMnemonic(mnemonic.phrase);
    const { privateKey } = node.derivePath("m/44'/60'/0'/0/0");

    wallet = await BlsWalletWrapper.connect(privateKey, verificationGateway, provider);

    // localStorage.setItem("aggregatorProxyPrivateKey", privateKey);
    // fs.write("aggregatorProxyPrivateKey.js", `export const privateKey = "${privateKey}"`);
    // fs.writeFile(path.join(__dirname, "aggregatorProxyPrivateKey.js"), );
    // await fs.promises.writeFile(
    //   path.join(__dirname, "aggregatorProxyPrivateKey.js"),
    //   `export const privateKey = "${privateKey}"`,
    // );
    // fs.writeFileSync("aggregatorProxyPrivateKey.js", `export const privateKey = "${privateKey}"`);
    fs.writeFileSync("aggregatorProxyPrivateKey.js", `exports.privateKey = "${privateKey}";`);
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
    console.log("ERROR - sendSponsoredTransaction: ", error);
    throw error;
  });
});
