// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransferFailed();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF helpers
    mapping(uint256 => address) public s_requestIdToSender;

    // NFT variables
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenUris;
    uint256 internal immutable i_mintFee;

    // Events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed dogBreed, address minter);

    constructor(
        address vrfCoordinator,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory dogTokenUris,
        uint256 mintFee
    )
        VRFConsumerBaseV2(vrfCoordinator)
        ERC721("Random IPFS NFT", "RIN")
        Ownable(msg.sender)
    {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_dogTokenUris = dogTokenUris;
        i_mintFee = mintFee;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) revert RandomIpfsNft__NeedMoreETHSent();
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;

        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address dogOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;

        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        s_tokenCounter++;
        _safeMint(dogOwner, newTokenId);
        _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]);

        emit NftMinted(dogBreed, msg.sender);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert RandomIpfsNft__TransferFailed();
    }

    function getBreedFromModdedRng(
        uint256 moddedRng
    ) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (
                moddedRng >= cumulativeSum &&
                moddedRng < cumulativeSum + chanceArray[i]
            ) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    // Trying to create different rarities for the diff NFT's
    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
        // index 1 has a 10% chance of happening (PUG NFT)
        // index 2 has a 30 - 10 = 20% chance of happening (SHIBA_INU NFT)
        // index 3 has a 100 - (30 + 10) = 60% chance of happening (St.Bernard NFT)
    }

    // function tokenURI(uint256) public view override returns (string memory) {} don't need it again

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenUri(uint256 index) public view returns (string memory) {
        return s_dogTokenUris[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getVrfCoordinator()
        public
        view
        returns (VRFCoordinatorV2Interface)
    {
        return i_vrfCoordinator;
    }

    function getArrayOfDogs() public view returns (string[] memory) {
        return s_dogTokenUris;
    }
}
