import { BytesLike, ethers, toUtf8Bytes } from "ethers"
import { NextResponse } from "next/server"
import DataNFTContractABI from "@/contract/DataNFTContract.json"

export const dynamic = "force-dynamic" // defaults to auto

function hexToBytes(hex: string): Uint8Array{
  let bytes = []
  for (let c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16))
  return Uint8Array.from(bytes)
}

export async function POST(request: Request) {
  const { privateKey, contractAddress, method, params } = await request.json()

  console.log(toUtf8Bytes(privateKey))
  
  const signingKey = new ethers.SigningKey(hexToBytes(privateKey))

  const provider = new ethers.Wallet(
    signingKey,
    ethers.InfuraProvider.getWebSocketProvider(
      "sepolia",
      process.env.INFURA_API_KEY
    )
  )

  try {
    const contract = new ethers.Contract(
      contractAddress,
      DataNFTContractABI.abi,
      provider
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
