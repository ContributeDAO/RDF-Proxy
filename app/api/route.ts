import DataNFTContractABI from "@/contract/DataNFTContract.json"
import { NextResponse } from "next/server"
import Web3, { Transaction } from "web3"

export const dynamic = "force-dynamic" // defaults to auto

function hexToBytes(hex: string): Uint8Array {
  let bytes = []
  for (let c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16))
  return Uint8Array.from(bytes)
}

export async function POST(request: Request) {
  const { privateKey, contractAddress, method, params } = await request.json()

  const network = "sepolia"
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://${network}.infura.io/v3/${process.env.INFURA_API_KEY}`
    )
  )
  // Creating a signing account from a private key
  const signer = web3.eth.accounts.privateKeyToAccount("0x" + privateKey)
  web3.eth.accounts.wallet.add(signer)
  // Creating a Contract instance
  const contract = new web3.eth.Contract(
    DataNFTContractABI.abi,
    // Replace this with the address of your deployed contract
    contractAddress
  )
  // Issuing a transaction that calls the `echo` method
  const method_abi = contract.methods[method](...params).encodeABI()
  const tx: Transaction = {
    from: signer.address,
    to: contract.options.address,
    data: method_abi,
    value: "0",
  }
  tx.gasPrice = await web3.eth.getGasPrice()
  tx.gas = await web3.eth.estimateGas(tx)
  
  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    signer.privateKey
  )
  console.log("Raw transaction data: " + signedTx.rawTransaction)
  // Sending the transaction to the network
  const receipt = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .once("transactionHash", (txhash) => {
      console.log(`Mining transaction ...`)
      console.log(`https://${network}.etherscan.io/tx/${txhash}`)
    })
  // The transaction is now on chain!
  console.log(`Mined in block ${receipt.blockNumber}`)

  const representation = {
    blockHash: receipt.blockHash,
    blockNumber: receipt.blockNumber,
    contractAddress: receipt.contractAddress,
    cumulativeGasUsed: receipt.cumulativeGasUsed,
    from: receipt.from,
    gasUsed: receipt.gasUsed,
    logs: receipt.logs,
    logsBloom: receipt.logsBloom,
    status: receipt.status,
    to: receipt.to,
    transactionHash: receipt.transactionHash,
    transactionIndex: receipt.transactionIndex,
  }

  return NextResponse.json({
    status: "success",
    transaction: representation,
  })
}
