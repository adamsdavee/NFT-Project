const { getNamedAccounts, deployments } = require("hardhat");
const { assert, expect } = require("chai");

describe("RandomIpfsNft", function () {
  let deployer, randomIpfsNft, VRFMock, vrfCoordinatorV2Mock;

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    // await deployments.fixture(["mocks", "randomIpfs"]); after deploying to the localhost

    const randomNft = await deployments.get("RandomIpfsNft", deployer);
    randomIpfsNft = await ethers.getContractAt(
      "RandomIpfsNft",
      randomNft.address
    );

    VRFMock = await deployments.get("VRFCoordinatorV2Mock", deployer);

    vrfCoordinatorV2Mock = await ethers.getContractAt(
      "VRFCoordinatorV2Mock",
      VRFMock.address
    );

    console.log(`Contract deployed at ${randomIpfsNft.target}`);
  });

  describe("sets contructor correctly", function () {
    it("sets parameters correctly", async function () {
      const vrfResponse = await randomIpfsNft.getVrfCoordinator();
      const dogArray = await randomIpfsNft.getArrayOfDogs();
      console.log(dogArray);
      const dogURI = [
        "ipfs://QmYwFaSdqj7NuqVDWmdyQjUkhWwK158ybnWHqWLbCFTMJP",
        "ipfs://QmSy5X6641zp7xwhMX1kAG1ixja2HU86tCQpRBmcPXA6bf",
        "ipfs://QmNWSTd4bfkWWFmCF21N49Par1TKzAfcCY6ES7DofdfwKj",
      ];

      assert.equal(vrfResponse, VRFMock.address);
      // assert.equal(dogArray, dogURI);
    });
  });

  describe("requestNft", function () {
    it("fails if payment isn't sent with request", async function () {
      await expect(randomIpfsNft.requestNft()).to.be.revertedWithCustomError(
        randomIpfsNft,
        "RandomIpfsNft__NeedMoreETHSent"
      );
    });

    it("reverts when payment is less than the mint fee", async function () {
      const mintFee = ethers.parseEther("0.001");
      await expect(
        randomIpfsNft.requestNft({
          value: mintFee,
        })
      ).to.be.revertedWithCustomError(
        randomIpfsNft,
        "RandomIpfsNft__NeedMoreETHSent"
      );
    });

    it("emits an event and kick of a random word request", async function () {
      const mintFee = await randomIpfsNft.getMintFee();

      await expect(randomIpfsNft.requestNft({ value: mintFee })).to.emit(
        randomIpfsNft,
        "NftRequested"
      );
    });
  });

  describe("fufill random words", function () {
    console.log("Hmmm");
    it("mints nft after random number is returned", async function () {
      await new Promise(async (resolve, reject) => {
        randomIpfsNft.once("NftMinted", async () => {
          console.log("Found event!");

          try {
            const tokenUri = await randomIpfsNft.tokenURI("0");
            const tokenCounter = await randomIpfsNft.getTokenCounter();
            assert.equal(tokenUri.toString().includes("ipfs://"), true);
            assert.equal(tokenCounter, 1);
            resolve();
          } catch (e) {
            reject(e);
          }
        });
        console.log("Hiii");
        await vrfCoordinatorV2Mock.addConsumer(1, randomIpfsNft.target);
        const isConsumerAdded = await vrfCoordinatorV2Mock.consumerIsAdded(
          1,
          randomIpfsNft.target
        );
        console.log(isConsumerAdded);
        const mintFee = await randomIpfsNft.getMintFee();
        const tx = await randomIpfsNft.requestNft({
          value: mintFee,
        });

        const txReceipt = await tx.wait();
        console.log(txReceipt.logs[1].args.requestId);
        console.log("HMMMMMMMMMMMMMMMMMMMMMMMMM");
        // console.log(txReceipt.logs[1].topics[1]);
        console.log(randomIpfsNft.target);
        const subscription = await vrfCoordinatorV2Mock.getSubscription(1);
        console.log(subscription);

        await vrfCoordinatorV2Mock.fulfillRandomWords(
          txReceipt.logs[1].args.requestId,
          randomIpfsNft.target // not randomIpfsNft.address
        );
        console.log("Done?");
      });
    });
  });

  describe("get Breed from moddedRng", function () {
    it("should return pug if moddedRng is < 10", async function () {
      const expectedValue = await randomIpfsNft.getBreedFromModdedRng(0);
      console.log(expectedValue);
      assert.equal(0, expectedValue);
    });
    it("should return SHIBA_INU if moddedRng >= 10 && < 40", async function () {
      const expectedValue = await randomIpfsNft.getBreedFromModdedRng(10);
      assert.equal(1, expectedValue);
    });
    it("should return ST_BERNARD if moddedRng is >= 40 && <= 100", async function () {
      const expectedValue = await randomIpfsNft.getBreedFromModdedRng(100);
      console.log(expectedValue);
      assert.equal(2, expectedValue);
    });
    it("should revert if moddedRng is > 100", async function () {
      await expect(
        randomIpfsNft.getBreedFromModdedRng(140)
      ).to.be.revertedWithCustomError(
        randomIpfsNft,
        "RandomIpfsNft__RangeOutOfBounds"
      );
    });
  });
});
