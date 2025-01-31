const {ethers} = require("ethers");
const hardhat = require("hardhat");

async function main() {
    
    
    const provider = new ethers.JsonRpcProvider("https://ethereum-holesky-rpc.publicnode.com");
    const owner = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);
    
    const erc721con = await hardhat.ethers.getContractAt("MockERC721", "0xE90AB5ab9e9661aFAa25c8de6400915BeBbA10C9", owner);
    
    
    const tx = await erc721con.mint();
    
    await tx.wait();
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });