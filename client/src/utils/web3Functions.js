import getWeb3 from './getWeb3';

export async function initiateWalletConnection() {
  try {
    console.log("initiate 1")
    const web3 = await getWeb3();
    await web3.eth.net.getNetworkType((err, network) => {
      this.setState({network: network})
    })
    console.log(this.state.network)
    console.log("initiate 2")
    const accounts = await web3.eth.getAccounts();
    console.log("initiate 3")
    this.setState({ web3, accounts })
    console.log("initiate 4")
  } catch (error) {
    console.log("initiate 5")
    alert(`No wallet detected or wrong network.\nAdd a crypto wallet such as Metamask to your browser and switch it to Ropsten network.`);
  }
}