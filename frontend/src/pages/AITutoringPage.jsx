import React, { useState, useEffect } from 'react';
import { Send, Trash2, Plus, Loader } from 'lucide-react';
import aiTutoringService from '../services/aiTutoringService';
import courseService from '../services/courseService';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import Button from '../components/Button';

export default function AITutoringPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchConversations();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
      if (data.length > 0) setSelectedCourse(data[0].id);
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await aiTutoringService.getUserConversations();
      setConversations(data);
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const conversation = await aiTutoringService.startConversation(selectedCourse);
      setConversations([conversation, ...conversations]);
      setActiveConversation(conversation);
      setMessages([]);
    } catch (err) {
      setError('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    try {
      setLoading(true);
      const fullConversation = await aiTutoringService.getConversation(conversation.id);
      setActiveConversation(fullConversation);
      setMessages(fullConversation.messages || []);
    } catch (err) {
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    if (!activeConversation) return;
    try {
      setSendingMessage(true);
      const userMsg = { id: Date.now().toString(), type: 'user', content: message };
      setMessages([...messages, userMsg]);
      const response = await aiTutoringService.sendMessage(activeConversation.id, message);
      const aiMsg = { id: (Date.now() + 1).toString(), type: 'ai', content: response.aiMessage.content };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getCourseTitle = (courseId) => {
    return courses.find(c => c.id === courseId)?.title || 'Course';
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-4">
        <h1 className="text-lg font-bold text-gray-800 mb-4">AI Tutor</h1>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3"
        >
          {courses.map(c => (<option key={c.id} value={c.id}>{c.title}</option>))}
        </select>
        <Button onClick={startNewConversation} className="w-full mb-4">New Chat</Button>
        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map(conv => (
            <div key={conv.id} onClick={() => selectConversation(conv)} className="p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
              <p className="text-sm font-medium truncate">{conv.title || getCourseTitle(conv.course_id)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">{activeConversation.title || getCourseTitle(activeConversation.course_id)}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => <ChatMessage key={msg.id} message={msg.content} isUser={msg.type === 'user'} />)}
              {sendingMessage && <div className="text-gray-600 text-sm">AI is thinking...</div>}
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <ChatInput onSendMessage={handleSendMessage} disabled={sendingMessage} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">
            <p>No conversation selected</p>
          </div>
        )}
      </div>
    </div>
  );
}
