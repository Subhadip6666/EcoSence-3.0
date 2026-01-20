
import { GoogleGenAI } from "@google/genai";
const fs = await import('fs');
const path = await import('path');

function getApiKey() {
  try {
    const envPath = path.resolve('.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
      if (match && match[1]) {
        // Strip quotes if present
        return match[1].trim().replace(/^["'](.*)["']$/, '$1');
      }
    }
  } catch (e) {
    console.error("Error reading .env.local:", e);
  }
  return process.env.VITE_GEMINI_API_KEY || "";
}

const knownLeakedKey = process.env.VITE_GEMINI_API_KEY;
const apiKey = getApiKey();

if (!apiKey) {
    console.log("STATUS: MISSING_KEY");
    console.error("Error: VITE_GEMINI_API_KEY not found.");
    process.exit(1);
}

if (apiKey === knownLeakedKey) {
    console.log("STATUS: LEAKED_KEY_DETECTED");
    console.error("Error: You are still using the compromised API key.");
    process.exit(1);
}

if (apiKey.startsWith('"') || apiKey.endsWith('"')) {
     console.log("STATUS: QUOTES_DETECTED (Should be stripped now)");
}

console.log(`Using API Key: ${apiKey.substring(0, 10)}... (Length: ${apiKey.length})`);

const ai = new GoogleGenAI({ apiKey: apiKey });

async function main() {
  try {
    console.log("Fetching models...");
    const response = await ai.models.list();
    const modelNames = [];
    
    // Iterate over the async iterable response (Pager)
    // The SDK documentation suggests it returns a Pager which is async iterable
    for await (const model of response) {
        if (model && model.name) {
            modelNames.push(model.name);
        }
    }
    
    console.log("Found " + modelNames.length + " models.");
    fs.writeFileSync('available_models.txt', modelNames.join('\n'));
    console.log("Saved to available_models.txt");

  } catch (error) {
    console.error("Error listing models:", error);
    fs.writeFileSync('available_models.txt', "Error: " + error.message);
  }
}

main();
