const { ethers, network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // await deployments.fixture(["all"]);

  // Basic NFT
  const basic = await deployments.get("BasicNFT", deployer);
  const basicNft = await ethers.getContractAt("BasicNFT", basic.address);

  const basicMintTx = await basicNft.mintNft();
  await basicMintTx.wait(1);
  console.log(`Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`);

  // Random IPFS NFT
  const random = await deployments.get("RandomIpfsNft", deployer);
  const randomIpfsNft = await ethers.getContractAt(
    "RandomIpfsNft",
    random.address
  );

  const mintFee = await randomIpfsNft.getMintFee();

  await new Promise(async (resolve, reject) => {
    setTimeout(resolve, 30000);
    randomIpfsNft.once("NftMinted", async () => {
      resolve();
    });

    //

    if (chainId == 31337) {
      console.log("Local network detected......");
      const vrfAddress = await deployments.get("VRFCoordinatorV2Mock");
      const vrfCoordinatorV2Mock = await ethers.getContractAt(
        "VRFCoordinatorV2Mock",
        vrfAddress.address
      );

      await vrfCoordinatorV2Mock.addConsumer(1, randomIpfsNft.target);
      const isConsumerAdded = await vrfCoordinatorV2Mock.consumerIsAdded(
        1,
        random.address
      );
      console.log(isConsumerAdded);

      const randomIpfsMintTx = await randomIpfsNft.requestNft({
        value: mintFee,
      });
      const txReceipt = await randomIpfsMintTx.wait(1);
      console.log(txReceipt.logs[1].args.requestId);

      await vrfCoordinatorV2Mock.fulfillRandomWords(
        txReceipt.logs[1].args.requestId,
        randomIpfsNft.target
      );
      console.log("Done!");
    } else {
      const randomIpfsMintTx = await randomIpfsNft.requestNft({
        value: mintFee,
      });
      // const txReceipt = await randomIpfsMintTx.wait(1);
    }

    console.log(
      `Random IPFS NFT Index 0 has tokenURI: ${await randomIpfsNft.tokenURI(0)}`
    );
  });

  // Dynamic SVG NFT
  const dynamic = await deployments.get("DynamicSvgNft", deployer);
  const dynamicSvgNft = await ethers.getContractAt(
    "DynamicSvgNft",
    dynamic.address
  );
  const highValue = ethers.parseEther("1");

  const dynamicNftMint = await dynamicSvgNft.mintNft(highValue);
  await dynamicNftMint.wait(1);
  console.log(
    `Dynamic NFT index 0 has a tokenURI: ${await dynamicSvgNft.tokenURI(0)}`
  );
};

module.exports.tags = ["all", "mint"];
