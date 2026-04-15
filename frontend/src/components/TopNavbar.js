const TopNavbar = ({ toggleSidebar, onLogout }) => {
  return (
    <div className="h-14 bg-white shadow flex items-center px-4 fixed w-full z-30">
      <button onClick={toggleSidebar} className="text-2xl mr-4">
        ☰
      </button>

      <h2 className="text-lg font-semibold flex-1">Dashboard</h2>

      <button
        onClick={onLogout}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default TopNavbar;
