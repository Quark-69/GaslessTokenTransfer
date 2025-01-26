// scripts/deploy.js
async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);

    const name = process.argv[2] || "DefaultToken";
    const symbol = process.argv[3] || "DTK";

    const Contract = await ethers.getContractFactory("Token");
    const contract = await Contract.deploy(name, symbol);
  
    console.log("Contract deployed to address:", contract.target);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });