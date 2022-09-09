import { useState, useEffect } from "react";

const useSigner = provider => {
  const [signer, setSigner] = useState("");
  
  useEffect(() => {
    if (provider) {
        setSigner(provider.getSigner());
    }
  }, [provider]);

  return signer;
};

export default useSigner;
