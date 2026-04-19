// Lightweight Floor Plan Processor - No Heavy Dependencies
const fs = require('fs').promises;
const path = require('path');

class FloorPlanProcessor {
  
  /**
   * Main processing function - Simplified version
   */
  async processFloorPlan(pdfPath, style = 'modern', userInput = {}) {
    try {
      console.log('🔄 Processing floor plan...');
      
      // Get file info
      const fileStats = await fs.stat(pdfPath);
      const fileName = path.basename(pdfPath);
      
      console.log('📄 File:', fileName, '- Size:', fileStats.size, 'bytes');
      
      // Extract parameters from filename and user input
      const parameters = this.extractParametersFromInput(fileName, userInput, style);
      console.log('✅ Parameters extracted:', parameters);
      
      // Generate room layout
      const roomLayout = this.generateRoomLayout(parameters);
      console.log('✅ Room layout generated');
      
      // Generate AI suggestions
      const suggestions = this.generateSuggestions(parameters, style);
      
      return {
        success: true,
        parameters,
        roomLayout,
        suggestions,
        confidence: 0.85, // Good confidence for user-provided data
        processingMethod: 'rule-based-ai'
      };
      
    } catch (error) {
      console.error('❌ Error processing floor plan:', error);
      throw error;
    }
  }
  
