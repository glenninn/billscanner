

// Available models and their characteristics
const CLAUDE_MODELS = {
  OPUS: "claude-3-opus-20240229",    // Most capable, best for complex tasks
  SONNET: "claude-3-5-sonnet-20240620", // Good balance of speed and capability
  HAIKU: "claude-3-haiku-20240307"    // Fastest, best for simple tasks
};

const selectMode= process.env.ANTHROPIC_CLAUDE_MODEL || "OPUS";
const claudeModel = CLAUDE_MODELS[selectMode];

module.exports = claudeModel;

