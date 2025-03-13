"use server"

import fs from "fs/promises"
import path from "path"

// Path to the store.js file
const storeConfigPath = path.join(process.cwd(), "constants", "store.js")

// Helper function to read the store config
async function readStoreConfig() {
  try {
    const fileContent = await fs.readFile(storeConfigPath, "utf-8")
    // Remove 'export const Store =' and convert to JSON format
    const jsonContent = fileContent
      .replace(/export const Store =/, "") // Remove the export declaration
      .trim() // Trim extra spaces
      .slice(0, -1) // Remove the trailing semicolon
      .trim()

    console.log(jsonContent)
    // Parse the JavaScript object-like structure to JSON
    const store = eval(`(${jsonContent})`) // Evaluate the string into a JavaScript object

    console.log(store)
    return store
  } catch (error) {
    console.error("Error reading store config:", error)
    throw error
  }
}

// Helper function to write the store config
async function writeStoreConfig(config: any) {
  try {
    const storeContent = `export const Store = ${JSON.stringify(config, null, 2)};`
    console.log(storeContent)
    await fs.writeFile(storeConfigPath, storeContent, "utf-8")
  } catch (error) {
    console.error("Error writing store config:", error)
    throw error
  }
}

export async function getStoreConfig() {
  console.log(await readStoreConfig())
  return await readStoreConfig()
}

export async function updateStoreConfig(newConfig: any) {
  // Basic validation
  if (!newConfig.name || !newConfig.currency || !newConfig.domain) {
    throw new Error("Invalid configuration data")
  }

  await writeStoreConfig(newConfig)
  return { success: true }
}
