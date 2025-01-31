// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./MockERC20.sol";
import "./MockERC721.sol";

contract GaslessTokenTransfer {

    enum TokenType {
        ERC20,
        ERC721
    }

    struct TransferRequest {
        TokenType tokenType;
        address tokenContract;
        address from;
        address to;
        uint256 value;
        uint256 deadline;
    }

    function metaTransfer(
        TransferRequest memory request,
        bytes memory signature
    ) external {

        if(request.tokenType == TokenType.ERC20)
        {
            // ERC20 transfer
            MockERC20 token = MockERC20(request.tokenContract);
            token.permit(
                request.from,
                address(this),
                request.value,
                request.deadline,
                signature
            );
            require(
                token.transferFrom(request.from, request.to, request.value),
                "ERC20 transfer failed"
            );
        }
        else
        {
            // ERC721 transfer
            MockERC721 token = MockERC721(request.tokenContract);
            token.permit(
                address(this),
                request.value,
                request.deadline,
                signature
            );
            
            token.safeTransferFrom(request.from, request.to, request.value);
        }
    }

    function getChainId() external view returns (uint256) {
        return block.chainid;
    }
}
