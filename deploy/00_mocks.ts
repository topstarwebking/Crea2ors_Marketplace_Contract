import { DeployFunction } from "hardhat-deploy/types";
import { Crea2orsNFT__factory, Crea2ors__factory, Crea2orsManager__factory } from "../types";
import { toWei, Ship } from "../utils";

const func: DeployFunction = async (hre) => {
  const { deploy, users, accounts } = await Ship.init(hre);
  const token = await deploy(Crea2ors__factory);
  const nft = await deploy(Crea2orsNFT__factory, {
    args: ["CREA@ORs", "CR2NFT", "sdlfkjdsf", 10, token.address],
  });
  const manager = await deploy(Crea2orsManager__factory, { args: [token.address] });
};

export default func;
func.tags = ["init"];
