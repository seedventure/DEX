pragma solidity ^0.5.0;

import "../IFactory.sol";
/**
 * @title Dumb Factory for testing purpose
 */

contract Factory is IFactory {

        /**
         * Test function, return false only for address 0x123456 
         */
        function isFactoryTGenerated(address token) external view returns(bool){
                if( token == address(0x123456) ) return false;
                return true;
        }

}
