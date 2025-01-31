const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GaslessTokenTransfer", function () {
  let owner, sender, recipient;
  let mockERC20,mockERC721, gaslessTokenTransfer;
  let deadline;

  beforeEach(async function () {

    chainId = ((await ethers.provider.getNetwork()).chainId).toString();

    [owner, sender, recipient] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20", owner);
    mockERC20 = await MockERC20.deploy("MockTK", "MTK", "10000000000");
    await mockERC20.waitForDeployment();

    const MockERC721 = await ethers.getContractFactory("MockERC721", owner);
    mockERC721 = await MockERC721.deploy("xhut", "XT");
    await mockERC721.waitForDeployment();

    const GaslessTokenTransfer = await ethers.getContractFactory("GaslessTokenTransfer", sender);
    gaslessTokenTransfer = await GaslessTokenTransfer.deploy();
    await gaslessTokenTransfer.waitForDeployment();
  });

  async function createSignature() {
    deadline = Math.floor(Date.now() / 1000) + 3600;

    const domain = {
      name: "MockTK",
      version: "1",
      chainId: chainId.toString(),
      verifyingContract: await mockERC20.getAddress()
    };

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
      spender: await gaslessTokenTransfer.getAddress(),
      value: ethers.parseEther("1000"),
      nonce: await mockERC20.nonces(await owner.getAddress()),
      deadline: deadline.toString()
    };

    const signature = await owner.signTypedData(domain, types, values);
    return signature;
  }

  async function createSig()
    {
      deadline = Math.floor(Date.now() / 1000) + 3600;

      const domain = {
        name: "xhut",
        version: "1",
        chainId: chainId.toString(),
        verifyingContract: await mockERC721.getAddress()
      };

      types = {
        Permit: [
            { name: "spender", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
        ],
      };
  
      values = {
        spender: await gaslessTokenTransfer.getAddress(),
        tokenId: '1',
        nonce: (await mockERC721.nonces('1')).toString(),
        deadline: deadline.toString()
      };

      const signature = await owner.signTypedData(domain, types, values);
      return signature;
    }

  describe("ERC20 Gasless Transfer", function () {
    it("Should perform gasless ERC20 transfer", async function () {


      const signature = await createSignature();

      const request = {
        tokenType : '0',
        tokenContract: await mockERC20.getAddress(),
        from: await owner.getAddress(),
        to: await recipient.getAddress(),
        value: ethers.parseEther('1000'),
        deadline
      };

      await expect(
        gaslessTokenTransfer.metaTransfer(request, signature)
      ).to.not.be.reverted;

      expect(await mockERC20.balanceOf(recipient.address)).to.equal(ethers.parseEther("1000"));
    });
  });


  describe("ERC721 Gasless Transfer", function () {
    it("Should perform gasless ERC721 transfer", async function () {
      

      mockERC721.mint();

      const signature = await createSig();

      const request = {
        tokenType : '1',
        tokenContract: await mockERC721.getAddress(),
        from: await owner.getAddress(),
        to: await recipient.getAddress(),
        value: '1',
        deadline
      };

      await expect(
        gaslessTokenTransfer.metaTransfer(request, signature)
      ).to.not.be.reverted;

      expect(await mockERC721.ownerOf(1)).to.equal(await recipient.getAddress());
    });
  });

});

