// Simple RAG chat widget for Abhisek's portfolio
// Backend default: http://localhost:4000 in development.
// For production, set window.RAG_CHAT_API_BASE_URL before this script is loaded.

(function () {
  const API_BASE_URL =
    window.RAG_CHAT_API_BASE_URL || 'http://localhost:3000';

  const widget = document.getElementById('rag-chat-widget');
  if (!widget) return;

  const toggleBtn = document.getElementById('rag-chat-toggle');
  const panel = document.getElementById('rag-chat-panel');
  const messagesEl = document.getElementById('rag-chat-messages');
  const form = document.getElementById('rag-chat-form');
  const input = document.getElementById('rag-chat-input');
  const statusEl = document.getElementById('rag-chat-status');

  let isOpen = false;
  let isSending = false;
  const conversationHistory = [];

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
    } else {
      form.classList.remove('rag-chat-disabled');
      setStatus('');
    }
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

      appendMessage('assistant', reply);
      conversationHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      console.error('RAG chat error:', err);
      appendMessage(
        'assistant',
        'Oops, something went wrong. Please try again in a moment.'
      );
    } finally {
      setSending(false);
      input.focus();
    }
  }

  toggleBtn.addEventListener('click', function () {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('rag-chat-panel-open');
      toggleBtn.classList.add('rag-chat-toggle-open');
      if (!conversationHistory.length) {
        appendMessage(
          'assistant',
          "Hi! I'm Abhisek's AI assistant. Ask me anything about Abhisek, his skills, or experience."
        );
      }
      input.focus();
    } else {
      panel.classList.remove('rag-chat-panel-open');
      toggleBtn.classList.remove('rag-chat-toggle-open');
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!input.value.trim()) return;
    sendMessage(input.value.trim());
  });
})();


