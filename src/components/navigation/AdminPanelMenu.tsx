import { useEffect, useRef, useState } from "react";
import { MdCategory, MdInventory, MdShoppingCart } from "react-icons/md";
import { RiAdminFill, RiUserLine } from "react-icons/ri";

// Helper function to get cookie value
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    if (part !== undefined) {
      return part.split(";").shift() || null;
    }
  }
  return null;
}

// Menu items array with icons for cake shop admin
const ADMIN_MENU_ITEMS = [
  // { path: "/admin/dashboard", label: "Dashboard", icon: MdDashboard },
  { path: "/admin/users", label: "Manage Users", icon: RiUserLine },
  { path: "/admin/categories", label: "Manage Categories", icon: MdCategory },
  { path: "/admin/products", label: "Manage Products", icon: MdInventory },
  { path: "/admin/orders", label: "Manage Orders", icon: MdShoppingCart },
  // { path: "/admin/customers", label: "Manage Customers", icon: MdPeople },
  // { path: "/admin/analytics", label: "Analytics", icon: MdAnalytics },
  // { path: "/admin/settings", label: "Settings", icon: MdSettings },
];

const AdminPanelMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if user is admin using cookie
  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const isAdminCookie = getCookie("isAdmin");
        setIsAdmin(isAdminCookie === "true");
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  // Don't render anything if not admin
  if (!isAdmin) {
    return null;
  }

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`text-text-muted hover:bg-bg hover:text-primary focus:ring-primary/30 relative cursor-pointer rounded-full p-2 transition-all duration-200 focus:ring-2 focus:outline-none ${
          isOpen ? "bg-primary/10 text-primary" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Admin panel menu"
      >
        <RiAdminFill className="h-5 w-5" />

        {/* Tooltip on hover */}
        <span className="bg-bg-alt text-text-base border-border/20 pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          Admin Panel
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Mobile backdrop - positioned below header */}
          <div
            className="fixed inset-0 top-20 z-30 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Desktop backdrop - only covers content area */}
          <div
            className="fixed inset-0 z-30 hidden md:block"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="bg-bg-alt border-border/20 absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl border shadow-2xl backdrop-blur-sm focus:outline-none">
            <div className="py-2" role="menu" aria-orientation="vertical">
              {/* Header */}
              <div className="border-border/20 border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <RiAdminFill className="text-primary h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-text-base text-sm font-semibold">
                      Admin Panel
                    </p>
                    <p className="text-text-subtle text-xs">
                      Manage your bakery
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {ADMIN_MENU_ITEMS.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      className="text-text-muted hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary group flex items-center gap-3 px-4 py-2.5 text-sm transition-colors focus:outline-none"
                      role="menuitem"
                      onClick={handleMenuItemClick}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: `fadeInUp 0.3s ease-out forwards`,
                      }}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-border/20 border-t px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-subtle text-xs font-medium">
                    Admin Access
                  </span>
                  <div className="flex h-2 w-2 rounded-full bg-green-100 text-green-700"></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanelMenu;
