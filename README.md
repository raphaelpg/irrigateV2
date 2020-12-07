# irrigateV2-x-Superfluid

Second version of Irrigate project, a platform that gather associatons with donors from around the world.  
This version integrates Superfluid protocol so users can subscribe to monthly donations in DAI.

Basic functionnalities:  
Associations can submit a form and appear in the main page after going through a validation process.  
Donors can see all the associations available for donations and make donations.  

All the informations contained such as NGO's names and descriptions are used for the prototype purpose only.  
It uses goerli for tests at [http://35.180.87.54/](http://35.180.87.54/)  


## Associations interactions with the app  

A form has to be filed and validated for the association to be visible on the app's main page.  
Below items have to be provided:  
* Name of the association  
* Short description  
* Category  
* Continent of activity location  
* Country of activity location  
* An ethereum address that will receive the donations  
* A logo that will be displayed on the main page  


## Donors interactions with the app  

Make sure you have Metamask on your browser, and connected to goerli network.  

Donors can connect their wallet and perform a One Time donation or subscribe to monthly donation.    
In order to be able to subscribe monthly, users need to register at Superfluid's dashboard first:  
[Superfluid](https://www.superfluid.finance/)  

They can set the donation amount and subscribe through Irrigate.  
They can unsubscribe using the "Manage your Subscription" button or directly through Superfluid dashboard.  


## Superfluid protocol  

Superfluid is used for two things in Irrigate:  
* Using the Constant Flow Agreement (CFA) to allow users to send donations montlhy automatically, without having to confirm a new transaction every month.  
* Using the Instant Distribution Agreement (IDA) to transfer donations to every associations registered in only one transaction.  
Superfluid documentation can be found [here](https://docs.superfluid.finance/superfluid/)  


### The strategy behind:    

The long term objective is to allow users and associations to interact for free. To cover the transaction's fees and the maintenance costs, 
the donations will be used to generates interests through a lending protocol during a defined period of time before being distributed.  
Every data and statistics being transparent and displayed in real time.   


## Security  

This project is a prototype, it is not recommended to use it on the mainnet.  
No smart contracts are used, only web3 calls are performed on goerli.  


## Built With

* [Superfluid](https://www.superfluid.finance/) - Handle subscriptions, salaries, rewards and any composable stream of value, with continuous settlement and per-second netting for extreme capital efficiency.
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - MongoDB Atlas is the global cloud database service for modern applications.  
* [Node.js](https://nodejs.org/en/docs/) - Node.js is designed to build scalable network applications - v10.16.3  
* [Express](https://expressjs.com/en/4x/api.html) - Fast, unopinionated, minimalist web framework for Node.js - v4.16.4  
* [web3js](https://web3js.readthedocs.io/en/v1.2.1/web3.html) - Used to interact with Ethereum blockchain and smart contracts - v1.2.1  
* [React](https://reactjs.org/) - A JavaScript library for building user interfaces - v16.12.0  
* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - ECMAScript 2018 - v9  


## Authors

* **Raphael Pinto Gregorio** - https://github.com/raphaelpg/
