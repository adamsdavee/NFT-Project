require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");
require("hardhat-deploy");
// require("@nomicfoundation/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.19",

  defaultNetwork: "hardhat",
  networks: {
    // bsc: {
    //   url: BSC_RPC_URL,
    //   accounts: [PRIVATE_KEY],
    //   chainId: 97,
    //   // blockConfirmations: 6,
    // },
    // sepolia: {
    //   url: SEPOLIA_RPC_URL,
    //   accounts: [PRIVATES_KEY],
    //   chainId: 11155111,
    //   blockConfirmations: 6,
    // },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },

  solidity: {
    compilers: [
      { version: "0.8.19" },
      { version: "0.8.20" },
      { version: "0.6.6" },
    ],
  },

  // etherscan: {
  //   apiKey: {
  //     bscTestnet: BSCSCAN_API_KEY,
  //   },
  // },

  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },
};
