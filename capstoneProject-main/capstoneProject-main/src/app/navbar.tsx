import { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSession } from "@/app/_components/providers/session";
import Logo_Epson from "@/assets/Logo_Epson.svg";
import {
  DownOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";

const Navbar = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const { user, isAuthenticated, logout } = useSession();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleProfileMobile = () => {
    navigate("/profile", { replace: true });
  };

  return (
    <nav className="w-full bg-white shadow-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-22">
          {/* Left side - Logo */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
              className="lg:hidden focus:outline-none text-black"
            >
              <MenuOutlined className="text-xl" />
            </button>

            <Link to="/" className="flex items-center">
              <img
                src={Logo_Epson}
                alt="Epson Website"
                className="h-22 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Tengah */}
          <div className="hidden lg:flex items-center space-x-17">
            <Link
              to="/"
              className={`relative pb-1 text-sm font-medium transition-colors
      ${
        pathname === "/"
          ? "text-blue-600 after:absolute after:top-13 after:left-0 after:w-full after:h-[2.5px] after:bg-blue-600 after:rounded-full"
          : "text-black"
      }`}
            >
              Home
            </Link>

            <Link
              to="/chatbotpage"
              className={`relative pb-1 text-sm font-medium transition-colors
      ${
        pathname === "/chatbotpage"
          ? "text-blue-600 after:absolute after:top-13 after:left-0 after:w-full after:h-[2.5px] after:bg-blue-600 after:rounded-full"
          : "text-black"
      }`}
            >
              ChatBot
            </Link>

            <Link
              to="/check-warranty"
              className={`relative pb-1 text-sm font-medium transition-colors
      ${
        pathname === "/check-warranty"
          ? "text-blue-600 after:absolute after:top-13 after:left-0 after:w-full after:h-[2.5px] after:bg-blue-600 after:rounded-full"
          : "text-black"
      }`}
            >
              Check Warranty
            </Link>

            <Link
              to="/error-scanner"
              className={`relative pb-1 text-sm font-medium transition-colors
      ${
        pathname === "/error-scanner"
          ? "text-blue-600 after:absolute after:top-13 after:left-0 after:w-full after:h-[2.5px] after:bg-blue-600 after:rounded-full"
          : "text-black"
      }`}
            >
              Error Scanner
            </Link>
          </div>

          {/* Kanan */}
          <div>
            {/* User Authentication Section */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center px-3 py-2 bg-green-600 rounded-lg transition-colors"
                >
                  {/* Avatar circle dengan inisial */}
                  <div className="text-white">
                    <UserOutlined /> {user.name}
                  </div>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {/* Icon profile */}
                        <UserOutlined />
                        Profile
                      </Link>

                      {user.role === "admin" && (
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Dashboard
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className=" border-gray-100 py-1">
                      <button
                        onClick={() => {
                          handleLogout();
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogoutOutlined />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuVisible && (
        <div className="lg:hidden bg-white shadow-md">
          <div className="px-4 pt-4 pb-4 space-y-2">
            {/* Home */}
            <Link
              to="/"
              onClick={() => setMobileMenuVisible(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                pathname === "/"
                  ? "text-green-600 font-semibold"
                  : "text-gray-900 hover:text-green-600"
              }`}
            >
              Home
            </Link>

            {/* About */}
            <Link
              to="/aboutpage"
              onClick={() => setMobileMenuVisible(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                pathname === "/aboutpage"
                  ? "text-green-600 font-semibold"
                  : "text-gray-900 hover:text-green-600"
              }`}
            >
              About
            </Link>

            {/* Services */}
            <div>
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center justify-between transition-colors ${
                  pathname.startsWith("/services")
                    ? "text-green-600 font-semibold"
                    : "text-gray-900 hover:text-green-600"
                }`}
              >
                <span>Services</span>
                <DownOutlined className="text-sm" />
              </button>

              {mobileServicesOpen && (
                <div className="ml-3 mt-2 space-y-1 rounded-lg p-2">
                  <Link
                    to="/servicespage/sewapage"
                    onClick={() => setMobileMenuVisible(false)}
                    className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    Sewa Alat Berat
                  </Link>
                  <Link
                    to="/servicespage/konstruksipage"
                    onClick={() => setMobileMenuVisible(false)}
                    className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    Konstruksi
                  </Link>
                  <Link
                    to="/servicespage/pengadaanpage"
                    onClick={() => setMobileMenuVisible(false)}
                    className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    Pengadaan Barang Jasa
                  </Link>
                </div>
              )}
            </div>

            {/* Karir */}
            <Link
              to="/karirpage"
              onClick={() => setMobileMenuVisible(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                pathname === "/karirpage"
                  ? "text-green-600 font-semibold"
                  : "text-gray-900 hover:text-green-600"
              }`}
            >
              Karir
            </Link>

            {/* Auth Section */}
            <div className="pt-4 border-t border-gray-200">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  {user.role === "admin" && (
                    <Link
                      to="/dashboard"
                      className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleProfileMobile}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border border-gray-500 rounded-lg flex gap-2 items-center justify-center"
                  >
                    <UserOutlined />
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
