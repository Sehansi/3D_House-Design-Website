const fs = require('fs');
const path = require('path');
// Note: You will need to install these packages:
// npm install @google/generative-ai pdf2pic
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { fromPath } = require('pdf2pic');

class AIVisionProcessor {
  constructor() {
    // Initialize Google Gemini API (or OpenAI equivalent)
    // Make sure to add GEMINI_API_KEY to your backend/.env file
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY');
  }

  /**
   * Directly parsing vector lines natively in Node.js (via pdf-lib) is extremely complex 
   * because PDF vector data is stored as low-level PostScript drawing instructions. 
   * OCR (Tesseract) can only read text, not walls. 
   * 
   * The most reliable modern approach is:
   * 1. Convert PDF to Image
   * 2. Use a Vision AI Model (like Gemini 1.5 Pro or GPT-4o) with a structured prompt
   */
  async processFloorPlanWithAI(pdfPath) {
    try {
      console.log('🔄 Converting PDF to Image for Vision AI processing...');
      
      // 1. Convert the first page of the PDF to a PNG image
      const imagePath = await this.convertPdfToImage(pdfPath);
      
      console.log('🤖 Sending image to AI Vision Model...');
      
      // 2. Extract structural data via Vision API
      const extractedData = await this.extractStructuresFromImage(imagePath);
      
      // 3. Clean up the temporary image
      if (fs.existsSync(imagePath)) {
         fs.unlinkSync(imagePath);
      }
      
      return extractedData;
    } catch (error) {
      console.error('❌ AI Vision Setup Error:', error.message);
      throw error;
    }
  }

  async convertPdfToImage(pdfPath) {
    const options = {
      density: 300,
      saveFilename: "temp_floorplan",
      savePath: path.dirname(pdfPath),
      format: "png",
      width: 2048,
      height: 2048
    };
    
    const storeAsImage = fromPath(pdfPath, options);
    const pageToConvertAsImage = 1;
    
    // Resolve the generated image path
    const result = await storeAsImage(pageToConvertAsImage);
    return result.path;
  }

  async extractStructuresFromImage(imagePath) {
    // Read the image file into base64 for the API
    const imageData = fs.readFileSync(imagePath);
    
    // Using Gemini 1.5 Pro (which has excellent spatial/vision reasoning)
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // The Structured Computer Vision Prompt
    const visionPrompt = `
      You are an expert architectural AI assistant and computer vision extractor.
      Analyze the provided 2D floor plan image and meticulously extract its structural components. 
      
      Assume the origin (0,0) is the top-left corner of the image. 
      Normalize all coordinates and dimensions using a 0-100 scale (where 100 is the max width/height of the image).
      
      Identify the following elements and return extreme precision data:
      1. 'walls': Calculate the coordinates. Return an array of objects with { startX, startY, endX, endY, thickness, type: "exterior"|"interior"|.
      2. 'doors': Return an array of objects with { centerX, centerY, width, orientation: "horizontal"|"vertical" }.
      3. 'windows': Return an array of objects with { centerX, centerY, width, orientation }.
      4. 'rooms': Identify distinct bounded spaces. Return an array of objects with { name, centerX, centerY, width, height, areaSquareFeet }. Take an educated guess at room names based on fixtures or text labels.

      IMPORTANT: Return the data STRICTLY as a valid JSON object matching the keys above. Do NOT wrap the response in markdown code blocks like \`\`\`json. Return only the raw JSON string.
    `;

    const imagePart = {
      inlineData: {
        data: imageData.toString("base64"),
        mimeType: "image/png"
      },
    };

    const result = await model.generateContent([visionPrompt, imagePart]);
    const responseText = result.response.text().trim();
    
    try {
      // Parse the AI's JSON output
      const jsonStr = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI JSON response:", responseText);
      throw new Error("AI returned malformed JSON");
    }
  }
}

module.exports = new AIVisionProcessor();
