import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Button from './Button';

export default function ChatInput({ onSend, isLoading }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-white">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask me anything about this course..."
        className="flex-1 border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="2"
        disabled={isLoading}
      />
      <Button
        type="submit"
        variant="primary"
        disabled={isLoading || !message.trim()}
        className="self-end"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
