/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';


const app = express();
app.use(cors())
import ethers  from 'ethers';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import PaymentProcessor from '../../ng-dapp/artifacts/contracts/PaymentProcessor.sol/PaymentProcessor.json';
import { Payment }  from './app/db'



app.get('/api/v2', (req, res) => {
  res.send({ message: 'Welcome to express-api!' });
});


let paymentId = 300;

app.get('/api/v2/getPaymentId/:id', async function (req, res) {
  paymentId++;
  await Payment.create(
    {
      id: paymentId,
      itemId: req.params.id,
      paid: false
    }
  );
  res.json({ paymentId })
});


const contract_address_local = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" //local
const listenEvents = async () => {
  const provider = await new ethers.providers.JsonRpcProvider('http://localhost:8545');
  const paymentProcessor = await new ethers.Contract(contract_address_local,
    (await PaymentProcessor).abi,
    provider);
  paymentProcessor.on('PaymentDone', async (payer, amount, paymentId, date) => {
    const payment = await Payment.findOne({ id: paymentId })
    if (payment) {
      payment.paid = true;
      await payment.save();
    }
  });
}
listenEvents().then()

const items = {
  '1': { id: 1, url: "http://urlToDownloadPurchasedBook_1.pdf" },
  '2': { id: 2, url: "http://urlToDownloadPurchasedBook_2.pdf" },
}
app.get('/api/v2/getUrl/:paymentId', async function (req, res) {
  const payment = await Payment.findOne({ id: req.params.paymentId })
  if (payment && payment.paid === false) {
    res.json({ url: items[payment.itemId].url });
  } else {
    res.json({ url: "" });
  }
});



const port = process.env.port || 3300;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

