import { useState, useEffect } from "react";
const { ethers } = require("ethers");

const useProvider = (rpcUrl) => {
  const [provider, setProvider] = useState("");

  useEffect(() => {
    const getProvider = async () => {};
      const privateKey = localStorage.getItem("privateKey");
      if (!privateKey) {
        localStorage.setItem("privateKey", ethers.Wallet.createRandom().privateKey)
      }
      setProvider(new ethers.providers.StaticJsonRpcProvider(rpcUrl));
    getProvider();
  }, [rpcUrl]);

  return provider;
};

export default useProvider;
