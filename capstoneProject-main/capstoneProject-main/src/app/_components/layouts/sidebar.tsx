import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, type JSX } from "react";
import { useSession } from "@/app/_components/providers/session";
import imgLogo from "@/assets/logo PT BAS.png";
import {
  HomeOutlined,
  ToolOutlined,
  BuildOutlined,
  ShoppingCartOutlined,
  BankOutlined,
  ReadOutlined,
  InboxOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
  SolutionOutlined,
  LogoutOutlined,
  HistoryOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";

interface SubMenuItem {
  path?: string;
  label: string;
  icon: JSX.Element;
  submenu?: SubMenuItem[];
}

interface MenuItem {
  path?: string;
  label: string;
  icon: JSX.Element;
  submenu?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: <HomeOutlined /> },
  {
    path: "/sewa-alat-berat",
    label: "Sewa Alat Berat",
    icon: <ToolOutlined />,
  },
  {
    path: "/permintaan-jasa-konstruksi",
    label: "Jasa Konstruksi",
    icon: <BuildOutlined />,
  },
  {
    path: "/pembelian-barang",
    label: "Pembelian Barang",
    icon: <ShoppingCartOutlined />,
  },
  {
    label: "Lamaran Kerja",
    icon: <BankOutlined />,
    submenu: [
      {
        label: "Pelamar",
        icon: <UserOutlined />,
        submenu: [
          {
            path: "/lamaran-kerja/daftar-pelamar",
            label: "Daftar Lamaran",
            icon: <TeamOutlined />,
          },
          {
            path:"/lamaran-kerja/history-daftar-pelamar",
            label: "Riwayat Lamaran",
            icon: <HistoryOutlined />,
          },
        ],
      },
      {
        label: "Posting Pekerjaan",
        icon: <SolutionOutlined />,
        submenu: [
          {
            path: "/lamaran-kerja/posting-pekerjaan",
            label: "Daftar Lowongan",
            icon: <TeamOutlined />
          },
          {
            path: "/lamaran-kerja/history-posting-pekerjaan",
            label: "Riwayat Lowongan",
            icon: <HistoryOutlined />,
          },
        ],
      },
    ],
  },
  {
    path: "/pendaftaran-beasiswa",
    label: "Pendaftaran Beasiswa",
    icon: <ReadOutlined />,
  },
  { path: "/stok-produk", label: "Stok Produk", icon: <InboxOutlined /> },
  {
    path: "/tender-management",
    label: "Tender Management",
    icon: <FileTextOutlined />,
  },
  { path: "/set-role", label: "Set Role", icon: <TeamOutlined /> },
];

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useSession();

  // Menyimpan label yang sedang terbuka, bisa lebih dari satu level
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const toggleKey = (label: string) => {
    setOpenKeys((prev) =>
      prev.includes(label) ? prev.filter((k) => k !== label) : [...prev, label],
    );
  };

  const isKeyOpen = (label: string) => openKeys.includes(label);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Render submenu secara rekursif
  const renderSubMenu = (items: SubMenuItem[], depth: number = 1) => {
    return (
      <ul className={`space-y-1 ${depth === 1 ? "lg:ml-4" : "lg:ml-4"}`}>
        {items.map((sub) => {
          const hasNested = sub.submenu && sub.submenu.length > 0;
          const isActive = sub.path ? location.pathname === sub.path : false;
          const isChildActive =
            hasNested &&
            sub.submenu?.some((child) => location.pathname === child.path);
          const isOpen = isKeyOpen(sub.label);

          return (
            <li key={sub.path ?? sub.label}>
              {hasNested ? (
                <>
                  {/* Parent nested (e.g. "Pelamar") */}
                  <button
                    onClick={() => toggleKey(sub.label)}
                    className={`
                      w-full flex items-center justify-center lg:justify-between
                      gap-2 px-3 py-2 rounded-lg text-sm
                      ${
                        isChildActive || isOpen
                          ? "text-green-700 "
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      {sub.icon}
                      <span className="hidden lg:block">{sub.label}</span>
                    </span>
                    <span className="hidden lg:block text-xs">
                      {isOpen ? <UpOutlined /> : <DownOutlined />}
                    </span>
                  </button>

                  {/* Nested children */}
                  {isOpen && renderSubMenu(sub.submenu!, depth + 1)}
                </>
              ) : (
                <Link
                  to={sub.path!}
                  className={`
                    flex items-center justify-center lg:justify-start
                    gap-2 px-3 py-2 rounded-lg text-sm
                    ${
                      isActive
                        ? "text-green-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }
                  `}
                >
                  {sub.icon}
                  <span className="hidden lg:block">{sub.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside
      className={`
        bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-screen z-40
        w-16 lg:w-64
      `}
    >
      {/* ========================= */}
      {/* 🔥 LOGO */}
      {/* ========================= */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-center lg:justify-start">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0">
            <img
              src={imgLogo}
              alt="PT BAS Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden lg:block">
            <h2 className="font-bold text-sm text-gray-900">PT BUKIT AURUMN</h2>
            <p className="text-xs text-gray-600">SEJAHTERA</p>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* 🔥 MENU */}
      {/* ========================= */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2 lg:px-3">
          {menuItems.map((item) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isActive = item.path
              ? location.pathname === item.path
              : false;
            const isSubmenuActive =
              hasSubmenu &&
              item.submenu?.some(
                (sub) =>
                  location.pathname === sub.path ||
                  sub.submenu?.some(
                    (child) => location.pathname === child.path,
                  ),
              );
            const isDropdownOpen = isKeyOpen(item.label);

            return (
              <li key={item.label}>
                {hasSubmenu ? (
                  <>
                    {/* 🔹 Parent dengan submenu */}
                    <button
                      onClick={() => toggleKey(item.label)}
                      className={`
                        w-full flex items-center justify-center lg:justify-between
                        gap-3 px-3 py-2.5 rounded-lg
                        ${
                          isSubmenuActive || isDropdownOpen
                            ? "bg-green-50 text-green-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon}
                        <span className="hidden lg:block text-sm">
                          {item.label}
                        </span>
                      </span>
                      <span className="hidden lg:block text-xs">
                        {isDropdownOpen ? <UpOutlined /> : <DownOutlined />}
                      </span>
                    </button>

                    {/* 🔹 Submenu */}
                    {isDropdownOpen && (
                      <div
                        className={`
                          absolute left-16 bg-white shadow-lg rounded-md p-2 z-50 min-w-48
                          lg:static lg:ml-2 lg:bg-transparent lg:shadow-none lg:p-0 lg:mt-1
                        `}
                      >
                        {renderSubMenu(item.submenu!)}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path!}
                    className={`
                      flex items-center justify-center lg:justify-start
                      gap-3 px-3 py-2.5 rounded-lg
                      ${
                        isActive
                          ? "bg-green-50 text-green-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    {item.icon}
                    <span className="hidden lg:block text-sm">
                      {item.label}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ========================= */}
      {/* 🔥 LOGOUT */}
      {/* ========================= */}
      <div className="border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-lg px-3 py-4"
        >
          <LogoutOutlined />
          <span className="hidden lg:block">Logout</span>
        </button>
      </div>
    </aside>
  );
}
