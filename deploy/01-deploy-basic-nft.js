const { deployments, getNamedAccounts, network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async function () {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  const chainId = network.config.chainId;
  console.log(chainId);

  console.log("Deploying NFT........");
  const BasicNFT = await deploy("BasicNFT", {
    from: deployer,
    args: [],
    log: true,
  });
  console.log(`Deployed contract at ${BasicNFT.address}`);

  if (chainId != 31337) {
    await verify(BasicNFT.address, []);
    log("verified........");
  }
};

module.exports.tags = ["all", "basicNFT"];
