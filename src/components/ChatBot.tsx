import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ContactInfo {
  name: string;
  email: string;
}

const commonQuestions = [
  'How do I get started?',
  'What courses are available?',
  'How do I contact support?',
  'What are the pricing plans?'
];

const botResponses: Record<string, string> = {
  'how do i get started?': 'To get started, you can sign up for an account and explore our available courses. Would you like me to help you with the registration process?',
  'what courses are available?': 'We offer a variety of courses including Python, JavaScript, Java, and C++. Each course is designed for different skill levels. Would you like to see the full course catalog?',
  'how do i contact support?': 'You can reach our support team through email at support@example.com or use the contact form. Would you like to leave your contact information for our team?',
  'what are the pricing plans?': 'We offer flexible pricing plans starting from $29/month. This includes access to all basic courses. Would you like to learn more about our premium plans?',
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isCollectingContact, setIsCollectingContact] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ name: '', email: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleBotResponse('Hi! 👋 I\'m your AI assistant. How can I help you today?');
    }
    scrollToBottom();
  }, [messages, isOpen]);

  const handleBotResponse = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date()
    }]);
  };

  const handleUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }]);

    // Process user message
    const lowerContent = content.toLowerCase();
    setTimeout(() => {
      if (botResponses[lowerContent]) {
        handleBotResponse(botResponses[lowerContent]);
      } else if (lowerContent.includes('contact') || lowerContent.includes('support')) {
        setIsCollectingContact(true);
        handleBotResponse('I\'ll help you get in touch with our support team. Could you please provide your name and email?');
      } else {
        handleBotResponse('I\'m not sure how to help with that specific query. Would you like me to connect you with our support team?');
      }
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (isCollectingContact) {
      // Handle contact information collection
      if (!contactInfo.name) {
        setContactInfo(prev => ({ ...prev, name: inputValue }));
        handleUserMessage(inputValue);
        handleBotResponse('Great! Now, could you please provide your email address?');
      } else if (!contactInfo.email) {
        setContactInfo(prev => ({ ...prev, email: inputValue }));
        handleUserMessage(inputValue);
        handleBotResponse('Thank you! Our support team will contact you shortly at ' + inputValue);
        setIsCollectingContact(false);
      }
    } else {
      handleUserMessage(inputValue);
    }

    setInputValue('');
  };

  const handleQuestionClick = (question: string) => {
    handleUserMessage(question);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-lg shadow-xl w-96 mb-4 border border-gray-200"
          >
            {/* Chat Header */}
            <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 hover:bg-indigo-500 rounded"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-indigo-500 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Common questions:</p>
                <div className="flex flex-wrap gap-2">
                  {commonQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionClick(question)}
                      className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    isCollectingContact
                      ? !contactInfo.name
                        ? 'Enter your name...'
                        : 'Enter your email...'
                      : 'Type your message...'
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <AnimatePresence>
        {isMinimized ? (
          <motion.button
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={() => setIsMinimized(false)}
            className="bg-indigo-600 text-white p-4 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chat with AI Assistant</span>
            <Maximize2 className="w-4 h-4" />
          </motion.button>
        ) : !isOpen && (
          <motion.button
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}