// Import WebLLM from CDN
import * as webllm from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm";

// DOM elements
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Chat history
let messages = [
  { role: "system", content: "You are a helpful AI assistant." }
];

// Initialize WebLLM engine
let engine = null;

async function initializeEngine() {
  // Show loading message
  const loadingMessage = document.createElement('div');
  loadingMessage.className = 'message loading';
  loadingMessage.textContent = '正在加载模型，请稍候...';
  chatContainer.appendChild(loadingMessage);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Callback function to update model loading progress
  const initProgressCallback = (report) => {
    loadingMessage.textContent = `正在加载模型: ${report.text}`;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  // Select a model
  // Using a smaller model for faster loading and less resource consumption
  const selectedModel = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

  try {
    // Create engine
    engine = await webllm.CreateMLCEngine(
      selectedModel,
      { initProgressCallback: initProgressCallback }
    );
    
    // Remove loading message
    chatContainer.removeChild(loadingMessage);
    
    // Add welcome message
    addMessage('ai', '你好！我是基于WebLLM的AI助手。有什么我可以帮你的吗？');
  } catch (error) {
    console.error('Failed to initialize WebLLM engine:', error);
    loadingMessage.textContent = '模型加载失败，请检查控制台错误信息。';
  }
}

// Add message to chat container
function addMessage(role, content) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${role}-message`;
  messageElement.textContent = content;
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send message to AI
async function sendChatMessage() {
  const message = userInput.value.trim();
  if (!message || !engine) return;

  // Add user message to UI
  addMessage('user', message);
  
  // Clear input
  userInput.value = '';
  
  // Add user message to history
  messages.push({ role: 'user', content: message });
  
  // Show loading indicator
  const loadingMessage = document.createElement('div');
  loadingMessage.className = 'message loading';
  loadingMessage.textContent = 'AI 正在思考...';
  chatContainer.appendChild(loadingMessage);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  try {
    // Generate AI response
    const reply = await engine.chat.completions.create({
      messages: messages,
    });
    
    // Remove loading message
    chatContainer.removeChild(loadingMessage);
    
    // Add AI response to UI
    const aiMessage = reply.choices[0].message.content;
    addMessage('ai', aiMessage);
    
    // Add AI response to history
    messages.push({ role: 'assistant', content: aiMessage });
  } catch (error) {
    console.error('Failed to generate response:', error);
    chatContainer.removeChild(loadingMessage);
    addMessage('ai', '抱歉，我无法生成回复。请稍后重试。');
  }
}

// Event listeners
sendButton.addEventListener('click', sendChatMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendChatMessage();
  }
});

// Initialize the engine when the page loads
window.addEventListener('load', initializeEngine);