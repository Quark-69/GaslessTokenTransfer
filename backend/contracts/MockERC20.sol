// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract MockERC20 is ERC20, EIP712 {
    // Mapping of nonces for each address
    mapping(address => uint256) public nonces;

    // EIP-712 typehash for the permit function
    bytes32 private constant TYPE_HASH =
        keccak256(
            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) EIP712(name, "1") {
        _mint(msg.sender, initialSupply * (10 ** uint256(decimals())));
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount * (10 ** uint256(decimals())));
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        bytes memory signature
    ) external {
        require(deadline >= block.timestamp, "Permit expired");

        // Construct the digest
        bytes32 structHash = keccak256(
            abi.encode(
                TYPE_HASH,
                owner,
                spender,
                value,
                nonces[owner]++,
                deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        // Recover signer address
        address signer = ECDSA.recover(digest, signature);
        require(signer == owner, "Invalid signature");

        // Approve the spending
        _approve(owner, spender, value);
    }

    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
