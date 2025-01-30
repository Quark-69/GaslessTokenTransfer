async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);


    const Contract = await ethers.getContractFactory("MockERC20");
    const contract = await Contract.deploy("Test", "TS" , "10000000000000");
  
    console.log("Contract deployed to address:", contract.target);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });