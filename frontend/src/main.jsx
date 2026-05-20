import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { PlayerProvider } from "./context/PlayerContext.jsx";
import { UserLibraryProvider } from "./context/UserLibraryContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <NotificationProvider>
        <AuthProvider>
          <UserLibraryProvider>
            <PlayerProvider>
              <App />
            </PlayerProvider>
          </UserLibraryProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
