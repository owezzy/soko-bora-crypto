import styles from './app.module.css';

import {useState} from 'react';
import {ethers} from 'ethers'

import {ReactComponent as Logo} from './logo.svg';
import star from './star.svg';

export function App() {
  const Greeter = require('../artifacts/contracts/Greeter.sol/Greeter.json')

// Update with the contract address logged out to the CLI when it was deployed
  const greeterAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"


  // store greeting in local state
  const [greeting, setGreetingValue] = useState()

  // request access to the user's MetaMask account
  async function requestAccount() {
    // @ts-ignore

    await window.ethereum.request({method: 'eth_requestAccounts'});
  }

  // call the smart contract, read the current greeting value
  async function fetchGreeting() {
    // @ts-ignore

    if (typeof window.ethereum !== 'undefined') {
      // @ts-ignore

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
      try {
        const data = await contract.greet()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }

  // call the smart contract, send an update
  async function setGreeting() {
    if (!greeting) return
    // @ts-ignore

    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      // @ts-ignore

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(greeting)
      await transaction.wait()
      await fetchGreeting()
    }
  }

  return (
    <div className={styles.app}>
      <header className="flex">
        <h1>react-dapp!</h1>
      </header>
      <main>
        <ul className="resources">
          <li className="col-span-2">
            <button onClick={fetchGreeting}>Fetch Greeting</button>


          </li>
          <li className="col-span-2">
            <button onClick={setGreeting}>Set Greeting</button>

          </li>
          <li className="col-span-2">
            <input onChange={event => {
              let value: any = event.target;
              return setGreetingValue(value);
            }} placeholder="Set greeting" />
          </li>
        </ul>
      </main>
    </div>
  );
}

export default App;
