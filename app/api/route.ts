import { ethers } from "ethers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic" // defaults to auto

export async function POST(request: Request) {
  const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL)
  const { contractAddress, abi, method, params } = await request.json()
  let contractData = {}

  try {
    const contract = new ethers.Contract(contractAddress, abi, provider)
    // Example of calling a contract method that does not mutate state
    const data = await contract[method](...params)
    contractData = { contractAddress, data } // Store or process data as needed
    return NextResponse.json({
      success: true,
      message: "Data fetched successfully",
      contractData,
    })
  } catch (error) {
    console.error("Error interacting with the contract:", error)
    return NextResponse.json({ success: false, error: error })
  }
}
