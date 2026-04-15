import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import AIAssistant from "./AIAssistant";

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar — shared across all pages */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Top Navbar — shared across all pages */}
      <TopNavbar toggleSidebar={toggleSidebar} onLogout={handleLogout} />

      {/* Page content */}
      <main className="pt-16">
        {children}
      </main>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};

export default Layout;