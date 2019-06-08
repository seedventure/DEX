# SeedDex's Smart Contract

This is the official repository for all things regarding the Seed Dex smart contract.  
All contracts are located in the `contracts` folder.
This is a fork of ForkDelta ( https://github.com/forkdelta/ ) Exchange.

## Development

### Setting up a development environment
Requirements:
* Node.js (https://nodejs.org/en/)
* git client (https://git-scm.com/download/)

Setup:
1. Install truffle: `npm install -g truffle`
2. On Windows install the necessary build tools: `npm install --global --production windows-build-tools`
3. Install Ganache from: http://truffleframework.com/ganache/
4. Clone the repo: git clone https://github.com/forkdelta/smart_contract.git
5. Change into the root directory: `cd DEX`
6. Install all node.js requirements from package.json: `npm install`
7. If you use VSCode, copy `.vscode\settings.json.default` to `.vscode\settings.json` for a reasonable solhint linter configuration

### Migrating and testing with Ganache
* Start ganache
* Compile: `truffle compile`
* Migrate: `truffle migrate`
* Run test cases: `truffle test`

### Migrating and testing with truffle develop
* `truffle develop`
* Compile: `compile`
* Migrate: `migrate`
* Run test cases: `test`

### Migrating to the live/production chain
* Edit "live" section in `truffle.js`:
* Set reasonable gas price based on https://ethgasstation.info
* Start local ethereum node (geth/parity) and set connection parameters in `truffle.js` 
* Set/verify creation parameter for Seed Dex contract in `./migrations/2_deploy_contracts_js`  
* Unlock account in geth/parity that is used for deploying the contract (first account or the one specified with "from" in `truffle.js`)
* `truffle migrate -network=live`

## Libraries

### library `LSafeMath`

This is a library for math operations with safety checks that will throw on error.

## Contracts

### contract `Seed Dex`

This is the main contract for the Seed Dex exchange.  
This contract uses the LSafeMath library for uint variables.  

#### `Seed Dex` Variables

__depositingTokenFlag__ `bool private depositingTokenFlag`  
True when Token.transferFrom is being called from depositToken

__tokens__ `mapping (address => mapping (address => uint)) public tokens`  
The mapping of token addresses to mapping of account balances (token=0 means Ether)

__orders__ `mapping (address => mapping (bytes32 => bool)) public orders`  
The mapping of user accounts to mapping of order hashes to booleans (true = submitted by user, equivalent to offchain signature)

__orderFills__ `mapping (address => mapping (bytes32 => uint)) public orderFills;`  
The mapping of user accounts to mapping of order hashes to uints (amount of order that has been filled)

__seedToken__ `address public;` 
address of the SEED token

__factoryAddress__ `address public;`
address of the Seed Factory


#### `Seed Dex` Events

##### `event Order(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user);`
##### `event Cancel(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s);`
##### `event Trade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, address get, address give);`
##### `event Deposit(address token, address user, uint amount, uint balance);`
##### `event Withdraw(address token, address user, uint amount, uint balance);`
##### `event FundsMigrated(address user, address newContract);`

#### `Seed Dex` Modifiers

#### `modifier isAdmin()`
This is a modifier for functions to check if the sending user address is the same as the admin user address.

#### `Seed Dex` Functions

#### `function Seed Dex(address admin_, address seedToken, address factoryAddress) public`
Constructor function. This is only called on contract creation.

#### `function() public`
The fallback function. Ether transfered into the contract is not accepted.

#### `function deposit() public payable`
This function handles deposits of Ether into the contract.  
Emits a Deposit event.  
Note: With the payable modifier, this function accepts Ether.  

#### `function withdraw(uint amount) public`
This function handles withdrawals of Ether from the contract.  
Verifies that the user has enough funds to cover the withdrawal.  
Emits a Withdraw event.  
@param amount uint of the amount of Ether the user wishes to withdraw  
  
#### `function depositToken(address token, uint amount) public`
This function handles deposits of Ethereum based tokens to the contract.  
Does not allow Ether.  
If token transfer fails, transaction is reverted and remaining gas is refunded.  
Emits a Deposit event.  
Note: Remember to call Token(address).approve(this, amount) or this contract will not be able to do the transfer on your behalf.  
@param token Ethereum contract address of the token or 0 for Ether  
@param amount uint of the amount of the token the user wishes to deposit  

#### `function tokenFallback( address sender, uint amount, bytes data) public returns (bool ok)`
This function provides a fallback solution as outlined in ERC223.  
If tokens are deposited through depositToken(), the transaction will continue.  
If tokens are sent directly to this contract, the transaction is reverted.  
@param sender Ethereum address of the sender of the token  
@param amount amount of the incoming tokens  
@param data attached data similar to msg.data of Ether transactions  
  
#### `function withdrawToken(address token, uint amount) public`
This function handles withdrawals of Ethereum based tokens from the contract.  
Does not allow Ether.  
If token transfer fails, transaction is reverted and remaining gas is refunded.  
Emits a Withdraw event.  
@param token Ethereum contract address of the token or 0 for Ether  
@param amount uint of the amount of the token the user wishes to withdraw  

#### `function balanceOf(address token, address user) public constant returns (uint)`
Retrieves the balance of a token based on a user address and token address.  
@param token Ethereum contract address of the token or 0 for Ether  
@param user Ethereum address of the user  
@return the amount of tokens on the exchange for a given user address  

#### `function order(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce) public`
Stores the active order inside of the contract.  
Emits an Order event.  
Note: tokenGet & tokenGive can be the Ethereum contract address.  
@param tokenGet Ethereum contract address of the token to receive  
@param amountGet uint amount of tokens being received  
@param tokenGive Ethereum contract address of the token to give  
@param amountGive uint amount of tokens being given  
@param expires uint of block number when this order should expire  
@param nonce arbitrary random number  

#### `function trade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s, uint amount) public`
Facilitates a trade from one user to another.  
Requires that the transaction is signed properly, the trade isn't past its expiration, and all funds are present to fill the trade.  
Calls tradeBalances().  
Updates orderFills with the amount traded.  
Emits a Trade event.  
Note: tokenGet & tokenGive can be the Ethereum contract address.  
Note: amount is in amountGet / tokenGet terms.  
@param tokenGet Ethereum contract address of the token to receive  
@param amountGet uint amount of tokens being received  
@param tokenGive Ethereum contract address of the token to give  
@param amountGive uint amount of tokens being given  
@param expires uint of block number when this order should expire  
@param nonce arbitrary random number  
@param user Ethereum address of the user who placed the order  
@param v part of signature for the order hash as signed by user  
@param r part of signature for the order hash as signed by user  
@param s part of signature for the order hash as signed by user  
@param amount uint amount in terms of tokenGet that will be "buy" in the trade  
  
#### `function tradeBalances(address tokenGet, uint amountGet, address tokenGive, uint amountGive, address user, uint amount) private`
This is a private function and is only being called from trade().  
Handles the movement of funds when a trade occurs.  
Takes fees.  
Updates token balances for both buyer and seller.  
Note: tokenGet & tokenGive can be the Ethereum contract address.  
Note: amount is in amountGet / tokenGet terms.  
@param tokenGet Ethereum contract address of the token to receive  
@param amountGet uint amount of tokens being received  
@param tokenGive Ethereum contract address of the token to give  
@param amountGive uint amount of tokens being given  
@param user Ethereum address of the user who placed the order  
@param amount uint amount in terms of tokenGet that will be "buy" in the trade  
  
#### `function testTrade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s, uint amount, address sender) public constant returns(bool)`
This function is to test if a trade would go through.  
Note: tokenGet & tokenGive can be the Ethereum contract address.  
Note: amount is in amountGet / tokenGet terms.  
@param tokenGet Ethereum contract address of the token to receive  
@param amountGet uint amount of tokens being received  
@param tokenGive Ethereum contract address of the token to give  
@param amountGive uint amount of tokens being given  
@param expires uint of block number when this order should expire  
@param nonce arbitrary random number  
@param user Ethereum address of the user who placed the order  
@param v part of signature for the order hash as signed by user  
@param r part of signature for the order hash as signed by user  
@param s part of signature for the order hash as signed by user  
@param amount uint amount in terms of tokenGet that will be "buy" in the trade  
@param sender Ethereum address of the user taking the order  
@return bool: true if the trade would be successful, false otherwise  
  
#### `function availableVolume(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s) public constant returns(uint)`
This function checks the available volume for a given order.  
Note: tokenGet & tokenGive can be the Ethereum contract address.  
@param tokenGet Ethereum contract address of the token to receive  
@param amountGet uint amount of tokens being received  
@param tokenGive Ethereum contract address of the token to give  
@param amountGive uint amount of tokens being given  
@param expires uint of block number when this order should expire  
@param nonce arbitrary random number  
@param user Ethereum address of the user who placed the order  
@param v part of signature for the order hash as signed by user  
@param r part of signature for the order hash as signed by user  
@param s part of signature for the order hash as signed by user  
@return uint: amount of volume available for the given order in terms of amountGet / tokenGet  
  
#### `function amountFilled(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s) public constant returns(uint)`
This function checks the amount of an order that has already been filled.  
Note: tokenGet & tokenGive can be the Ethereum contract address.  
@param tokenGet Ethereum contract address of the token to receive  
@param amountGet uint amount of tokens being received  
@param tokenGive Ethereum contract address of the token to give  
@param amountGive uint amount of tokens being given  
@param expires uint of block number when this order should expire  
@param nonce arbitrary random number  
@param user Ethereum address of the user who placed the order  
@param v part of signature for the order hash as signed by user  
@param r part of signature for the order hash as signed by user  
@param s part of signature for the order hash as signed by user  
@return uint: amount of the given order that has already been filled in terms of amountGet / tokenGet  
  
#### `function cancelOrder(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, uint8 v, bytes32 r, bytes32 s) public`
This function cancels a given order by editing its fill data to the full amount.  
Requires that the transaction is signed properly.  
Updates orderFills to the full amountGet  
Emits a Cancel event.  
Note: tokenGet & tokenGive can be the Ethereum contract address.  
@param tokenGet Ethereum contract address of the token to receive  
@param amountGet uint amount of tokens being received  
@param tokenGive Ethereum contract address of the token to give  
@param amountGive uint amount of tokens being given  
@param expires uint of block number when this order should expire  
@param nonce arbitrary random number  
@param user Ethereum address of the user who placed the order  
@param v part of signature for the order hash as signed by user  
@param r part of signature for the order hash as signed by user  
@param s part of signature for the order hash as signed by user  
@return uint: amount of the given order that has already been filled in terms of amountGet / tokenGet  

