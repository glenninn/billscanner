const Anthropic= require("@anthropic-ai/sdk");
// please provide just a json object with the extracted fields and values
// Available models and their characteristics
const CLAUDE_MODELS = {
    OPUS: "claude-3-opus-20240229",    // Most capable, best for complex tasks
    SONNET: "claude-3-5-sonnet-20240620", // Good balance of speed and capability
    HAIKU: "claude-3-haiku-20240307"    // Fastest, best for simple tasks
  };
const claudeModel = CLAUDE_MODELS.OPUS;

async function sendChatMessage(message, apiKey, options = {}) {
    const {
      model = claudeModel,
      maxTokens = 1024,
      system = "",
      temperature = 1,
      imageBase64 = null,
    } = options;

    const anthropic = new Anthropic({
      apiKey: apiKey
    });

    const userContent = [];

    // Add image if provided
    if (imageBase64) {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: imageBase64
        }
      });
    }

    // Add text message
    userContent.push({
      type: "text",
      text: message
    });

    try {
      const message = await anthropic.messages.create({
        model: model,
        max_tokens: maxTokens,
        system: system,
        temperature: temperature,
        messages: [{
          role: "user",
          content: userContent
        }]
      });

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

// Function for image submission
async function submitImageToAnthropic(imagePath, apiKey, question = "What's in this image?") {
    const fs = require('fs').promises;
    const anthropic = new Anthropic({
      apiKey: apiKey
    });

    try {
      // Convert image to base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      console.log(`base64Image length: ${base64Image.length} `)
      console.log(`Question is: ${question} `)

      const userContent = [];

      // Add the image material to be processed
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: base64Image
        }
      });

      // And then add the analysis we desire
      userContent.push(
        {
            type: "text",
            text: question
        }
      );


      const message = await anthropic.messages.create({
        model: claudeModel,
        max_tokens: 1024,
        // system: "",
        // temperature: 1,
        // imageBase64 : null,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Image
              }
            },
            {
              type: "text",
              text: question
            }
          ]
        }]
      });

      return {
        response: message,
        base64Image: base64Image
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

module.exports = {claudeModel,submitImageToAnthropic,sendChatMessage};
