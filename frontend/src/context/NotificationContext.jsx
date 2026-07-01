import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Toast from "../components/Toast.jsx";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const notify = useCallback((message, tone = "neutral") => {
    const id = Date.now();
    setNotification({ id, message, tone });
    return id;
  }, []); 

  const clearNotification = useCallback((id) => {
    setNotification((current) => (current?.id === id ? null : current));
  }, []);

  useEffect(() => {
    if (!notification) return undefined;

    const timeoutId = window.setTimeout(() => {
      setNotification(null);
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  const value = useMemo(
    () => ({
      clearNotification,
      notify,
    }),
    [clearNotification, notify]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification ? <Toast tone={notification.tone}>{notification.message}</Toast> : null}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }

  return context;
}
