// scripts/deploy.js
async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);


    const Contract = await ethers.getContractFactory("MockERC721");
    const contract = await Contract.deploy("kok", "KK");
  
    console.log("Contract deployed to address:", contract.target);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });