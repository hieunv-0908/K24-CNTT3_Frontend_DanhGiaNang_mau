import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({
  showToast: () => {},
});

export function ToastProvider({ children }) {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastMessage && (
        <div data-testid="toast" className="toast">
          {toastMessage}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
