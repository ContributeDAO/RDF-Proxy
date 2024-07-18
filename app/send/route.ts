import CampaignABI from "@/contract/NewCampaign.json"
import { NextResponse } from "next/server"
import Web3 from "web3"

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
    CampaignABI,
    // Replace this with the address of your deployed contract
    contractAddress
  )
  
  // Issuing a transaction that calls the `echo` method
  const callResponse = await contract.methods[method](...params).send({from: address})

  return NextResponse.json({
    status: "success",
    receipt: toObject(callResponse as object),
  })
}
