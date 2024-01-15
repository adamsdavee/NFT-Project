const { network } = require("hardhat");
const { DECIMALS, INITIAL_PRICE } = require("../helper-hardhat-config");

const BASE_FEE = ethers.parseEther("0.25"); // costs 0.20 per request
const GAS_PRICE_LINK = 1e9; // It is a calculated value based of the gas price of the chain

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { log, deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [BASE_FEE, GAS_PRICE_LINK];
  const chainId = network.config.chainId;

  if (chainId == 31337) {
    log("Local network detected! Deploying Mocks...........");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args,
    });

    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });

    log("Mocks Deployed!");
    log("------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
