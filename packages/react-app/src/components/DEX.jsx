import { Card, Col, Divider, Input, Row } from "antd";
import { useBalance, useContractReader, useBlockNumber } from "eth-hooks";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { useTokenBalance } from "eth-hooks/erc/erc-20/useTokenBalance";
import { ethers } from "ethers";
import React, { useState } from "react";
import Address from "./Address";
import Contract from "./Contract";
import Curve from "./Curve";
import TokenBalance from "./TokenBalance";
import Blockies from "react-blockies";
import deployedContracts from "./../contracts/hardhat_contracts.json";

const contractName = "DEX";
const tokenName = "Balloons";

export default function Dex(props) {
  let display = [];

  const [form, setForm] = useState({});
  const [values, setValues] = useState({});
  const tx = props.tx;

  const writeContracts = props.writeContracts;

  const contractAddress = props.readContracts[contractName].address;
  const tokenAddress = props.readContracts[tokenName].address;
  const contractBalance = useBalance(props.localProvider, contractAddress);

  const tokenBalance = useTokenBalance(props.readContracts[tokenName], contractAddress, props.localProvider);
  const tokenBalanceFloat = parseFloat(ethers.utils.formatEther(tokenBalance));
  const ethBalanceFloat = parseFloat(ethers.utils.formatEther(contractBalance));
  const liquidity = useContractReader(props.readContracts, contractName, "liquidity", [props.address]);

  // Contract addresses and ABIs
  const dexAddress = props.readContracts[contractName].address;
  const dexAbi = deployedContracts[421613].arbitrumGoerli.contracts.DEX.abi;
  const balloonAddress = props.readContracts[tokenName].address;
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

  if (props.readContracts && props.readContracts[contractName]) {
    display.push(
      <div>
        {rowForm("ethToToken", "💸", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          const DexContractInstance = new ethers.Contract(dexAddress, dexAbi);
          const encodedEthToTokenFunction = DexContractInstance.interface.encodeFunctionData("ethToToken", [
            props.address,
          ]);

          const transaction = [
            {
              value: valueInEther,
              to: dexAddress,
              data: encodedEthToTokenFunction,
              gasLimit: 200000,
            },
          ];

          let swapEthToTokenResult = await tx(transaction);
          console.log("swapEthToTokenResult:", swapEthToTokenResult);
        })}

        {rowForm("tokenToEth", "🔏", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
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

          let result = await tx(transactions);
          result = await result;
          console.log("Approve and swap transaction result:", result);
        })}

        <Divider> Liquidity ({liquidity ? ethers.utils.formatEther(liquidity) : "none"}):</Divider>

        {rowForm("deposit", "📥", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let valuePlusExtra = ethers.utils.parseEther("" + value * 1.03);

          const BalloonContractInstance = new ethers.Contract(balloonAddress, balloonAbi);
          const encodedApproveFunction = BalloonContractInstance.interface.encodeFunctionData("approve", [
            dexAddress,
            valuePlusExtra,
          ]);

          const DexContractInstance = new ethers.Contract(dexAddress, dexAbi);
          const deposit = DexContractInstance.interface.encodeFunctionData("deposit");

          const transactions = [
            {
              to: balloonAddress,
              data: encodedApproveFunction,
              gasLimit: 200000,
            },
            {
              value: valueInEther,
              to: dexAddress,
              data: deposit,
              gasLimit: 200000,
            },
          ];

          let result = await tx(transactions);
          result = await result;
          console.log("Approve and deposit transaction result:", result);
        })}

        {rowForm("withdraw", "📤", async value => {
          let valueInEther = ethers.utils.parseEther("" + value);
          let withdrawTxResult = await tx(writeContracts[contractName]["withdraw"](valueInEther));
          console.log("withdrawTxResult:", withdrawTxResult);
        })}
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
                <TokenBalance name={tokenName} img={"🎈"} address={contractAddress} contracts={props.readContracts} />
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
            signer={props.signer}
            provider={props.localProvider}
            show={["balanceOf", "approve"]}
            address={props.address}
            blockExplorer={props.blockExplorer}
            contractConfig={props.contractConfig}
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
