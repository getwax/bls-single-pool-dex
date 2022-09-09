import Web3Modal from "web3modal";

/*
  Web3 modal helps us "connect" external wallets:
*/
const providerOptions = {}
const web3ModalSetup = () =>
  new Web3Modal({
    providerOptions
  });

export default web3ModalSetup;
