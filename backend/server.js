const express = require("express");
const { ethers } = require("ethers");
const dotenv = require("dotenv");
const cors = require("cors");
const hardhat = require("hardhat");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);

const relayTransaction = async (req, res) => {
    try {
        const { transferRequest, signature } = req.body;

        // Load contract
        const relayContract = await hardhat.ethers.getContractAt("GaslessTokenTransfer", process.env.GASLESS_ADDRESS, wallet);

        const tx = await relayContract.metaTransfer(transferRequest, signature);

        const receipt = await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const gaslessAddr = async (req, res) => {
    res.send(process.env.GASLESS_ADDRESS);
}

const gaslessAbi = async (req, res) => {
    res.send(process.env.GASLESS_ABI);
}

const erc20abi = async (req, res) => {
    res.send(process.env.MockERC20_ABI);
}

const erc721abi = async (req, res) => {
    res.send(process.env.MockERC721_ABI);
}

app.post("/relay", relayTransaction);
app.get("/gasless-addr", gaslessAddr);
app.get("/gasless-abi", gaslessAbi);
app.get("/erc20-abi", erc20abi);
app.get("/erc721-abi", erc721abi);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
