const { deployments, getNamedAccounts, network } = require("hardhat");
const { verify } = require("../utils/verify");
const { networkConfig } = require("../helper-hardhat-config");
const fs = require("fs");

module.exports = async function () {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  await deployments.fixture(["mocks"]);

  const chainId = network.config.chainId;
  let priceFeedAddress;

  if (chainId == 31337) {
    priceFeedAddress = await deployments.get("MockV3Aggregator");
    console.log(`Testnet chain: ${priceFeedAddress.address}`);
  } else {
    priceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const lowSvg = await fs.readFileSync("./images/dynamicNft/frown.svg", {
    encoding: "utf-8",
  });

  const highSvg = await fs.readFileSync("./images/dynamicNft/happy.svg", {
    encoding: "utf-8",
  });

  const args = [priceFeedAddress.address, lowSvg, highSvg];

  console.log("Deploying Dynamic SVG NFT........");
  const DynamicNft = await deploy("DynamicSvgNft", {
    from: deployer,
    args: args,
    log: true,
  });
  console.log(`Deployed contract at ${DynamicNft.address}`);

  if (chainId != 31337) {
    await verify(DynamicNft.address, []);
    log("verified........");
  }
};

module.exports.tags = ["all", "DynamicNft"];
