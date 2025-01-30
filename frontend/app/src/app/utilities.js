const { ethers } = require("ethers");

export async function createSignature(owner, tokenType, tokenContractAddress, value, deadline) {

  const gaslessTokenTransferAddress = await (await fetch('http://localhost:4000/gasless-addr')).text();
  const gaslessAbi = await (await fetch('http://localhost:4000/gasless-abi')).text();
  const erc20abi = await (await fetch('http://localhost:4000/erc20-abi')).text();
  const erc721abi = await (await fetch('http://localhost:4000/erc721-abi')).text();
  const provider = new ethers.JsonRpcProvider("https://ethereum-holesky-rpc.publicnode.com");

  let tokenContract, gaslessContract;

  if (tokenType === 0) {
    tokenContract = new ethers.Contract(tokenContractAddress, JSON.parse(Buffer.from(erc20abi, "base64").toString("utf-8")), provider);
  }
  else {
    tokenContract = new ethers.Contract(tokenContractAddress, JSON.parse(Buffer.from(erc721abi, "base64").toString("utf-8")), provider);
  }

  // console.log(tokenContract);

  gaslessContract = new ethers.Contract(gaslessTokenTransferAddress, JSON.parse(Buffer.from(gaslessAbi, "base64").toString("utf-8")), provider);

  const [fields, name, version, chainId, verifyingContract, salt, extensions] = await tokenContract.eip712Domain();

  const domain = {
    name: name,
    version: version,
    chainId: chainId.toString(),
    verifyingContract: verifyingContract
  };

  console.log(domain);

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ]
  };

  const values = {
    owner: await owner.getAddress(),
    spender: await gaslessContract.getAddress(),
    value: tokenType === 0 ? (ethers.parseEther(value.toString())).toString() : value.toString(),
    nonce: await tokenContract.nonces(await owner.getAddress()),
    deadline: deadline.toString()
  };

  console.log(values);

  const signature = await owner.signTypedData(domain, types, values);
  return signature;
}