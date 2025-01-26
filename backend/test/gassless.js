const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GaslessTokenTransfer", function () {
  let owner, sender, recipient;
  let mockERC20, mockERC721, gaslessTokenTransfer;

  beforeEach(async function () {

    chainId = (await ethers.provider.getNetwork()).chainId;

    console.log("Chain ID: ", chainId);

    [owner, sender, recipient] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy(1000000);
    await mockERC20.waitForDeployment();

    const MockERC721 = await ethers.getContractFactory("MockERC721");
    mockERC721 = await MockERC721.deploy();
    await mockERC721.waitForDeployment();

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
    return signedmsg;
  }

  describe("ERC20 Gasless Transfer", function () {
    it("Should perform gasless ERC20 transfer", async function () {
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

      const signature = await createSignature(request, sender);

      await expect(
        gaslessTokenTransfer.metaTransfer(request, signature)
      ).to.not.be.reverted;

      expect(await mockERC20.balanceOf(recipient.address)).to.equal(500);
      expect(await mockERC20.balanceOf(sender.address)).to.equal(500);
    });
  });

  it("Should reject transfer with signature from different chain", async function () {
    await mockERC20.mint(sender.address, 1000);
    await mockERC20.connect(sender).approve(await gaslessTokenTransfer.getAddress(), 1000);

    const request = {
      tokenType: 0, // ERC20
      tokenContract: await mockERC20.getAddress(),
      from: sender.address,
      to: recipient.address,
      value: 500,
      nonce: 0,
      chainId: 999
    };

    const signature = await createSignature(request, sender);

    await expect(
      gaslessTokenTransfer.metaTransfer(request, signature)
    ).to.be.revertedWith("Invalid signature");
  });

  describe("ERC721 Gasless Transfer", function () {
    it("Should perform gasless ERC721 transfer", async function () {
      await mockERC721.mint(sender.address, 1);
      await mockERC721.connect(sender).approve(await gaslessTokenTransfer.getAddress(), 1);

      const request = {
        tokenType: 1, // ERC721
        tokenContract: await mockERC721.getAddress(),
        from: sender.address,
        to: recipient.address,
        value: 1, // Token ID
        nonce: 0,
        chainId: chainId
      };

      const signature = await createSignature(request, sender);

      await expect(
        gaslessTokenTransfer.metaTransfer(request, signature)
      ).to.not.be.reverted;

      expect(await mockERC721.ownerOf(1)).to.equal(recipient.address);
    });
  });

});

