import Web3Modal from "web3modal";
// import WalletConnectProvider from "@walletconnect/web3-provider";

// const INFURA_ID = "ead68416f9b74cf1999d57cb3362167f";

export const web3Modal = new Web3Modal({
	network: "goerli",
	cacheProvider: true
	/*providerOptions: {
		walletconnect: {
			package: WalletConnectProvider,
			options: {
				infuraId: INFURA_ID
			}
		}
	}*/
})

export const logoutOfWeb3Modal = async function() {
	await web3Modal.clearCachedProvider();
	window.location.reload();
}