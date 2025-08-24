// Import WebLLM from CDN
import * as webllm from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm";

// DOM elements
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const modelSelection = document.getElementById('model-selection');
const loadModelButton = document.getElementById('load-model-button');
const loadingMessage = document.getElementById('loading-message');

// Chat history
let messages = [
  { role: "system", content: "You are a helpful AI assistant." }
];

// Initialize WebLLM engine
let engine = null;

// Callback function to update model loading progress
function initProgressCallback(report) {
  const progress = report.progress ? ` (${(report.progress * 100).toFixed(1)}%)` : '';
  loadingMessage.textContent = `正在加载模型: ${report.text}${progress}`;
  loadingMessage.style.display = 'block';
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function loadModel() {
  // Clear chat container
  chatContainer.innerHTML = '';
  
  // Reset messages
  messages = [
    { role: "system", content: "You are a helpful AI assistant." }
  ];
  
  // Get selected model
  const selectedModel = modelSelection.value;
  
  // Disable UI elements during loading
  modelSelection.disabled = true;
  loadModelButton.disabled = true;
  sendButton.disabled = true;
  
  try {
    // Create or reload engine
    if (engine === null) {
      engine = await webllm.CreateMLCEngine(
        selectedModel,
        { initProgressCallback: initProgressCallback }
      );
    } else {
      await engine.reload(selectedModel, { initProgressCallback: initProgressCallback });
    }
    
    // Hide loading message
    loadingMessage.style.display = 'none';
    
    // Enable send button
    sendButton.disabled = false;
    
    // Add welcome message with model info
    addMessage('ai', `✅ 模型 ${selectedModel} 已加载成功！\n\n💡 提示：\n- 当前模型支持中文和英文对话\n- 点击发送按钮或按 Enter 键发送消息\n- 如需切换模型，请重新选择并点击"加载模型"\n\n有什么我可以帮你的吗？`);
  } catch (error) {
    console.error('Failed to load model:', error);
    
    let errorMessage = '模型加载失败';
    if (error.message.includes('WebGPU')) {
      errorMessage = '❌ 您的浏览器不支持 WebGPU，请使用 Chrome/Edge 最新版本';
    } else if (error.message.includes('Network')) {
      errorMessage = '❌ 网络连接失败，请检查网络后重试';
    } else if (error.message.includes('memory')) {
      errorMessage = '❌ 内存不足，请尝试选择更小的模型';
    } else {
      errorMessage = `❌ 加载失败：${error.message}`;
    }
    
    loadingMessage.textContent = errorMessage;
    loadingMessage.style.display = 'block';
    
    // Enable model selection
    modelSelection.disabled = false;
    loadModelButton.disabled = false;
  }
}

// Enable the load model button when the page loads
window.addEventListener('load', async () => {
  loadModelButton.disabled = false;
  
  // Check WebGPU support
  if (!navigator.gpu) {
    addMessage('ai', '⚠️ 警告：您的浏览器不支持 WebGPU\n\nWebLLM 需要 WebGPU 支持才能运行。请使用以下浏览器：\n- Chrome 113+ 或 Edge 113+\n- Chrome Canary (最新测试版)\n- 其他支持 WebGPU 的现代浏览器\n\n当前浏览器将无法加载模型。');
    loadModelButton.disabled = true;
  } else {
    addMessage('ai', '👋 欢迎使用 WebLLM AI 聊天！\n\n📋 使用步骤：\n1. 从下拉菜单选择一个模型\n2. 点击"加载模型"按钮\n3. 等待模型下载和初始化\n4. 开始对话！\n\n💡 建议：\n- 新手推荐 Llama-3.2-1B 系列（内存占用小）\n- 需要更好性能选择 Llama-3.1-8B 系列\n- 首次加载需要下载模型，请耐心等待');
  }
});

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
loadModelButton.addEventListener('click', loadModel);

// Initialize the engine when the page loads
// window.addEventListener('load', initializeEngine);