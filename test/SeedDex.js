
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');

var SeedDexContract = artifacts.require("./SeedDex.sol");
var SampleTokenContract = artifacts.require("./test/SampleToken.sol");

const ether=1000000000000000000;
const gwei =1000000000;

contract('SeedDex', accounts => {

    let dex;
    let seed;
    let tokenA;
    let tokenB;
    let userA;
    let userB;
    let nonce;

   // define starting point
   beforeEach(async () => {
    dex = await SeedDexContract.deployed();
    seed = await SampleTokenContract.deployed();
    tokenA = await SampleTokenContract.new(1000,"TokenA",4,"TKA");
    tokenB = await SampleTokenContract.new(1000,"TokenB",4,"TKB");
    userA = accounts[1];
    userB = accounts[2];
    nonce = 0;
   });

   // Test positive scenario
   it("ensure tokens are deployed correctly", async () => {
        assert.equal(1000, await tokenA.totalSupply());
        assert.equal(1000, await tokenA.balanceOf(accounts[0]));
   });

   it("deposit token to dex", async () => {
        _grantFunds(userA, tokenA, 10);
        _deposit(userA, tokenA, 10);
   });


   it("allow trades of token A and token B", async () => {
        _grantFunds(userA, tokenA, 100);
        _grantFunds(userB, tokenB, 100);

        _deposit(userA, tokenA, 10);
        _deposit(userB, tokenB, 10);

        _order(userA, tokenB, 1, tokenA, 1);
        _trade(userB, tokenB, 1, tokenA, 10, userA, 1);

   });


   // Helper Functions
   let _deposit = async (user, token, amt) => {

        _allow(user, token, amt, dex.address);

        let res = await dex.depositToken(tokenA.address, 10, {from: user});
        assert.isTrue(res.receipt.status);

        assert.equal(10, await dex.balanceOf.call(token.address, user));
   }

   let _allow = async(user, token, amt, addr) => {
        let res = await token.approve(addr, 10, {from: user});

        /*truffleAssert.eventEmitted(res, "Approval", (e) => {
            return e.from == accounts[0] && e.to == user && e.value.toNumber() == amt
        });*/

        assert.equal(10, await token.allowance.call(user, addr));
   }

   let _order = async (user, tokenGet, amountGet, tokenGive, amountGive) => {
        let exp = 10000;
        nonce += 1;
        let res = await dex.order(tokenGet, amountGet, tokenGive, amountGive, exp, nonce, {from: user});
        truffleAssert.eventEmitted(res, "Order", (e) => {
            return false
        });
   }

   let _trade = async (user, tokenGet, amountGet, tokenGive, amountGive, maker, amount) => {
        let exp = 10000;
        nonce += 1;
        let res = await dex.trade(tokenGet, amountGet, tokenGive, amountGive, exp, nonce,  maker, 0, 0, 0, amount, {from: user});
        assert.isTrue(res.receipt.status);
   }

   let _grantFunds = async (user, token, amt) => {
        let res = await token.transfer(user, amt, {from: accounts[0]});
        truffleAssert.eventEmitted(res, "Transfer", (e) => {
            return e.from == accounts[0] && e.to == user && e.value.toNumber() == amt
        });
   }

});
