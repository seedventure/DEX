var SeedDex = artifacts.require("./SeedDex.sol");
var SafeMath = artifacts.require("./SafeMath.sol");

var SampleToken = artifacts.require("./test/SampleToken.sol");
var SeedToken = artifacts.require("./test/SampleToken.sol");
var Factory = artifacts.require("./test/Factory.sol");

module.exports = (deployer, network, accounts) => {
    deployer.deploy(SampleToken, 100000000, "SampleToken", 18, "SMPL").then( () => {
      deployer.deploy(SeedToken, 100000000, "SeedToken", 18, "SEED").then( () => {
        deployer.deploy(Factory).then(()=>{
            deployer.deploy(SafeMath);
            deployer.link(SafeMath, SeedDex);
            deployer.deploy(SeedDex, SeedToken.address, Factory.address);
        });
      });
    });
}

