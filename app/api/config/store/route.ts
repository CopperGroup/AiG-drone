import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

// Path to the store.js file
const storeConfigPath = path.join(process.cwd(), "constants", "store.js")

// Helper function to read the store config
async function readStoreConfig() {
  try {
    const fileContent = await fs.readFile(storeConfigPath, "utf-8")

    // Extract the Store object from the file content using regex
    const storeObjectMatch = fileContent.match(/export const Store = ({[\s\S]*?})/)

    if (!storeObjectMatch || !storeObjectMatch[1]) {
      throw new Error("Could not parse Store object from file")
    }

    // Convert the matched string to a JavaScript object
    // This is safer than using eval
    const storeObjectString = storeObjectMatch[1]
      .replace(/(\w+):/g, '"$1":') // Convert property names to strings
      .replace(/'/g, '"') // Replace single quotes with double quotes

    return JSON.parse(storeObjectString)
  } catch (error) {
    console.error("Error reading store config:", error)
    throw error
  }
}

// Helper function to write the store config
async function writeStoreConfig(config: any) {
  try {
    // Format the config object as JavaScript code
    const storeContent = `export const Store = ${
      JSON.stringify(config, null, 4)
        .replace(/"([^"]+)":/g, "$1:") // Convert property names back to unquoted format
        .replace(/"/g, "'") // Replace double quotes with single quotes
    }`

    await fs.writeFile(storeConfigPath, storeContent, "utf-8")
  } catch (error) {
    console.error("Error writing store config:", error)
    throw error
  }
}

// GET handler to retrieve the current store config
export async function GET() {
  try {
    const config = await readStoreConfig()
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json({ error: "Failed to read store configuration" }, { status: 500 })
  }
}

// POST handler to update the store config
export async function POST(request: NextRequest) {
  try {
    const newConfig = await request.json()

    // Validate the config (basic validation)
    if (!newConfig.name || !newConfig.currency || !newConfig.domain) {
      return NextResponse.json({ error: "Invalid configuration data" }, { status: 400 })
    }

    await writeStoreConfig(newConfig)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update store configuration" }, { status: 500 })
  }
}

