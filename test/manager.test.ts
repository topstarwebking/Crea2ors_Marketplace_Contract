// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Crea2ors__factory,
  Crea2orsNFT__factory,
  Crea2orsManager__factory,
  Crea2ors,
  Crea2orsNFT,
  Crea2orsManager,
} from "../types";
import { deployments } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { Ship } from "../utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

chai.use(solidity);
const { expect } = chai;

let ship: Ship;
let crea2: Crea2ors;
let cr2NFT: Crea2orsNFT;
let cr2Manager: Crea2orsManager;
let hre: HardhatRuntimeEnvironment;
let deployer: SignerWithAddress;
let alice: SignerWithAddress;
let bob: SignerWithAddress;
let vault: SignerWithAddress;
const fund = 20;

const setup = deployments.createFixture(async (hre) => {
  ship = await Ship.init(hre);
  const { accounts, users } = ship;
  await deployments.fixture(["init"]);

  return {
    ship,
    accounts,
    users,
  };
});

describe("Crea2ors Manager test", () => {
  before(async () => {
    const scaffold = await setup();

    alice = scaffold.accounts.alice;
    bob = scaffold.accounts.bob;
    vault = scaffold.accounts.vault;
    deployer = scaffold.accounts.deployer;

    crea2 = await scaffold.ship.connect(Crea2ors__factory);
    cr2NFT = await scaffold.ship.connect(Crea2orsNFT__factory);
    cr2Manager = await scaffold.ship.connect(Crea2orsManager__factory);

    expect(await crea2.connect(deployer).balanceOf(deployer.address)).to.equal(
      BigNumber.from(8000000000).mul(BigNumber.from(10).pow(9)),
    );
  });

  describe("init", async () => {
    it("fund to alice & bob", async () => {
      await crea2.connect(deployer).transfer(alice.address, 1000 * 10 ** 9);
      await crea2.connect(deployer).transfer(bob.address, 1000 * 10 ** 9);
    });

    it("nft mint", async () => {
      await crea2.connect(alice).approve(cr2NFT.address, fund);
      await cr2NFT
        .connect(alice)
        .redeem(alice.address, true, 3, "https://github.com", 100, fund, 1, 12, bob.address);
      await crea2.connect(alice).approve(cr2NFT.address, fund);
      await cr2NFT
        .connect(alice)
        .redeem(alice.address, false, 0, "https://github.com", 100, fund, 1, 12, bob.address);

      expect(await cr2NFT.connect(alice).balanceOf(alice.address, 0)).to.equal(2);
    });
  });

  describe("Lending a NFT test", async () => {
    before(async () => {
      // expect(await rooster.balanceOf(alice.address)).to.eq(4);
      // expect(await rooster.totalSupply()).to.eq(4);

      // expect(await rooster.ownerOf(nftId)).to.eq(alice.address);
      // Give opertor approval
      await cr2Manager.addCollection(cr2NFT.address);
      // await rooster.connect(alice).approve(scholarship.address, true);
    });

    it("transfer NFT", async () => {
      await crea2.connect(bob).approve(cr2Manager.address, fund);
      await cr2NFT.connect(alice).setApprovalForAll(cr2Manager.address, true);
      await cr2Manager.connect(bob).transferNFT(cr2NFT.address, alice.address, bob.address, 0, 1, fund);
      expect(await cr2NFT.connect(bob).balanceOf(bob.address, 0)).to.equal(1);
    });
  });
});
