const dotenv = require("dotenv");

dotenv.config();

console.log("🚀 Gemini Service v10 (Smart Sleep & Lite Recovery) initialized");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Direct API Call to Gemini Vision with Smart Sleep
 */
const extractFloorPlanFromImage = async (base64Image) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not defined in .env");

  // Refined model list based on your specific authorized keys
  const modelsToTry = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-pro-latest", "gemini-1.5-flash-latest"];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`👁️ Vision Attempt: ${modelName}...`);
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{
          parts: [
            { text: VISION_SYSTEM_INSTRUCTION },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]
        }]
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.status === 429) {
          const retryMsg = result.error?.message || "";
          const secondsMatch = retryMsg.match(/retry in ([\d\.]+)s/);
          const waitStr = secondsMatch ? ` (Wait ${secondsMatch[1]}s)` : "";
          console.warn(`📉 Model ${modelName} rate limited.${waitStr}. Sleeping 2s...`);
          await sleep(2000); // Smart sleep before trying fallback
          continue;
      }
      
      if (response.status === 404) continue;
      if (!response.ok || !result.candidates) continue;

      const text = result.candidates[0].content.parts[0].text;
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      return JSON.parse(text.substring(jsonStart, jsonEnd));

    } catch (e) {
      continue;
    }
  }
  throw new Error("All vision paths exhausted. Please wait ~30 seconds and try again.");
};

/**
 * Multi-model Text-to-3D with Smart Sleep
 */
