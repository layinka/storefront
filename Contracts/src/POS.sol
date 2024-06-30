//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.24;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./StoreFrontNFTReceipt.sol";
import "./Libraries/Errors.sol";


contract POS is Ownable {
    using SafeERC20 for IERC20;
    event OrderCreated( uint indexed orderId, string orderMetadataUrl, address indexed token, uint amount);
    event PurchaseCompleted(address payer, uint orderId, uint receiptTokenId);

    enum OrderTypes{
        Full,
        Quick
    }

    struct Order{
        uint id;
        string metadataUrl;
        uint amount;
        address token;
        address customer;
        bool paid;
        uint date;
        OrderTypes orderType;
    }
    
    string public name; // (Store name).
    address public paymentAddress; // Designated payment address for incoming orders.

    address private admin;
    address private adminPaymentAddress;
    uint adminFee = 100;// 1% percent *100

    Order[] orders;

    uint orderId=0;

    string public ipfsProductLink;
    // Flag to determine whether or not purchase orders can be accepted/emitted from contract.
    bool isOpen; 

    StoreFrontNFTReceipt receiptNFT;

    constructor(string memory _name, address _paymentAddress, address _admin, address _adminPaymentAddress,
        address merchant, string memory _ipfsProductLink, address _receiptNFT) {
        
        name = _name; // A new Salespage should be created if the title changes.
        paymentAddress = _paymentAddress;
        admin=_admin;
        adminPaymentAddress=_adminPaymentAddress;
        ipfsProductLink=_ipfsProductLink;
        isOpen = true;
        receiptNFT=StoreFrontNFTReceipt(_receiptNFT);

        transferOwnership(merchant);
    }

    function toggleOpen() public onlyOwner returns (bool) {
        isOpen = !isOpen;
        return isOpen;
    }

    function setPaymentAddress(address _paymentAddress) public onlyOwner returns (address) {
        paymentAddress = _paymentAddress;
        return paymentAddress;
    }

    function getOrderDetails(uint orderId) public view returns (string memory, uint, address, bool, uint, OrderTypes ) {
        return (orders[orderId].metadataUrl, orders[orderId].amount, orders[orderId].token, orders[orderId].paid, orders[orderId].date, orders[orderId].orderType);
    }

    function startOrder( string memory orderMetadataUrl, address token, uint amount, OrderTypes orderType) public  {
        require(isOpen, "StoreClosed");
        Order memory order = Order({
            token: token,
            amount: amount,
            customer: address(0), //will be set during completeOrder, customer is whoever paid
            metadataUrl: orderMetadataUrl,
            id: orderId,
            paid: false,
            date: block.timestamp,
            orderType: orderType
        });
        orders.push(order);
        emit OrderCreated( orderId, orderMetadataUrl, token, amount);
        
        orderId++;
    }

    function completeOrder(uint orderId) public payable {
        require(isOpen, "StoreClosed");

        Order storage order = orders[orderId];
        require(!order.paid, "PAID");
        order.customer=msg.sender;
        // require(order.customer==msg.sender, "Not Customer");

        if(order.token==address(0)){
            require(msg.value==order.amount, "NotEnoughMoney");
            // if(msg.value != order.amount){
            //     revert(Errors.NotEnoughMoney());
            // }
            payable(paymentAddress).transfer(msg.value- (adminFee*msg.value/10000) );
            payable(adminPaymentAddress).transfer((adminFee*msg.value/10000));
        }else{
            IERC20 token = IERC20(order.token);
            token.safeTransferFrom(order.customer, paymentAddress, order.amount - (adminFee * order.amount /10000));
            token.safeTransferFrom(order.customer, adminPaymentAddress, ( adminFee * order.amount/10000));
            
        }
        
        order.paid=true;

        receiptNFT.safeMint(order.customer, string.concat(order.metadataUrl, "/nft.json"));


        
        emit PurchaseCompleted(msg.sender, orderId, receiptNFT.currentTokenCounter());
    }


    

    

}
