import { create } from 'zustand';
import type { Message, Notification } from '../types';
import { authorizedUsers } from '../contexts/AuthContext';

interface MessageState {
  messages: Message[];
  notifications: Notification[];
  sendMessage: (senderId: string, recipientId: string, title: string, content: string) => void;
  addNotification: (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  markMessageAsRead: (messageId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  getUnreadCount: (userId: string) => number;
  getUserMessages: (userId: string) => Message[];
  getUserNotifications: (userId: string) => Notification[];
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  notifications: [],
  
  sendMessage: (senderId, recipientId, title, content) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId,
      recipientId,
      title,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    set(state => ({
      messages: [...state.messages, newMessage],
    }));

    // Create a notification for the recipient
    get().addNotification(
      recipientId,
      'New Message',
      `You have a new message: ${title}`,
      'info'
    );
  },

  addNotification: (userId, title, message, type) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      userId,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };

    set(state => ({
      notifications: [...state.notifications, newNotification],
    }));
  },

  markMessageAsRead: (messageId) => {
    set(state => ({
      messages: state.messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ),
    }));
  },

  markNotificationAsRead: (notificationId) => {
    set(state => ({
      notifications: state.notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      ),
    }));
  },

  getUnreadCount: (userId) => {
    const state = get();
    const unreadMessages = state.messages.filter(
      msg => msg.recipientId === userId && !msg.read
    ).length;
    const unreadNotifications = state.notifications.filter(
      notif => notif.userId === userId && !notif.read
    ).length;
    return unreadMessages + unreadNotifications;
  },

  getUserMessages: (userId) => {
    return get().messages.filter(
      msg => msg.recipientId === userId || msg.senderId === userId
    );
  },

  getUserNotifications: (userId) => {
    return get().notifications.filter(notif => notif.userId === userId);
  },
}));

// Initialize some sample messages and notifications
const initializeStore = () => {
  const store = useMessageStore.getState();

  // Add sample messages
  store.sendMessage(
    'f1', // faculty1
    's1', // student1
    'Assignment Feedback',
    'Great work on your recent JavaScript assignment! Keep it up!'
  );

  store.sendMessage(
    'f2', // faculty2
    's2', // student2
    'Course Update',
    'New materials have been added to the Python course. Please review them.'
  );

  // Add sample notifications
  authorizedUsers.students.forEach(student => {
    store.addNotification(
      student.id,
      'Welcome!',
      'Welcome to the platform! Start exploring your courses.',
      'success'
    );
  });

  authorizedUsers.faculty.forEach(faculty => {
    store.addNotification(
      faculty.id,
      'New Feature',
      'You can now send messages to multiple students at once.',
      'info'
    );
  });
};

initializeStore();