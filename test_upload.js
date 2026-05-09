const fs = require('fs');
const path = require('path');

async function testUpload() {
  const FormData = require('form-data');
  const form = new FormData();
  
  // Create a dummy image
  const dummyImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  form.append('pdf', dummyImage, { filename: 'test.png', contentType: 'image/png' });
  form.append('style', 'modern');

  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch('http://localhost:5000/api/ai-designer/upload-plan', {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

testUpload();
