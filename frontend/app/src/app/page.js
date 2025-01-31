"use client";

import { useState } from "react";
import { useEffect } from "react";
import { ethers } from "ethers";
import { createSignature } from './utilities';

export default function Home() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenType, setTokenType] = useState("ERC20");
  const [tokenContract, setTokenContract] = useState("");
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);


  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        // Reset the states to prompt the user to manually connect again
        setAccount(null);
        setProvider(null);
        setSigner(null);
      });
    }
  }, []);


  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setProvider(provider);
      setSigner(signer);
      setAccount(await signer.getAddress());
    } else {
      alert("Please install MetaMask");
    }
  };

  const sendTransactionRequest = async () => {
    if (!account) return alert("Connect wallet first");
    setLoading(true);

    try {

      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const tokType = tokenType === 'ERC20' ? 0 : 1;

      const transferRequest = {
        tokenType : tokType.toString(),
        tokenContract,
        from: account,
        to,
        value : tokType === 0 ? (ethers.parseEther(value.toString())).toString() : value.toString(),
        deadline : deadline.toString()
      };

      const signature = await createSignature(signer, tokType, tokenContract, value, deadline);

      const response = await fetch("http://localhost:4000/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferRequest, signature })
      });

      const data = await response.json();
      alert(data.success ? `Transaction sent: ${data.txHash}` : `Error: ${data.error}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

    return (
      <div>
        <h1>Gasless ERC20/721 Transfers</h1>
        {account ? (
          <div>
            <p>Connected: {account}</p>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
        <div>
          <label>Token Type: </label>
          <select value={tokenType} onChange={(e) => setTokenType(e.target.value)}>
            <option value="ERC20">ERC20</option>
            <option value="ERC721">ERC721</option>
          </select>
        </div>
        <div>
          <label>Token Contract: </label>
          <input type="text" value={tokenContract} onChange={(e) => setTokenContract(e.target.value)} />
        </div>
        <div>
          <label>To: </label>
          <input type="text" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <label>{tokenType === "ERC20" ? "Amount" : "Token ID"}: </label>
          <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <button 
          onClick={sendTransactionRequest} 
          disabled={loading || !provider || !signer}
        >
          {loading ? "Processing..." : "Send Gasless Transaction"}
        </button>
      </div>
    );
}