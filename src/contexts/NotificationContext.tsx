
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from "sonner";
import { useAuth } from './AuthContext';

// Define notification interface
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  date: Date;
  forRole?: string | null;
}

// Define notification context interface
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'date'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

// Create the notification context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Sample notifications
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Order',
    message: 'You received a new order for Handmade Ceramic Bowl',
    type: 'success',
    read: false,
    date: new Date(),
    forRole: 'vendor'
  },
  {
    id: '2',
    title: 'Order Status',
    message: 'Your order #1234 has been shipped',
    type: 'info',
    read: false,
    date: new Date(),
    forRole: 'customer'
  },
  {
    id: '3',
    title: 'New Product Approval',
    message: 'A new product is waiting for approval',
    type: 'warning',
    read: false,
    date: new Date(),
    forRole: 'admin'
  }
];

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const { user } = useAuth();

  const userRole = user?.role || null;

  // Filter notifications based on user role
  const filteredNotifications = notifications.filter(
    notif => !notif.forRole || notif.forRole === userRole
  );

  // Calculate unread notifications count
  const unreadCount = filteredNotifications.filter(notif => !notif.read).length;

  // Add new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'date'>) => {
    const newNotification: Notification = {
      ...notification,
      id: String(Date.now()),
      read: false,
      date: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Also show a toast for immediate feedback
    toast[notification.type || 'info'](notification.title, {
      description: notification.message,
    });
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: filteredNotifications,
        unreadCount,
        addNotification,
        markAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for using notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within an NotificationProvider');
  }
  return context;
};
