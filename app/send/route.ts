import DataPunkABI from "@/solidity/contracts/artifacts/RebellionDataFunder.json"
import { NextResponse } from "next/server"
import Web3, { PayableCallOptions } from "web3"

export const dynamic = "force-dynamic" // defaults to auto

function toObject(obj: object): object {
  return JSON.parse(
    JSON.stringify(
      obj,
      (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
    )
  )
}

export async function POST(request: Request) {
  const { privateKey, address, contractAddress, method, params } = await request.json()

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
    DataPunkABI.abi,
    // Replace this with the address of your deployed contract
    contractAddress
  )

  console.log(contract);

  // get gas price and estimate gas
  const gasPrice = await web3.eth.getGasPrice()
  const gas = await contract.methods[method](...params).estimateGas({ from: address })

  
  const options: PayableCallOptions = {
    from: address,
    gas: gas.toString(),
    gasPrice: gasPrice.toString(),
    value: "0",
  }
  
  const callResponse = await contract.methods[method](...params).send(options)

  return NextResponse.json({
    status: "success",
    receipt: toObject(callResponse as object),
  })
}
