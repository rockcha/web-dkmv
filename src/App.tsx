// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/AppRoutes";
import { AuthProvider } from "@/features/auth/AuthContext";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
