// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;
import "./POS.sol";

contract POSFactory{

    event POSCreated(address merchant, address posAddress);
    
    mapping(address => address[]) public ownerAddresses;

    uint public posCount;

    address private adminPaymentAddress;

    address owner;

    address public receiptNFT;

    constructor(address _receiptNFT){
        owner=msg.sender;
        adminPaymentAddress=owner;
        receiptNFT=_receiptNFT;
    }


    // @Todo - Support a single address creating diff sales pages - to support multistore locations etc
    function createPOS(string memory _name, address _paymentAddress, string memory _ipfsProductLink) public {

        // require(ownerAddresses[msg.sender]==address(0), 'AlreadyRegistered');
        
        POS pos = new POS(_name, _paymentAddress, address(this), adminPaymentAddress,  msg.sender, _ipfsProductLink, receiptNFT);
        address posAddress = address(pos);
        
        ownerAddresses[msg.sender].push(posAddress);
        emit POSCreated(msg.sender, posAddress);
        posCount++;       

    }

    

   

    function  getOwnerPOSAddresses(address _owner) public view returns(address[] memory) {
        return ownerAddresses[_owner];
    }

    function  changePaymentAddress(address _adminPaymentAddress) public  {
        require(msg.sender==owner, 'OnlyOwner');
        adminPaymentAddress = _adminPaymentAddress;
    }

    function  changeOwner(address newOwner) public  {
        require(msg.sender==owner, 'OnlyOwner');
        owner = newOwner;
    }

    


}