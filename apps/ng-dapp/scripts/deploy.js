// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const [deployer, buyer] = await hre.ethers.getSigners();
  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());
  const daiFactory = await hre.ethers.getContractFactory("Dai");
  const daiContract = await daiFactory.deploy();
  console.log("Dai Contract address:", daiContract.address);


  await daiContract.faucet(buyer.address, hre.ethers.utils.parseEther('5000'));
  const balance = await daiContract.balanceOf(buyer.address)
  console.log("Buyer's DAI balance:", hre.ethers.utils.formatEther(balance))

  const ppFactory = await hre.ethers.getContractFactory("PaymentProcessor");
  const paymentProcessor = await ppFactory.deploy(deployer.address, daiContract.address);
  console.log("PaymentProcessor's Address", paymentProcessor.address)


  console.log("Shop Owner's Address", deployer.address)
  console.log("Buyer Address", buyer.address)
}
main()
  .then(() => process.exit(0))
  .catch(
    error => {
      console.error(error);
      process.exit(1);
    }
  );
