// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract GaslessTokenTransfer{
    using ECDSA for bytes32;

    enum TokenType { ERC20, ERC721 }

    struct TransferRequest {
        TokenType tokenType;
        address tokenContract;
        address from;
        address to;
        uint256 value;
        uint256 nonce;
        uint256 chainId;
    }

    mapping(address => uint256) private nonces;

    /**
     * @dev Perform a gasless token transfer via meta-transaction
     * @param request Transfer request details
     * @param signature Signature from the sender authorizing the transfer
     */
    function metaTransfer(
        TransferRequest memory request, 
        bytes memory signature
    ) external {

        // Ensure the nonce is valid and not used
        require(nonces[request.from] == request.nonce, "Invalid nonce");

        // Create the hash of the transaction details
        bytes32 messageHash = keccak256(abi.encodePacked(
            request.tokenType,
            request.tokenContract,
            request.from, 
            request.to, 
            request.value, 
            request.nonce,
            block.chainid
        ));

        address signer = ECDSA.recover(
            MessageHashUtils.toEthSignedMessageHash(messageHash),
            signature
        );

        require(signer == request.from, "Invalid signature");

        nonces[request.from]++;

        if (request.tokenType == TokenType.ERC20) {
            // ERC20 transfer
            IERC20 token = IERC20(request.tokenContract);
            require(token.transferFrom(request.from, request.to, request.value), "ERC20 transfer failed");
        } else {
            // ERC721 transfer
            IERC721 token = IERC721(request.tokenContract);
            token.transferFrom(request.from, request.to, request.value);
        }
    }
}