pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PaymentProcessor {
  address public shopOwnerAddress; // shop address
  IERC20 public dai;

  //emitted by pay(). Intercepted by backend server

  event PaymentDone(
    address payer,
    uint256 amount,
    uint256 paymentId,
    uint256 date
  );

  constructor(address adminAddress, address daiAddress) {
    shopOwnerAddress = adminAddress;
    dai = IERC20(daiAddress);
  }

  function pay(uint256 amount, uint256 paymentId) external {
    dai.transferFrom(msg.sender, shopOwnerAddress, amount);
    emit PaymentDone(msg.sender, amount, paymentId, block.timestamp);
  }
}

