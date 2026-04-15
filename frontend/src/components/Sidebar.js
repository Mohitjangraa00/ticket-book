import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "My Bookings", path: "/bookings" },
    { name: "Upcoming Events", path: "/events" },
    { name: "Profile", path: "/profile" },
    { name: "Logout", path: "/login" },
  ];

  return (
    <>
      {/* Overlay (ONLY when open) */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white z-50 
        transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-700">
          <h1 className="text-2xl font-bold tracking-wide">TicketApp</h1>

          <button
            onClick={toggleSidebar}
            className="text-xl hover:rotate-90 transition-transform duration-300"
          >
            ✖
          </button>
        </div>

        {/* Menu */}
        <ul className="mt-6 space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                onClick={toggleSidebar}
                className="block px-5 py-3 rounded-md mx-2 
                hover:bg-gray-700 hover:translate-x-2 
                transition-all duration-300"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
