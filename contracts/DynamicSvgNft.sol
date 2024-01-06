// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol"; // Used for the conversion of SVG to base64 uri using --dev base64-sol

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private i_highSvg;
    string private i_lowSvg;
    string private constant base64Prefix = "data:image/svg+xml;base64,";

    constructor(
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG Nft", "DSN") {
        s_tokenCounter = 0;
        i_lowSvg = lowSvg;
        i_highSvg = highSvg;
    }

    function svgToUri(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return string(abi.encodePacked(base64Prefix, svgBase64Encoded)); // From a high level this how to concantenate strings together
    }

    function mintNft() external {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
    }
}
