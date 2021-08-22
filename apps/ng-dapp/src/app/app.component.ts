import { Component, OnInit } from '@angular/core';
import { ethers, providers, Contract } from 'ethers';
import PaymentProcessor from '../../artifacts/contracts/PaymentProcessor.sol/PaymentProcessor.json';
import Dai from '../../artifacts/contracts/Dai.sol/Dai.json';
import { BackendService } from '../shared/services/backend.service';

declare const window: any;
const pp_address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const dai_address = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';


@Component({
  selector: 'soko-bora-crypto-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  ITEMS = [
    {
      id: 1,
      price: ethers.utils.parseEther('1')
    },
    {
      id: 2,
      price: ethers.utils.parseEther('3')
    },
  ]

  title = 'ng-dapp';

  downloadUrl = 'Choose a product to download';

  contracts: any = [];

  constructor(private backendService: BackendService) { }

  ngOnInit() {
    window.addEventListener('load', async () => {
      if (window.ethereum) {
        await window.ethereum.enable();
        const provider = new providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const paymentProcessor = new Contract(
          pp_address,
          PaymentProcessor.abi,
          signer
        );
        this.contracts.push(paymentProcessor)

        const dai = new Contract(
          dai_address,
          Dai.abi,
          signer
        );
        this.contracts.push(dai)
      }
    });
  }

  async buy(n: number) {
    // first call to service to create 'paid:false' entry in DB
    this.backendService.getPaymentId(this.ITEMS[n].id.toString())
      .subscribe(async res => {

        const [paymentProcessor, dai] = this.contracts;
        //the buyer needs to approve that the contract spends his/her money
        const tx1 = await dai(paymentProcessor.address, this.ITEMS[n].price);
        await tx1.wait();

        //buyer pays. Contract emits event. In the meantime backend intercepts
        //event and sets 'paid:true' in DB
        const tx2 = await paymentProcessor.pay(this.ITEMS[n].price, res.paymentId);
        await tx2.wait();

        // we need some time to complete the transactions
        await new Promise(resolve => setTimeout(resolve, 5000));

        //second call to service. Returns the downloadable Url
        this.backendService.getDownloadableUrl(res.paymentId)
          .subscribe(r => {
            this.downloadUrl = r.url
          })
      });
  }

}
