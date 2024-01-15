const { getNamedAccounts, deployments } = require("hardhat");
const { assert } = require("chai");

describe("BasicNFT", function () {
  let deployer;
  let basicNft;

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    // await deployments.fixture(["mocks", "basicNFT"]);

    const NFT = await deployments.get("BasicNFT", deployer);
    basicNft = await ethers.getContractAt("BasicNFT", NFT.address);

    console.log(`Contract gotten at: ${basicNft.target}`);
  });

  describe("sets constructor correctly", function () {
    it("sets name and symbol correctly", async function () {
      const name = await basicNft.name();
      const symbol = await basicNft.symbol();
      const tokenIdCount = await basicNft.getTokenCounter();

      assert.equal(name, "Doggie");
      assert.equal(symbol, "DOG");
      assert.equal(tokenIdCount, 0);
    });
  });

  describe("Mint NFT", function () {
    it("Allows users to mint NFT's and updates appropraitely", async function () {
      const tx = await basicNft.mintNft();
      const txTwo = await basicNft.mintNft();
      txTwo.wait();
      const tokenCounter = await basicNft.getTokenCounter();
      const tokenURI = await basicNft.tokenURI(0);
      console.log(tokenURI);
      assert.equal(tokenCounter, 2);
      assert.equal(
        tokenURI,
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"
      );
    });

    it("shows the correct balance and owner of an NFT", async function () {
      const tx = await basicNft.mintNft();
      await basicNft.mintNft();
      await basicNft.mintNft();
      const owner = await basicNft.ownerOf(0);
      const balance = await basicNft.balanceOf(deployer);

      assert.equal(owner, deployer);
      assert.equal(balance, 3);
    });
  });
});
