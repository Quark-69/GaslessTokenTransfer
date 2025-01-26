require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    holesky: {
      url: "https://holesky.infura.io/v3/1ce072283b9d4f18806c5dba6df1009f",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
