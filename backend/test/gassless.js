const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { SigningKey } = require("ethers");

describe("GaslessTokenTransfer", function () {
  let owner, sender, recipient;
  let mockERC20, mockERC721, gaslessTokenTransfer;

  beforeEach(async function () {

    chainId = (await ethers.provider.getNetwork()).chainId;

    console.log("Chain ID: ", chainId);

    // Deploy mock tokens and gasless transfer contract
    [owner, sender, recipient] = await ethers.getSigners();

    // Mock ERC20 Token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy(1000000);
    await mockERC20.waitForDeployment();

    // Mock ERC721 Token
    // const MockERC721 = await ethers.getContractFactory("MockERC721");
    // mockERC721 = await MockERC721.deploy();
    // await mockERC721.waitForDeployment();

    // Gasless Transfer Contract
    const GaslessTokenTransfer = await ethers.getContractFactory("GaslessTokenTransfer");
    gaslessTokenTransfer = await GaslessTokenTransfer.deploy();
    await gaslessTokenTransfer.waitForDeployment();
  });

  async function createSignature(request, signer) {
    const messageHash = ethers.solidityPackedKeccak256(
      ["uint8", "address", "address", "address", "uint256", "uint256", "uint256"],
      [
        (request.tokenType), 
        request.tokenContract, 
        request.from, 
        request.to, 
        (request.value), 
        (request.nonce),
        BigInt(request.chainId),
      ]
    );

    signedmsg = await signer.signMessage(ethers.getBytes(messageHash));
    console.log("Signed Message: ", signedmsg);
    return signedmsg;
  }

  describe("ERC20 Gasless Transfer", function () {
    it("Should perform gasless ERC20 transfer", async function () {
      // Prepare ERC20 transfer
      await mockERC20.mint(sender.address, 1000);
      await mockERC20.connect(sender).approve(await gaslessTokenTransfer.getAddress(), 1000);

      const request = {
        tokenType: 0, // ERC20
        tokenContract: await mockERC20.getAddress(),
        from: sender.address,
        to: recipient.address,
        value: 500,
        nonce: 0,
        chainId
      };

      // Create signature
      const signature = await createSignature(request, sender);

      // Perform gasless transfer
      await expect(
        gaslessTokenTransfer.metaTransfer(request, signature)
      ).to.not.be.reverted;

      // Check balance
      expect(await mockERC20.balanceOf(recipient.address)).to.equal(500);
      expect(await mockERC20.balanceOf(sender.address)).to.equal(500);
    });
  });
});

