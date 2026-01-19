
import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';

const apiKey = "AIzaSyD8nSB2ubMkryqVc01zrpqbzLMysWoKI2I";
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
