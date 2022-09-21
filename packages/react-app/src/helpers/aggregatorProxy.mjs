import { ethers, BigNumber } from "ethers";
import { Aggregator, BlsWalletWrapper, AggregatorUtilities__factory, initBlsWalletSigner } from "bls-wallet-clients";
import pkg from "bls-wallet-aggregator-proxy";
const { runAggregatorProxy } = pkg;
import pk from "./../../aggregatorProxyPrivateKey.js";
const { privateKey } = pk;

(async () => {
  const aggregatorUtilities = "0x957e58EfEB6cE40F95f3dBFAaCD9465Df5C29E23";
  const upstreamAggregatorUrl = "https://arbitrum-goerli.blswallet.org"; // deployed proxy aggregator from initializeAggregatorProxy.mjs;
  const sponsoredContracts = [
    "0x241d375A08bc1FA1e22AaFf8A096DDc06645B277", // DEX
    "0x438468852619C3754adFb411c549bd00ada7227F", // Token
  ];
  const verificationGateway = "0xAf96d6e0817Ff8658f0E2a39b641920fA7fF0957";
  const chainId = 421613;
  const port = 3501;
  const hostname = "0.0.0.0";

  const provider = new ethers.providers.JsonRpcProvider("https://goerli-rollup.arbitrum.io/rpc");
  const utils = AggregatorUtilities__factory.connect(aggregatorUtilities, provider);

  const blsWalletSigner = await initBlsWalletSigner({
    chainId,
  });

  const wallet = await BlsWalletWrapper.connect(privateKey, verificationGateway, provider);

  const upstreamAggregator = new Aggregator(upstreamAggregatorUrl);

  runAggregatorProxy(
    upstreamAggregatorUrl,
    async clientBundle => {
      console.log("In the agg proxy");
      const isSponsored = clientBundle.operations.every(op =>
        op.actions.every(action => sponsoredContracts.includes(action.contractAddress)),
      );
      const actions = clientBundle.operations[0].actions
      console.log("actions: ", actions);

      console.log("isSponsored: ", isSponsored);
      console.log("clientBundle: ", clientBundle);
      if (!isSponsored) {
        return clientBundle;
      }

      const fees = await upstreamAggregator.estimateFee(
        blsWalletSigner.aggregate([
          clientBundle,
          wallet.sign({
            nonce: await wallet.Nonce(),
            actions: [
              {
                // Use send of 1 wei to measure fee that includes our payment
                ethValue: 1,
                contractAddress: utils.address,
                encodedFunction: utils.interface.encodeFunctionData("sendEthToTxOrigin"),
              },
            ],
          }),
        ]),
      );
      
      console.log("Fees: ", fees);
      if (!fees.successes.every(s => s) || fees.feeType !== "ether") {
        return clientBundle;
      }

      const remainingFee = BigNumber.from(fees.feeRequired).sub(fees.feeDetected);

      // pay a bit more than expected to increase chances of success
      const paymentAmount = remainingFee.add(remainingFee.div(10));

      const paymentBundle = wallet.sign({
        nonce: await wallet.Nonce(),
        actions: [
          {
            ethValue: paymentAmount,
            contractAddress: utils.address,
            encodedFunction: utils.interface.encodeFunctionData("sendEthToTxOrigin"),
          },
        ],
      });
      console.log("clientBundle: ", clientBundle);
      console.log("paymentBundle:", paymentBundle);

      return blsWalletSigner.aggregate([clientBundle, paymentBundle]);
    },
    port,
    hostname,
    () => {
      console.log(`Proxying ${upstreamAggregatorUrl} on ${hostname}:${port}`);
    },
  );
})().catch(error => {
  setTimeout(() => {
    console.log("ERROR - sendSponsoredTransaction: ", error);
    throw error;
  });
});
