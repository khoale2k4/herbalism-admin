'use client';

import { AlertCircle, CheckCircle, Info, ShoppingCart } from 'lucide-react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Định nghĩa kiểu cho notification
type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Định nghĩa object thông báo
type NotificationProps = {
    message: string;
    type?: NotificationType;
    duration?: number;
    title?: string;
};

// Object thông báo đầy đủ (bao gồm cả ID và trạng thái)
type Notification = NotificationProps & {
    id: string;
    type: NotificationType;
    progress: number;
    visible: boolean;
};

type NotificationContextType = {
    showNotification: (props: NotificationProps) => void;
    hideNotification: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (notifications.length === 0) return;

        const intervalId = setInterval(() => {
            setNotifications(prev =>
                prev.map(notification => {
                    if (notification.progress >= 100) {
                        return { ...notification, visible: false };
                    }
                    const step = 100 / (notification.duration || 3000) * 100;
                    return {
                        ...notification,
                        progress: Math.min(notification.progress + step, 100)
                    };
                })
            );
        }, 100);

        return () => clearInterval(intervalId);
    }, [notifications]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setNotifications(prev => prev.filter(notif => notif.visible));
        }, 500);

        return () => clearTimeout(timeout);
    }, [notifications]);

    const showNotification = (props: NotificationProps) => {
        const id = Math.random().toString(36).substring(2, 9);
        const type = props.type || 'info';
        const duration = props.duration || 5000;

        const newNotification: Notification = {
            id,
            message: props.message,
            type,
            title: props.title,
            duration,
            progress: 0,
            visible: true
        };

        setNotifications((prev) => [...prev, newNotification]);
    };

    const hideNotification = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, visible: false, progress: 100 }
                    : notification
            )
        );
    };

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            <div className="fixed bottom-4 right-4 md:bottom-10 md:right-10 z-50 flex flex-col gap-3">
                {notifications.map((notification) => {
                    const { id, message, title, type, visible, duration = 5000 } = notification;

                    const bgColor = {
                        success: 'bg-green-500',
                        error: 'bg-red-500',
                        warning: 'bg-yellow-500',
                        info: 'bg-blue-500',
                    }[type];

                    const borderColor = {
                        success: 'border-green-500',
                        error: 'border-red-500',
                        warning: 'border-yellow-500',
                        info: 'border-blue-500',
                    }[type];

                    const icon = {
                        success: <CheckCircle size={20} />,
                        error: <AlertCircle size={20} />,
                        warning: <AlertCircle size={20} />,
                        info: <Info size={20} />,
                    }[type];

                    return (
                        <div
                            key={id}
                            className={`relative flex w-[250px] max-w-full items-center shadow-lg rounded-lg border-l-4 ${borderColor} overflow-hidden transform transition-all duration-300 ease-in-out ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
                            role="alert"
                        >
                            <div className={`${bgColor} p-3 flex items-center justify-center text-white`}>
                                <span className="text-xl">{icon}</span>
                            </div>

                            <div className="bg-white p-3 pl-4 pr-8 flex-grow relative">
                                {title && <p className="text-sm font-semibold text-gray-800">{title}</p>}
                                <p className="text-sm text-gray-700">{message}</p>

                                <button
                                    onClick={() => hideNotification(id)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Close notification"
                                >
                                    ✕
                                </button>

                                {duration > 0 && (
                                    <div
                                        className={`absolute bottom-0 left-0 h-1 ${bgColor} transition-all duration-linear`}
                                        style={{
                                            width: '100%',
                                            animation: `shrinkWidth ${duration / 1000}s linear forwards`,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}

                <style jsx>{`
    @keyframes shrinkWidth {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
  `}</style>
            </div>

        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};