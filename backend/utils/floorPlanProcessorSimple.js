const fs = require('fs').promises;
const path = require('path');

/**
 * Simplified Floor Plan Processor
 * No heavy dependencies - uses smart algorithms and pattern matching
 */
class FloorPlanProcessor {
  
  /**
   * Main processing function - Simplified version
   */
  async processFloorPlan(filePath, style = 'modern', userPrompt = '') {
    try {
      console.log('🔄 Processing floor plan (Simplified Mode)...');
      
      // Get file info
      const fileStats = await fs.stat(filePath);
      const fileSize = fileStats.size;
      const fileName = path.basename(filePath);
      
      console.log(`📄 File: ${fileName}, Size: ${Math.round(fileSize / 1024)}KB`);
      
      // Extract parameters from filename and prompt
      const parameters = this.extractParametersFromText(fileName + ' ' + userPrompt, style);
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
        confidence: 0.75, // Good confidence for rule-based system
        processingMethod: 'Smart Pattern Recognition'
      };
      
    } catch (error) {
      console.error('❌ Error processing floor plan:', error);
      throw error;
    }
  }
  
  /**
   * Extract parameters from text (filename + user prompt)
   */
  extractParametersFromText(text, style) {
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
    }
    
    // Extract floors
    const floorMatch = text.match(/(\d+)\s*(floor|story|storey|level|FLOOR|STORY)/i);
    if (floorMatch) {
      params.floors = Math.min(3, Math.max(1, parseInt(floorMatch[1])));
    }
    
    // Detect room types from text
    params.kitchen = /kitchen|KITCHEN/i.test(text);
    params.livingRoom = /living|lounge|family\s*room|LIVING|LOUNGE/i.test(text);
    
    // Smart defaults based on bedrooms
    if (params.bedrooms >= 4) {
      params.bathrooms = Math.max(params.bathrooms, 3);
      params.totalArea = Math.max(params.totalArea, 2500);
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
    
    // Living room (larger, front of house)
    if (livingRoom) {
      rooms.push({
        type: 'living',
        name: 'Living Room',
        position: { x: currentX, y: 0, z: currentZ },
        dimensions: { width: roomSize * 1.5, height: 3, depth: roomSize }
      });
      currentX += roomSize * 1.5 + 0.3;
    }
    
    // Kitchen (next to living room)
    if (kitchen) {
      rooms.push({
        type: 'kitchen',
        name: 'Kitchen',
        position: { x: currentX, y: 0, z: currentZ },
        dimensions: { width: roomSize, height: 3, depth: roomSize * 0.8 }
      });
      currentX += roomSize + 0.3;
    }
    
    // Dining room (if large house)
    if (totalArea > 2500) {
      rooms.push({
        type: 'dining',
        name: 'Dining Room',
        position: { x: currentX, y: 0, z: currentZ },
        dimensions: { width: roomSize * 0.8, height: 3, depth: roomSize * 0.8 }
      });
      currentX += roomSize * 0.8 + 0.3;
    }
    
    // Bedrooms (back of house)
    currentX = 0;
    currentZ = roomSize + 0.5;
    
    for (let i = 0; i < bedrooms; i++) {
      const isMaster = i === 0;
      const roomWidth = isMaster ? roomSize * 1.2 : roomSize;
      const roomDepth = isMaster ? roomSize * 1.1 : roomSize;
      
      rooms.push({
        type: 'bedroom',
        name: isMaster ? 'Master Bedroom' : `Bedroom ${i + 1}`,
        position: { x: currentX, y: 0, z: currentZ },
        dimensions: { width: roomWidth, height: 3, depth: roomDepth }
      });
      
      currentX += roomWidth + 0.3;
      
      // Move to next row if needed
      if (currentX > roomSize * 3) {
        currentX = 0;
        currentZ += roomSize + 0.3;
      }
    }
    
    // Bathrooms (between bedrooms)
    for (let i = 0; i < bathrooms; i++) {
      rooms.push({
        type: 'bathroom',
        name: i === 0 ? 'Master Bathroom' : `Bathroom ${i + 1}`,
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
   * Generate AI suggestions based on parameters
   */
  generateSuggestions(parameters, style) {
    const suggestions = [];
    
    // Style-based suggestions
    if (style === 'modern') {
      suggestions.push('Use clean lines and minimal ornamentation');
      suggestions.push('Incorporate large windows for natural light');
      suggestions.push('Consider open floor plan for living areas');
      suggestions.push('Use neutral color palette with accent colors');
    } else if (style === 'traditional') {
      suggestions.push('Add crown molding and wainscoting');
      suggestions.push('Use warm, rich colors');
      suggestions.push('Consider separate formal dining room');
    } else if (style === 'minimalist') {
      suggestions.push('Keep furniture and decor minimal');
      suggestions.push('Use monochromatic color scheme');
      suggestions.push('Maximize natural light and open space');
    } else if (style === 'luxury') {
      suggestions.push('Add high-end finishes and materials');
      suggestions.push('Consider spa-like master bathroom');
      suggestions.push('Include walk-in closets');
    }
    
    // Size-based suggestions
    if (parameters.totalArea > 3000) {
      suggestions.push('Consider adding a home office or study');
      suggestions.push('Add a separate laundry room');
      suggestions.push('Include a mudroom near entrance');
    }
    
    // Bedroom-based suggestions
    if (parameters.bedrooms > 3) {
      suggestions.push('Create a master suite with ensuite bathroom');
      suggestions.push('Consider Jack-and-Jill bathroom for kids rooms');
    }
    
    // General suggestions
    suggestions.push('Ensure good traffic flow between rooms');
    suggestions.push('Position bedrooms away from noisy areas');
    suggestions.push('Consider natural lighting in all rooms');
    
    return suggestions.slice(0, 6); // Return top 6 suggestions
  }
}

module.exports = new FloorPlanProcessor();
