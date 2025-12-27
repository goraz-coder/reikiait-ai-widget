(function () {
    // Configuration - will be set by the embed script
    const API_URL = window.REIKIAIT_API_URL || '';

    // Styles
    const styles = `
    #reikiait-widget-container * {
      box-sizing: border-box;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    #reikiait-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 8px 32px rgba(37, 99, 235, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    #reikiait-widget-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 40px rgba(37, 99, 235, 0.5);
    }
    
    #reikiait-widget-btn svg {
      width: 28px;
      height: 28px;
      color: white;
    }
    
    #reikiait-widget-btn .pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(37, 99, 235, 0.4);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
    }
    
    #reikiait-chat-window {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 380px;
      height: 520px;
      max-width: calc(100vw - 48px);
      max-height: calc(100vh - 130px);
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      border-radius: 24px;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
      display: none;
      flex-direction: column;
      z-index: 999998;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    #reikiait-chat-window.open {
      display: flex;
      animation: slideUp 0.3s ease-out;
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    #reikiait-chat-header {
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    #reikiait-chat-header .title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #e2e8f0;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.5px;
    }
    
    #reikiait-chat-header .status {
      width: 10px;
      height: 10px;
      background: #22c55e;
      border-radius: 50%;
      animation: statusPulse 2s infinite;
    }
    
    @keyframes statusPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    #reikiait-chat-header .close-btn {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      transition: color 0.2s;
    }
    
    #reikiait-chat-header .close-btn:hover {
      color: white;
    }
    
    #reikiait-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    #reikiait-messages::-webkit-scrollbar {
      width: 6px;
    }
    
    #reikiait-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    
    #reikiait-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }
    
    .reikiait-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .reikiait-message.assistant {
      background: rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    
    .reikiait-message.user {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    
    .reikiait-typing {
      display: flex;
      gap: 4px;
      padding: 16px;
      align-self: flex-start;
    }
    
    .reikiait-typing span {
      width: 8px;
      height: 8px;
      background: #3b82f6;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    
    .reikiait-typing span:nth-child(1) { animation-delay: -0.32s; }
    .reikiait-typing span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    
    #reikiait-input-form {
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      gap: 10px;
    }
    
    #reikiait-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px 16px;
      color: white;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
    }
    
    #reikiait-input::placeholder {
      color: #64748b;
    }
    
    #reikiait-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }
    
    #reikiait-send-btn {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      border: none;
      border-radius: 12px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    #reikiait-send-btn:hover {
      transform: scale(1.05);
    }
    
    #reikiait-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    #reikiait-send-btn svg {
      width: 20px;
      height: 20px;
      color: white;
    }

    @media (max-width: 480px) {
      #reikiait-chat-window {
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        border-radius: 0;
      }
      
      #reikiait-widget-btn {
        bottom: 16px;
        right: 16px;
      }
    }
  `;

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Load Inter font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Create widget HTML
    const container = document.createElement('div');
    container.id = 'reikiait-widget-container';
    container.innerHTML = `
    <button id="reikiait-widget-btn" aria-label="Atidaryti IT pagalbos pokalbį">
      <div class="pulse"></div>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </button>
    
    <div id="reikiait-chat-window">
      <div id="reikiait-chat-header">
        <div class="title">
          <div class="status"></div>
          <span><em>Reikia</em><span style="color: #3b82f6">IT</span> AI Pagalba</span>
        </div>
        <button class="close-btn" aria-label="Uždaryti">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div id="reikiait-messages"></div>
      
      <form id="reikiait-input-form">
        <input type="text" id="reikiait-input" placeholder="Aprašykite IT problemą..." autocomplete="off" />
        <button type="submit" id="reikiait-send-btn" aria-label="Siųsti">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  `;
    document.body.appendChild(container);

    // Widget logic
    const widgetBtn = document.getElementById('reikiait-widget-btn');
    const chatWindow = document.getElementById('reikiait-chat-window');
    const closeBtn = chatWindow.querySelector('.close-btn');
    const messagesContainer = document.getElementById('reikiait-messages');
    const inputForm = document.getElementById('reikiait-input-form');
    const input = document.getElementById('reikiait-input');
    const sendBtn = document.getElementById('reikiait-send-btn');

    let isOpen = false;
    let isLoading = false;
    let chatHistory = [];

    // Initial greeting
    const greeting = 'Sveiki! Aš esu ReikiaIT dirbtinio intelekto asistentas. Kokios IT problemos Jus šiandien kankina? Aprašykite situaciją, o aš pasistengsiu padėti diagnozuoti gedimą.';

    function addMessage(content, role) {
        const msg = document.createElement('div');
        msg.className = `reikiait-message ${role}`;
        msg.textContent = content;
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        if (role !== 'typing') {
            chatHistory.push({ role, content });
        }
    }

    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'reikiait-typing';
        typing.id = 'reikiait-typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(typing);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTyping() {
        const typing = document.getElementById('reikiait-typing-indicator');
        if (typing) typing.remove();
    }

    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) {
            chatWindow.classList.add('open');
            widgetBtn.style.display = 'none';
            input.focus();

            // Add greeting if first time
            if (messagesContainer.children.length === 0) {
                addMessage(greeting, 'assistant');
            }
        } else {
            chatWindow.classList.remove('open');
            widgetBtn.style.display = 'flex';
        }
    }

    async function sendMessage(message) {
        if (!message.trim() || isLoading) return;

        addMessage(message, 'user');
        input.value = '';
        isLoading = true;
        sendBtn.disabled = true;
        showTyping();

        try {
            const response = await fetch(API_URL + '/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    history: chatHistory.slice(0, -1) // Exclude the message we just added
                })
            });

            hideTyping();

            if (!response.ok) throw new Error('API error');

            const data = await response.json();
            addMessage(data.response || data.error, 'assistant');
        } catch (error) {
            hideTyping();
            addMessage('Atsiprašome, kilo techninių kliūčių. Prašome kreiptis tiesiogiai tel. +370 645 69000.', 'assistant');
        } finally {
            isLoading = false;
            sendBtn.disabled = false;
        }
    }

    // Event listeners
    widgetBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage(input.value);
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            toggleChat();
        }
    });
})();
