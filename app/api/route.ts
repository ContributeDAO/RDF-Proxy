import { ethers } from "ethers"
import { NextResponse } from "next/server"
import DataNFTContractABI from "@/contract/DataNFTContract.json"

export const dynamic = "force-dynamic" // defaults to auto

export async function POST(request: Request) {
  const { privateKey, contractAddress, method, params } = await request.json()
  const provider = new ethers.Wallet(privateKey)

  try {
    const contract = new ethers.Contract(
      contractAddress,
      DataNFTContractABI.abi
    )

    // sign the transaction
    const transaction = await contract[method](...params)
    const tx = await provider.sendTransaction(transaction)

    return NextResponse.json({
      success: true,
      message: "Data fetched successfully",
      tx,
    })
  } catch (error) {
    console.error("Error interacting with the contract:", error)
    return NextResponse.json({ success: false, error: error })
  }
}
