// const Anthropic= require("@anthropic-ai/sdk");
const claudeModel = require("./claudeModel.js");

const claudeMessageURL = 'https://api.anthropic.com/v1/messages';
const claudeVersionHeader = '2023-06-01';

// Anthropic is very picky about the document type specifier.
// image files like png, jpeg, are type "image" but pdf files
// are type "document"
const imageMedia = {type:"image"}
const documentMedia = {type:"document"}

// 3/2025 These are Anthropic's list of supported image formats that they
// can process
const supportedMedia = {
  "/image/jpeg" : imageMedia,
  "/image/png" : imageMedia,
  "image/jpeg" : imageMedia,
  "image/png" : imageMedia,
  "image/gif" : imageMedia,
  "image/webp" : imageMedia,
  "application/pdf" : documentMedia
}

const getDocumentType = (mimeType)=> mimeType.toLowerCase() in supportedMedia ? supportedMedia[mimeType.toLowerCase()] : null;

const defaultImageSubmission = {
  imagePath : null,
  mimeType : null,
}

async function submitToAnthropic(
  question = "What's in this image?",
  apiKey = null,
  imageInfo = defaultImageSubmission
  ) {

  const userContent = [];
  const response = { data:null, error:null };

  // Make sure we're enabled  to make API calls to Claude
  if(!apiKey) {
    return {
      ...response,
      error: `Missing API Key value`
    }
  }

  // According to Claude, we have to have the text before we push an
  // image
  userContent.push( {
    type: "text",
    text: question
  })

  const {imagePath,mimeType} = imageInfo;

  // If we've been given an image to analyze, load it into the
  // instructions to Claude
  if(imagePath) {
    // Make sure we can support the requested media type
    const documentType = getDocumentType(mimeType)
    if(!documentType) {
      return {
        ...response,
        error: `Unsupported document type ${mimeType}`
      }
    }

    // Convert image to base64
    const fs = require('fs').promises;
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    // build up document descriptor for Claude
    const imageContents = {
      type: documentType.type,
      source: {
        type: "base64",
        media_type: mimeType,
        data: base64Image
      }
    }
    userContent.push(imageContents);
  }

  // Construct the full prompt directive to Anthropic
  const messages = [
    {
      role: "user",
      content: userContent,
    }
  ];

  try {

    const response = await fetch(claudeMessageURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': `${apiKey}`,
        'anthropic-version': claudeVersionHeader,
      },
      body: JSON.stringify({
        model: claudeModel,
        max_tokens: 1024,
        messages: messages
      })
    });

    if (!response.ok) {
      return {
        ...response,
        error: `HTTP response error: ${response.status}`
      }
    }

    const data = await response.json();
    return {
      ...response,
      data
    }
  } catch (error) {
    return {
      ...response,
      error: `Claude error: ${error}`
    }
  }
}

module.exports={claudeModel,submitToAnthropic}
