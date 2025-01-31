// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract MockERC721 is ERC721, EIP712 {
    uint256 private _lastTokenId;

    // Mapping of nonces for each address
    mapping(uint256 => uint256) public nonces;

    // EIP-712 typehash for the permit function
    bytes32 private constant TYPE_HASH =
        keccak256("Permit(address spender,uint256 tokenId,uint256 nonce,uint256 deadline)");

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) EIP712(name, "1") {}

    function mint() public {
        _mint(msg.sender, ++_lastTokenId);
    }

    function permit(
        address spender,
        uint256 tokenId,
        uint256 deadline,
        bytes memory signature
    ) external {
        require(deadline >= block.timestamp, "Permit expired");

        // Construct the digest
        bytes32 structHash = keccak256(
            abi.encode(
                TYPE_HASH,
                spender,
                tokenId,
                nonces[tokenId]++,
                deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        // Recover signer address
        address signer = ECDSA.recover(digest, signature);

        require(signer == ownerOf(tokenId), "Invalid signature");

        // Approve the spending
        _approve(spender, tokenId, signer);
    }

    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
