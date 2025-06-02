import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageCircle, X, Check, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { useMessageStore } from '../store/messageStore';
import { format } from 'date-fns';
import type { Message, Notification } from '../types';

interface NotificationCenterProps {
  userId: string;
}

export default function NotificationCenter({ userId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  
  const {
    getUserMessages,
    getUserNotifications,
    getUnreadCount,
    markMessageAsRead,
    markNotificationAsRead,
  } = useMessageStore();

  const messages = getUserMessages(userId);
  const notifications = getUserNotifications(userId);
  const unreadCount = getUnreadCount(userId);

  const handleMarkAsRead = (item: Message | Notification) => {
    if ('recipientId' in item) {
      markMessageAsRead(item.id);
    } else {
      markNotificationAsRead(item.id);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50"
          >
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'notifications'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'messages'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Messages</span>
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'notifications' ? (
                <div className="divide-y">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 ${
                          !notification.read ? 'bg-indigo-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleMarkAsRead(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {messages.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No messages
                    </div>
                  ) : (
                    messages.map(message => (
                      <div
                        key={message.id}
                        className={`p-4 ${
                          !message.read && message.recipientId === userId
                            ? 'bg-indigo-50'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleMarkAsRead(message)}
                      >
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-900">
                            {message.title}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {message.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}