import { Card, Col, Divider, Input, Row } from "antd";
import { useBalance, useContractReader } from "eth-hooks";
import { useTokenBalance } from "eth-hooks/erc/erc-20/useTokenBalance";
import { ethers } from "ethers";
import React, { useState } from "react";
import Address from "./Address";
import Contract from "./Contract";
import Curve from "./Curve";
import TokenBalance from "./TokenBalance";
import deployedContracts from "./../contracts/hardhat_contracts.json";

const contractName = "DEX";
const tokenName = "Balloons";

export default function Dex({
  tx,
  writeContracts,
  localProvider,
  mainnetProvider,
  blockExplorer,
  address,
  readContracts,
  contractConfig,
  signer,
  setIsModalOpen,
  setTransactions,
}) {
  let display = [];

  const [values, setValues] = useState({});

  const contractAddress = readContracts[contractName].address;
  const tokenAddress = readContracts[tokenName].address;
  const contractBalance = useBalance(localProvider, contractAddress);

  const tokenBalance = useTokenBalance(readContracts[tokenName], contractAddress, localProvider);
  const tokenBalanceFloat = parseFloat(ethers.utils.formatEther(tokenBalance));
  const ethBalanceFloat = parseFloat(ethers.utils.formatEther(contractBalance));
  const liquidity = useContractReader(readContracts, contractName, "liquidity", [address]);

  // Contract addresses and ABIs
  const dexAddress = readContracts[contractName].address;
  const dexAbi = deployedContracts[421613].arbitrumGoerli.contracts.DEX.abi;
  const balloonAddress = readContracts[tokenName].address;
  const balloonAbi = deployedContracts[421613].arbitrumGoerli.contracts.Balloons.abi;

  const rowForm = (title, icon, onClick) => {
    return (
      <Row>
        <Col span={8} style={{ textAlign: "right", opacity: 0.333, paddingRight: 6, fontSize: 24 }}>
          {title}
        </Col>
        <Col span={16}>
          <div style={{ cursor: "pointer", margin: 2 }}>
            <Input
              onChange={e => {
                let newValues = { ...values };
                newValues[title] = e.target.value;
                setValues(newValues);
              }}
              value={values[title]}
              addonAfter={
                <div
                  type="default"
                  onClick={() => {
                    onClick(values[title]);
                    let newValues = { ...values };
                    newValues[title] = "";
                    setValues(newValues);
                  }}
                >
                  {icon}
                </div>
              }
            />
          </div>
        </Col>
      </Row>
    );
  };

  if (readContracts && readContracts[contractName]) {
    display.push(
      <div>
        {rowForm("ethToToken", "💸", async value => {
          const valueInEther = ethers.utils.parseEther("" + value);
          const DexContractInstance = new ethers.Contract(dexAddress, dexAbi);
          const encodedEthToTokenFunction = DexContractInstance.interface.encodeFunctionData("ethToToken", [address]);

          const transactions = [
            {
              value: valueInEther,
              to: dexAddress,
              data: encodedEthToTokenFunction,
              gasLimit: 200000,
            },
          ];

          setTransactions(transactions);
          setIsModalOpen(true);
        })}

        {rowForm("tokenToEth", "🔏", async value => {
          const valueInEther = ethers.utils.parseEther("" + value);
          const BalloonContractInstance = new ethers.Contract(balloonAddress, balloonAbi);
          const encodedApproveFunction = BalloonContractInstance.interface.encodeFunctionData("approve", [
            dexAddress,
            valueInEther,
          ]);

          const DexContractInstance = new ethers.Contract(dexAddress, dexAbi);
          const encodedtokenToEthFunction = DexContractInstance.interface.encodeFunctionData("tokenToEth", [
            valueInEther,
          ]);

          const transactions = [
            {
              to: balloonAddress,
              data: encodedApproveFunction,
              gasLimit: 200000,
            },
            {
              to: dexAddress,
              data: encodedtokenToEthFunction,
              gasLimit: 200000,
            },
          ];

          setTransactions(transactions);
          setIsModalOpen(true);
        })}

        {/* <Divider> Liquidity ({liquidity ? ethers.utils.formatEther(liquidity) : "none"}):</Divider>

        {rowForm("deposit", "📥", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let valuePlusExtra = ethers.utils.parseEther("" + value * 1.03);

          const BalloonContractInstance = new ethers.Contract(balloonAddress, balloonAbi);
          const encodedApproveFunction = BalloonContractInstance.interface.encodeFunctionData("approve", [
            dexAddress,
            valuePlusExtra,
          ]);

          const DexContractInstance = new ethers.Contract(dexAddress, dexAbi);
          const encodedDepositFunction = DexContractInstance.interface.encodeFunctionData("deposit");

          const transactions = [
            {
              to: balloonAddress,
              data: encodedApproveFunction,
              gasLimit: 200000,
            },
            {
              value: valueInEther,
              to: dexAddress,
              data: encodedDepositFunction,
              gasLimit: 200000,
            },
          ];

          setTransactions(transactions);
          setIsModalOpen(true);
        })} */}

        {/* {rowForm("withdraw", "📤", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let withdrawTxResult = await tx(writeContracts[contractName]["withdraw"](valueInEther));
          console.log("withdrawTxResult:", withdrawTxResult);
        })} */}
      </div>,
    );
  }

  return (
    <Row span={24}>
      <Col span={12}>
        <Card
          title={
            <div>
              <Address value={contractAddress} />
              <div style={{ float: "right", fontSize: 24 }}>
                {parseFloat(ethers.utils.formatEther(contractBalance)).toFixed(4)} ⚖️
                <TokenBalance name={tokenName} img={"🎈"} address={contractAddress} contracts={readContracts} />
              </div>
            </div>
          }
          size="large"
          loading={false}
        >
          {display}
        </Card>
        <Row span={12}>
          <Contract
            name="Balloons"
            signer={signer}
            provider={localProvider}
            show={["balanceOf"]}
            address={address}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
          />
        </Row>
      </Col>
      <Col span={12}>
        <div style={{ padding: 20 }}>
          <Curve
            addingEth={values && values["ethToToken"] ? values["ethToToken"] : 0}
            addingToken={values && values["tokenToEth"] ? values["tokenToEth"] : 0}
            ethReserve={ethBalanceFloat}
            tokenReserve={tokenBalanceFloat}
            width={500}
            height={500}
          />
        </div>
      </Col>
    </Row>
  );
}
