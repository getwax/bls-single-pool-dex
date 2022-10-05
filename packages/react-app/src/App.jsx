import { Button, Col, Menu, Row, List } from "antd";
import "antd/dist/antd.css";
import { useBalance, useContractLoader, useContractReader, useGasPrice, useOnBlock } from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import ReactModal from "react-modal";
import "./App.css";
import {
  Account,
  Contract,
  Faucet,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
  NetworkDisplay,
  FaucetHint,
  NetworkSwitch,
  TokenBalance,
  Dex,
  Address,
  Balance,
} from "./components";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { ExampleUI, Hints, Subgraph } from "./views";
import { useStaticJsonRPC, useProvider, useSigner, useAddress } from "./hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";

const { ethers } = require("ethers");
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/scaffold-eth/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Alchemy.com & Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const initialNetwork = NETWORKS.arbitrumGoerli; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = true; // toggle burner wallet feature
const USE_NETWORK_SELECTOR = false;

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = [initialNetwork.name, "mainnet", "rinkeby"];

  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [injectedProvider, setInjectedProvider] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
  const location = useLocation();

  const targetNetwork = NETWORKS[selectedNetwork];

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useProvider(targetNetwork.rpcUrl);
  const mainnetProvider = useStaticJsonRPC(providers);

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userSigner = useSigner(localProvider);
  const address = useAddress(localProvider);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // If you want to call a function on a new block
  // useOnBlock(mainnetProvider, () => {
  //   console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  // });

  // Then read your DAI balance like:
  const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
    "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  ]);

  // keep track of a variable from the contract in the local React state:
  const purpose = useContractReader(readContracts, "Balloons", "purpose");

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  const sendTransaction = async () => {
    if (transactions === []) {
      console.log("No transactions set");
      return;
    }

    setIsModalOpen(false);

    const result = await tx(transactions, price);
    console.log("RESULT: ", result);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  // const [route, setRoute] = useState();
  // useEffect(() => {
  //   setRoute(window.location.pathname);
  // }, [setRoute]);

  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  // ** TODO: The events are not showing up! Left most of it commented out, but can uncomment and play with! Pretty sure you need to go into DEX.jsx as that is where most of the UI Home-page is being derived from. 😵 📟 Listen for broadcast events

  const EthToTokenSwapEvents = useEventListener(readContracts, "DEX", "EthToTokenSwap", localProvider, 1);
  // console.log("⟠ -->🎈 EthToTokenSwapEvents:", EthToTokenSwapEvents);
  // const TokenToEthSwapEvents = useEventListener(readContracts, "DEX", "TokenToEthSwap", 1);
  // // console.log("🎈-->⟠ TokenToEthSwapEvents:", TokenToEthSwapEvents);
  // const LiquidityProvidedEvents = useEventListener(readContracts, "DEX", "LiquidityProvided", 1);
  // // console.log("➕ LiquidityProvidedEvents:", LiquidityProvidedEvents);
  // const LiquidityRemovedEvents = useEventListener(readContracts, "DEX", "LiquidityRemoved", 1);
  // // console.log("➖ LiquidityRemovedEvents:", LiquidityRemovedEvents);

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      <NetworkDisplay
        NETWORKCHECK={NETWORKCHECK}
        localChainId={localChainId}
        selectedChainId={selectedChainId}
        targetNetwork={targetNetwork}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
        USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
      />
      <Menu style={{ textAlign: "center", marginTop: 40 }} selectedKeys={[location.pathname]} mode="horizontal">
        <Menu.Item key="/">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="/debug">
          <Link to="/debug">Debug Contracts</Link>
        </Menu.Item>
        <Menu.Item key="/hints">
          <Link to="/hints">Hints</Link>
        </Menu.Item>
        <Menu.Item key="/exampleui">
          <Link to="/exampleui">ExampleUI</Link>
        </Menu.Item>
        <Menu.Item key="/mainnetdai">
          <Link to="/mainnetdai">Mainnet DAI</Link>
        </Menu.Item>
        <Menu.Item key="/subgraph">
          <Link to="/subgraph">Subgraph</Link>
        </Menu.Item>
      </Menu>

      <ReactModal
        isOpen={isModalOpen}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
          },
        }}
        ariaHideApp={false}
      >
        <p>Are you sure you want to initiate this transaction?</p>
        <button onClick={closeModal}>Cancel</button>
        <button onClick={() => sendTransaction()}>Confirm</button>
      </ReactModal>

      <Switch>
        <Route exact path="/">
          {/* pass in any web3 props to this Home component. For example, yourLocalBalance */}
          {readContracts && readContracts.DEX && address && localProvider ? (
            <Dex
              tx={tx}
              writeContracts={writeContracts}
              localProvider={localProvider}
              mainnetProvider={mainnetProvider}
              blockExplorer={blockExplorer}
              address={address} //this is causing issues
              readContracts={readContracts} //this is causing issues
              contractConfig={contractConfig}
              signer={userSigner}
              setIsModalOpen={setIsModalOpen}
              setTransactions={setTransactions}
            />
          ) : (
            // ""
            ""
          )}
          {/* TODO: The DEX.jsx file actually logs a bunch of the results so we think that instead of creating completely new event components (or whatever), we would figure out how to work with the txs that are happening as a result of EthersJS calling the respective functions in DEX.jsx. 😵 Lines 321-335 are an example of attempting to place emitted events on the front-page UI. It is not working though for now! */}
          <div style={{ width: 500, margin: "auto", marginTop: 64 }}>
            <div>👀 DEX Events:</div>
            <List
              dataSource={EthToTokenSwapEvents}
              renderItem={item => {
                return (
                  <List.Item key={item.blockNumber}>
                    <Address value={item.args[0]} ensProvider={localProvider} fontSize={16} />
                    <Balance tokenOutput={item.args[1]} />
                    <Balance ethInput={item.args[2]} />
                  </List.Item>
                );
              }}
            />
          </div>
        </Route>

        <Route exact path="/debug">
          {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}

          <Contract
            name="DEX"
            price={price}
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
          />

          <Contract
            name="Balloons"
            price={price}
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
          />
        </Route>
        <Route path="/hints">
          <Hints
            address={address}
            yourLocalBalance={yourLocalBalance}
            mainnetProvider={mainnetProvider}
            price={price}
          />
        </Route>
        <Route path="/exampleui">
          <ExampleUI
            address={address}
            userSigner={userSigner}
            mainnetProvider={mainnetProvider}
            localProvider={localProvider}
            yourLocalBalance={yourLocalBalance}
            price={price}
            tx={tx}
            writeContracts={writeContracts}
            readContracts={readContracts}
            purpose={purpose}
          />
        </Route>
        <Route path="/mainnetdai">
          <Contract
            name="DAI"
            customContract={mainnetContracts && mainnetContracts.contracts && mainnetContracts.contracts.DAI}
            signer={userSigner}
            provider={mainnetProvider}
            address={address}
            blockExplorer="https://etherscan.io/"
            contractConfig={contractConfig}
            chainId={1}
          />
          {/*
            <Contract
              name="UNI"
              customContract={mainnetContracts && mainnetContracts.contracts && mainnetContracts.contracts.UNI}
              signer={userSigner}
              provider={mainnetProvider}
              address={address}
              blockExplorer="https://etherscan.io/"
            />
            */}
        </Route>
        <Route path="/subgraph">
          <Subgraph
            subgraphUri={props.subgraphUri}
            tx={tx}
            writeContracts={writeContracts}
            mainnetProvider={mainnetProvider}
          />
        </Route>
      </Switch>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          {USE_NETWORK_SELECTOR && (
            <div style={{ marginRight: 20 }}>
              <NetworkSwitch
                networkOptions={networkOptions}
                selectedNetwork={selectedNetwork}
                setSelectedNetwork={setSelectedNetwork}
              />
            </div>
          )}
          <Account
            useBurner={USE_BURNER_WALLET}
            address={address}
            localProvider={localProvider}
            userSigner={userSigner}
            mainnetProvider={mainnetProvider}
            price={price}
            web3Modal={web3Modal}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            blockExplorer={blockExplorer}
          />
        </div>

        {/* {yourLocalBalance.lte(ethers.BigNumber.from("0")) && (
          <FaucetHint localProvider={localProvider} targetNetwork={targetNetwork} address={address} />
        )} */}

        <TokenBalance name={"Balloons"} img={"🎈"} address={address} contracts={readContracts} />
        {FaucetHint}
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
            <Button
              onClick={() => {
                window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                💬
              </span>
              Support
            </Button>
          </Col>
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              faucetAvailable ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
