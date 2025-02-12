// const Anthropic= require("@anthropic-ai/sdk");
// please provide just a json object with the extracted fields and values
// Available models and their characteristics
const CLAUDE_MODELS = {
  OPUS: "claude-3-opus-20240229",    // Most capable, best for complex tasks
  SONNET: "claude-3-5-sonnet-20240620", // Good balance of speed and capability
  HAIKU: "claude-3-haiku-20240307"    // Fastest, best for simple tasks
};
const claudeModel = require("./claudeModel.js");

async function sendChatMessage() {

}

async function submitImageToAnthropic(imagePath, apiKey, question = "What's in this image?") {

  const userContent = [];

  // If we've been given an image to analyze, load it into the
  // instructions to Claude
  if(imagePath) {
    // Convert image to base64
    const fs = require('fs').promises;
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const imageContents = {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: base64Image
        }
    }
    userContent.push(imageContents);
  }

  // have to have the big question to make claude "think"
  userContent.push( {
    type: "text",
    text: question
  })

  const messages = [
    {
      role: "user",
      content: userContent,
    }
  ];



  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: claudeModel,
        max_tokens: 1024,
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

module.exports={claudeModel,sendChatMessage,submitImageToAnthropic}