const generate3DLayout = async (prompt) => {
    const apiKey = process.env.GEMINI_API_KEY;
    // Use correct stable model IDs
    const modelsToTry = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro-latest",
      "gemini-pro",
    ];
    
    for (const modelName of modelsToTry) {
        try {
            console.log(`🤖 Text-to-3D Attempt: ${modelName}...`);
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            
            const payload = { 
                contents: [{ parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nUser Prompt: "${prompt}"` }] }] 
            };
            
            const response = await fetch(API_URL, { 
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify(payload) 
            });

            const result = await response.json();
            
            if (response.status === 429) {
                console.warn(`📉 Model ${modelName} busy. Sleeping 1.5s...`);
                await sleep(1500);
                continue;
            }

            if (!result.candidates || result.candidates.length === 0) continue;

            const text = result.candidates[0].content.parts[0].text;
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}') + 1;
            return JSON.parse(text.substring(jsonStart, jsonEnd));
        } catch (error) {
            continue;
        }
    }
    throw new Error("AI is currently overwhelmed. Please try again in 30 seconds.");
};

/**
 * LOCAL FALLBACK LAYOUT — generates a sensible house from the prompt text
 * without calling any API. Used when all Gemini models are rate-limited.
 */
function generateLocalLayout(prompt) {
  const p = prompt.toLowerCase();

  // Detect bedrooms
  const bedMatch = p.match(/(\d+)\s*bed/);
  const numBeds  = bedMatch ? parseInt(bedMatch[1], 10) : 2;

  // Detect floors
  const hasUpstairs = p.includes('2 floor') || p.includes('two floor') ||
                      p.includes('storey') || p.includes('2 storey') || p.includes('upstairs');

  // Detect style
  const style = p.includes('modern') ? 'modern'
    : p.includes('luxury') ? 'luxury'
    : p.includes('rustic') ? 'rustic'
    : p.includes('minimalist') ? 'minimalist'
    : 'modern';

  const rooms = [];
  let cursor = { x: 0, z: 0 };

  // Ground floor
  rooms.push({ type: 'living room', size: [5, 3, 5], position: [cursor.x, 0, cursor.z] });
  cursor.x += 5;
  if (p.includes('dining')) {
    rooms.push({ type: 'dining room', size: [4, 3, 4], position: [cursor.x, 0, cursor.z] });
    cursor.x += 4;
  }
  rooms.push({ type: 'kitchen', size: [4, 3, 4], position: [cursor.x, 0, cursor.z] });
  cursor.x += 4;
  if (p.includes('bathroom') || p.includes('bath')) {
    rooms.push({ type: 'bathroom', size: [2.5, 3, 3], position: [cursor.x, 0, cursor.z] });
  }

  // Bedrooms
  const floorY = hasUpstairs ? 3 : 0;
  let bCursor = { x: 0, z: hasUpstairs ? 0 : -5 };
  for (let i = 0; i < numBeds; i++) {
    rooms.push({ type: 'bedroom', size: [4, 3, 4], position: [bCursor.x, floorY, bCursor.z] });
    bCursor.x += 4;
  }
  if (hasUpstairs && (p.includes('bathroom') || numBeds > 1)) {
    rooms.push({ type: 'bathroom', size: [2.5, 3, 3], position: [bCursor.x, floorY, bCursor.z] });
  }

  return { style, rooms };
}

// Re-export with local fallback
const generate3DLayoutWithFallback = async (prompt) => {
  try {
    return await generate3DLayout(prompt);
  } catch (err) {
    console.warn('⚠️ Gemini unavailable — using local layout generator');
    return generateLocalLayout(prompt);
  }
};

const SYSTEM_INSTRUCTION = `You are an expert architectural AI. Analyse the user prompt and return ONLY a valid JSON object describing a 3D house layout.

Rules:
- Rooms must NOT overlap. Place them side by side on the X axis for ground floor.
- For multi-floor houses, stack bedrooms on the second floor (Y = 3.0) and living/kitchen on ground (Y = 0).
- Size format: [width, height, depth] in metres. Height is always 3.0.
- Position format: [x, y, z] — centred on the room. Start rooms at x=0, z=0 and extend along X axis.
- Return ONLY valid JSON. No markdown. No comments.

Format:
{
  "style": "modern",
  "rooms": [
    { "type": "living room", "size": [5, 3, 5], "position": [0, 0, 0] },
    { "type": "kitchen",     "size": [4, 3, 4], "position": [5, 0, 0] }
  ]
}`;

const VISION_SYSTEM_INSTRUCTION = `You are an expert architectural AI. Analyse this 2D floor plan image and generate a complete 3D house layout.

Instructions:
1. Identify all rooms visible in the floor plan (living room, bedroom, kitchen, bathroom, dining room, hallway, etc.)
2. Estimate each room's relative size in metres (width x depth).
3. Arrange rooms side by side to form a connected house — NO overlaps.
4. For rooms on the same row: increase X position.
5. For a second row of rooms (e.g. bedrooms behind living areas): use a negative Z offset.
6. Height is always 3.0 for all rooms.
7. Return ONLY valid JSON — no markdown, no explanations.

Return this exact format:
{
  "style": "modern",
  "rooms": [
    { "type": "living room", "size": [5, 3, 5], "position": [0, 0, 0] },
    { "type": "kitchen",     "size": [4, 3, 4], "position": [5, 0, 0] },
    { "type": "bedroom",     "size": [4, 3, 4], "position": [0, 0, -5] },
    { "type": "bathroom",    "size": [2.5, 3, 3], "position": [4, 0, -5] }
  ]
}`;

const HYBRID_SYSTEM_INSTRUCTION = `You are an expert architectural AI assistant. Reconstruct a SINGLE, SOLID, GRAND architectural house layout from the image and YOLO coordinates. 
CRITICAL: Use a LARGE coordinate scale (0 to 100). Every room MUST be spacious. Main rooms (Living, Bedroom, Kitchen) MUST be at least 20x20 units. DO NOT use tiny numbers. Ensure the entire house forms a solid, large block.
Every room MUST have at least one door and multiple large windows.

Output ONLY the structured JSON in this format:
{
  "walls": [{"start": [x, y], "end": [x, y]}],
  "rooms": [{"type": "room type", "size": [width, 3.5, depth], "position": [x, 0, z]}],
  "doors": [{"centerX": x, "centerZ": z, "rotation": r, "length": 1.5}],
  "windows": [{"centerX": x, "centerZ": z, "rotation": r, "length": 2.5}]
}`;

/**
 * Hybrid AI Pipeline: YOLO -> Gemini Vision
 * Uses Gemini to sanitize and reconstruct the floor plan logically from noisy YOLO coordinates.
 */
const cleanYoloOutputWithGemini = async (base64Image, rawYoloJson) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not defined in .env");

  const modelsToTry = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Hybrid AI Clean Attempt: ${modelName}...`);
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{
          parts: [
            { text: `${HYBRID_SYSTEM_INSTRUCTION}\n\nRaw YOLO Coordinates:\n${JSON.stringify(rawYoloJson)}` },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]
        }]
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.status === 429) {
          console.warn(`[Gemini] 429 Rate Limit on ${modelName}. Sleeping 2s...`);
          await sleep(2000);
          continue;
      }
      
      if (!response.ok) {
          console.error(`[Gemini] Error on ${modelName}: Status ${response.status}. Msg:`, result.error?.message || result);
          continue;
      }
      
      if (!result.candidates || result.candidates.length === 0) {
          console.error(`[Gemini] No candidates returned from ${modelName}`);
          continue;
      }

      const text = result.candidates[0].content.parts[0].text;
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      return JSON.parse(text.substring(jsonStart, jsonEnd));

    } catch (e) {
      console.error(`Hybrid AI Error (${modelName}):`, e.message);
      continue;
    }
  }
  throw new Error("Hybrid AI pipeline exhausted. Gemini could not clean the layout.");
};

module.exports = { generate3DLayout, generate3DLayoutWithFallback, extractFloorPlanFromImage, cleanYoloOutputWithGemini };
