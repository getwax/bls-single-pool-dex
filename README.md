# 🏗 scaffold-eth | 🏰 BuidlGuidl

## BLS Minimum Viable Exchange
This dApp was based off Challenge 3: Single Pool DEX from Speed Run Ethereum. It has been integrated with BLS Wallet, for more information see:

[BLS Wallet Github](https://github.com/web3well/bls-wallet)
[BLS Wallet homepage](https://blswallet.org/)

## Getting started

`yarn start`

A new browser wallet is generated when you visit the site (just like Punk Wallet) and everything is deployed to Arbitrum Goerli.

To get started you just need to transfer a tiny amount of testnet eth (like 0.01) to the browser wallet address. Then click the ethToToken function in the UI.

### BLS Wallet features

1. **Multi-action transactions** - seperate transactions can be bundled together into one e.g. approve and transferFrom. If you want to test that out, you can call the tokenToEth function after you've swapped eth for the erc20 token which includes approve and transferFrom function calls.
2. **dApp-sponsored transactions** - all transactions are sponsored so the end user doesn't have to pay any transaction fees.

💬 If you have any questions, suggestions or comments then please reach out to me on Telegram: @JohnGuilding

