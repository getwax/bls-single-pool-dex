import { useState, useEffect } from "react";

const useSigner = provider => {
  const [signer, setSigner] = useState("");

  useEffect(() => {
    const getSigner = async () => {
      if (provider) {
        setSigner(await provider.getSigner());
      }
    };

    getSigner();
  }, [provider]);

  return signer;
};

export default useSigner;
