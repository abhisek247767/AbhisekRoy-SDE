// Simple RAG chat widget for Abhisek's portfolio
// Backend default: http://localhost:3000 in development.
// For production, set window.RAG_CHAT_API_BASE_URL before this script is loaded.

(function () {
  const API_BASE_URL =
    window.RAG_CHAT_API_BASE_URL || 'http://localhost:3000';

  const widget = document.getElementById('rag-chat-widget');
  if (!widget) return;

  const toggleBtn = document.getElementById('rag-chat-toggle');
  const toggleIconOpen = toggleBtn.querySelector('.rag-chat-toggle-icon-open');
  const toggleIconClose = toggleBtn.querySelector('.rag-chat-toggle-icon-close');
  const panel = document.getElementById('rag-chat-panel');
  const messagesEl = document.getElementById('rag-chat-messages');
  const typingIndicator = document.getElementById('rag-chat-typing-indicator');
  const form = document.getElementById('rag-chat-form');
  const input = document.getElementById('rag-chat-input');
  const statusEl = document.getElementById('rag-chat-status');
  const minimizeBtn = document.getElementById('rag-chat-minimize');
  const clearBtn = document.getElementById('rag-chat-clear');
  const notificationSound = document.getElementById('rag-chat-notification-sound');

  const WELCOME_MESSAGE = "Hi! I'm Abhisek's AI assistant. Ask me anything about Abhisek, his skills, or experience.";

  let isOpen = false;
  let isMinimized = false;
  let isSending = false;
  const conversationHistory = [];

  // Play notification sound (if file exists)
  function playNotificationSound() {
    if (notificationSound) {
      try {
        notificationSound.play().catch(err => {
          // Sound file not found or autoplay blocked - that's okay
          console.log('Notification sound not available:', err.message);
        });
      } catch (err) {
        // Ignore errors if sound file doesn't exist yet
      }
    }
  }

  function showTypingIndicator() {
    if (typingIndicator) {
      typingIndicator.style.display = 'flex';
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  function hideTypingIndicator() {
    if (typingIndicator) {
      typingIndicator.style.display = 'none';
    }
  }

  function appendMessage(role, content) {
    const msg = document.createElement('div');
    msg.className =
      'rag-chat-message ' +
      (role === 'user' ? 'rag-chat-message-user' : 'rag-chat-message-bot');

    const bubble = document.createElement('div');
    bubble.className = 'rag-chat-bubble';
    bubble.textContent = content;
    msg.appendChild(bubble);

    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Play sound for bot messages
    if (role === 'assistant') {
      playNotificationSound();
    }
  }

  function setStatus(text) {
    if (!statusEl) return;
    statusEl.textContent = text || '';
  }

  function setSending(sending) {
    isSending = sending;
    if (sending) {
      form.classList.add('rag-chat-disabled');
      setStatus('Thinking...');
      showTypingIndicator();
    } else {
      form.classList.remove('rag-chat-disabled');
      setStatus('');
      hideTypingIndicator();
    }
  }

  function showWelcomeMessage() {
    // Always show welcome message when opening
    appendMessage('assistant', WELCOME_MESSAGE);
    conversationHistory.push({ role: 'assistant', content: WELCOME_MESSAGE });
  }

  function clearChat() {
    messagesEl.innerHTML = '';
    conversationHistory.length = 0;
    showWelcomeMessage();
  }

  function openChat() {
    isOpen = true;
    isMinimized = false;
    panel.classList.add('rag-chat-panel-open');
    panel.classList.remove('rag-chat-panel-minimized');
    toggleBtn.classList.add('rag-chat-toggle-open');
    
    // Update toggle button icons
    if (toggleIconOpen) toggleIconOpen.style.display = 'none';
    if (toggleIconClose) toggleIconClose.style.display = 'inline-block';
    
    // Show welcome message every time chat opens (check if already shown to avoid duplicates)
    const lastMessage = messagesEl.lastElementChild;
    const lastMessageText = lastMessage?.querySelector('.rag-chat-bubble')?.textContent;
    if (!lastMessageText || lastMessageText !== WELCOME_MESSAGE) {
      showWelcomeMessage();
    }
    
    input.focus();
  }

  function closeChat() {
    isOpen = false;
    isMinimized = false;
    panel.classList.remove('rag-chat-panel-open');
    panel.classList.remove('rag-chat-panel-minimized');
    toggleBtn.classList.remove('rag-chat-toggle-open');
    
    // Update toggle button icons
    if (toggleIconOpen) toggleIconOpen.style.display = 'inline-block';
    if (toggleIconClose) toggleIconClose.style.display = 'none';
  }

  function minimizeChat() {
    isMinimized = true;
    panel.classList.add('rag-chat-panel-minimized');
    closeChat(); // This will also update the toggle button icons
  }

  async function sendMessage(message) {
    if (!message.trim()) return;
    if (isSending) return;

    appendMessage('user', message);
    conversationHistory.push({ role: 'user', content: message });
    input.value = '';

    setSending(true);

    try {
      const res = await fetch(API_BASE_URL + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          history: conversationHistory
        })
      });

      if (!res.ok) {
        throw new Error('Request failed with status ' + res.status);
      }

      const data = await res.json();
      const reply = data.reply || 'Sorry, I could not generate a response.';

      hideTypingIndicator();
      appendMessage('assistant', reply);
      conversationHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      console.error('RAG chat error:', err);
      hideTypingIndicator();
      appendMessage(
        'assistant',
        'Oops, something went wrong. Please try again in a moment.'
      );
    } finally {
      setSending(false);
      input.focus();
    }
  }

  // Toggle button click handler
  toggleBtn.addEventListener('click', function () {
    if (isOpen && !isMinimized) {
      closeChat();
    } else {
      openChat();
    }
  });

  // Minimize button click handler
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      minimizeChat();
    });
  }

  // Clear button click handler
  if (clearBtn) {
    clearBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (confirm('Are you sure you want to clear the chat history?')) {
        clearChat();
      }
    });
  }

  // Form submit handler
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!input.value.trim()) return;
    sendMessage(input.value.trim());
  });

  // Prevent panel clicks from closing
  panel.addEventListener('click', function (e) {
    e.stopPropagation();
  });
})();
