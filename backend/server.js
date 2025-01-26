require('dotenv').config({ path: '.env' });
const { ethers } = require('ethers');
const express = require('express');
const app = express();
const port = 3000;

// Access environment variables
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractAbi = JSON.parse(Buffer.from(process.env.CONTRACT_ABI, "base64").toString("utf-8"));

// Setup ethers
const provider = new ethers.JsonRpcProvider(`https://holesky.infura.io/v3/${infuraProjectId}`);
// Connect to the smart contract
const contract = new ethers.Contract(contractAddress, contractAbi, provider);

// Example API endpoint to interact with the smart contract
app.get('/api/contract-data', async (req, res) => {
    try {
        const data = await contract.yourContractMethod();
        res.json(data);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