  /**
   * Extract parameters from filename and user input
   */
  extractParametersFromInput(fileName, userInput, style) {
    const params = {
      bedrooms: userInput.bedrooms || 3,
      bathrooms: userInput.bathrooms || 2,
      kitchen: userInput.kitchen !== false,
      livingRoom: userInput.livingRoom !== false,
      totalArea: userInput.totalArea || 2000,
      floors: userInput.floors || 1,
      style: style || 'modern'
    };
    
    // Try to extract from filename
    const lowerFileName = fileName.toLowerCase();
    
    // Extract bedrooms from filename
    const bedroomMatch = lowerFileName.match(/(\d+)\s*(bed|bedroom|br)/);
    if (bedroomMatch && !userInput.bedrooms) {
      params.bedrooms = Math.min(10, Math.max(1, parseInt(bedroomMatch[1])));
    }
    
    // Extract bathrooms from filename
    const bathroomMatch = lowerFileName.match(/(\d+)\s*(bath|bathroom|ba)/);
    if (bathroomMatch && !userInput.bathrooms) {
      params.bathrooms = Math.min(5, Math.max(1, parseInt(bathroomMatch[1])));
    }
    
    // Extract square footage from filename
    const sqftMatch = lowerFileName.match(/(\d+)\s*(sq|sqft|sf)/);
    if (sqftMatch && !userInput.totalArea) {
      params.totalArea = Math.min(10000, Math.max(500, parseInt(sqftMatch[1])));
    }
    
    // Extract floors from filename
    const floorMat await Tesseract.recognize(imagePath, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    return result.data.text;
  }
  
  /**
   * Analyze image properties
   */
  async analyzeImage(imagePath) {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const stats = await image.stats();
    
    return {
      width: metadata.width,
      height: metadata.height,
      aspectRatio: metadata.width / metadata.height,
      brightness: stats.channels[0].mean,
      complexity: this.calculateComplexity(stats)
    };
  }
  
  /**
   * Extract parameters using pattern matching
   */
  async extractParameters(text, imageAnalysis, style) {
    const params = {
      bedrooms: 3,
      bathrooms: 2,
      kitchen: true,
      livingRoom: true,
      totalArea: 2000,
      floors: 1,
      style: style || 'modern'
    };
    
    // Extract bedrooms
    const bedroomMatch = text.match(/(\d+)\s*(bed|bedroom|br|BED|BEDROOM)/i);
    if (bedroomMatch) {
      params.bedrooms = Math.min(10, Math.max(1, parseInt(bedroomMatch[1])));
    }
    
    // Extract bathrooms
    const bathroomMatch = text.match(/(\d+)\s*(bath|bathroom|ba|BATH|BATHROOM)/i);
    if (bathroomMatch) {
      params.bathrooms = Math.min(5, Math.max(1, parseInt(bathroomMatch[1])));
    }
    
    // Extract square footage
    const sqftMatch = text.match(/(\d+)\s*(sq\.?\s*ft|sqft|square\s*feet|SQ\.?\s*FT)/i);
    if (sqftMatch) {
      params.totalArea = Math.min(10000, Math.max(500, parseInt(sqftMatch[1])));
    } else {
      // Estimate from image size
      params.totalArea = Math.round((imageAnalysis.width * imageAnalysis.height) / 500);
      params.totalArea = Math.min(10000, Math.max(1000, params.totalArea));
    }
    
    // Extract floors
    const floorMatch = text.match(/(\d+)\s*(floor|story|storey|level|FLOOR|STORY)/i);
    if (floorMatch) {
      params.floors = Math.min(3, Math.max(1, parseInt(floorMatch[1])));
    }
    
    // Detect room types from text
    params.kitchen = /kitchen|KITCHEN/i.test(text);
    params.livingRoom = /living|lounge|family\s*room|LIVING|LOUNGE/i.test(text);
    
    // Adjust based on image complexity
    if (imageAnalysis.complexity > 150) {
      params.bedrooms = Math.min(params.bedrooms + 1, 10);
    }
    
    return params;
  }
  
  /**
   * Generate room layout based on parameters
   */
  generateRoomLayout(parameters) {
    const { bedrooms, bathrooms, kitchen, livingRoom, totalArea, floors, style } = parameters;
    
    const rooms = [];
    const areaPerFloor = totalArea / floors;
    let currentX = 0;
    let currentZ = 0;
    
    // Calculate room dimensions
    const roomCount = bedrooms + bathrooms + (kitchen ? 1 : 0) + (livingRoom ? 1 : 0);
    const avgRoomArea = areaPerFloor / roomCount;
    const roomSize = Math.sqrt(avgRoomArea) / 10; // Scale down for 3D view
    
    // Living room (larger)
    if (livingRoom) {
      rooms.push({
        type: 'living',
        name: 'Living Room',
        position: { x: currentX, y: 0, z: currentZ },
        dimensions: { width: roomSize * 1.5, height: 3, depth: roomSize }
      });
      currentX += roomSize * 1.5 + 0.3;
    }
    
    // Kitchen
    if (kitchen) {
      rooms.push({
        type: 'kitchen',
        name: 'Kitchen',
        position: { x: currentX, y: 0, z: currentZ },
        dimensions: { width: roomSize, height: 3, depth: roomSize * 0.8 }
      });
      currentX += roomSize + 0.3;
    }
    
    // Bedrooms
    currentX = 0;
    currentZ = roomSize + 0.5;
    
    for (let i = 0; i < bedrooms; i++) {
      rooms.push({
        type: 'bedroom',
        name: `Bedroom ${i + 1}`,
        position: { x: currentX, y: 0, z: currentZ },
        dimensions: { width: roomSize, height: 3, depth: roomSize }
      });
      
      currentX += roomSize + 0.3;
      
      // Move to next row if needed
      if (currentX > roomSize * 3) {
        currentX = 0;
        currentZ += roomSize + 0.3;
      }
    }
    
    // Bathrooms
    for (let i = 0; i < bathrooms; i++) {
      rooms.push({
        type: 'bathroom',
        name: `Bathroom ${i + 1}`,
        position: { x: currentX, y: 0, z: currentZ },
        dimensions: { width: roomSize * 0.6, height: 3, depth: roomSize * 0.6 }
      });
      
      currentX += roomSize * 0.6 + 0.3;
    }
    
    return {
      rooms,
      style,
      totalRooms: rooms.length
    };
  }
  
  /**
   * Calculate complexity score
   */
  calculateComplexity(stats) {
    const avgStdDev = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
    return avgStdDev; // Higher = more complex
  }
  
  /**
   * Calculate confidence score
   */
  calculateConfidence(text, imageAnalysis) {
    let confidence = 0.5; // Base confidence
    
    // Increase if we found specific keywords
    if (/bedroom/i.test(text)) confidence += 0.1;
    if (/bathroom/i.test(text)) confidence += 0.1;
    if (/sq\.?\s*ft/i.test(text)) confidence += 0.15;
    if (/floor/i.test(text)) confidence += 0.05;
    
    // Increase based on image quality
    if (imageAnalysis.width > 1000) confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }
  
  /**
   * Cleanup temporary files
   */
  async cleanup(imagePath) {
    try {
      await fs.unlink(imagePath);
    } catch (err) {
      console.log('Cleanup warning:', err.message);
    }
  }
}

module.exports = new FloorPlanProcessor();
