pragma solidity ^0.5.0;

/**
 * @title Seed Factory Interface
 */
interface IFactory {
   function isFactoryTGenerated(address) external view returns(bool);
}
