import { useNavigation } from "@/contexts/NavigationContext";
import { useEffect, useState } from "react";
import { HiMenu, HiShoppingBag, HiX } from "react-icons/hi";
import { MdCake, MdHome } from "react-icons/md";

interface MobileNavBarProps {
  currentPath?: string;
}

const navItems = [
  { href: "/", label: "Home", icon: MdHome },
  { href: "/products", label: "Cakes", icon: MdCake },
  {
    isButton: true,
    label: "Cart",
    icon: HiShoppingBag,
    action: "toggleCart",
    hasCartBadge: true,
  },
  { isButton: true, label: "Menu", icon: HiMenu, action: "toggleSidebar" },
];

export function MobileNavBar({}: MobileNavBarProps) {
  const { toggleSidebar, toggleCart, isSidebarOpen, isCartOpen, cartCount } =
    useNavigation();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleButtonClick = (action: string) => {
    if (action === "toggleSidebar") toggleSidebar();
    if (action === "toggleCart") toggleCart();
  };

  return (
    <nav
      className={`border-border/20 bg-bg-alt/95 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-md transition-transform duration-300 md:hidden ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      suppressHydrationWarning={true}
    >
      <div className="mx-auto flex max-w-sm items-center justify-center gap-1">
        {navItems.map((item, index) => {
          const isActive =
            (item.action === "toggleSidebar" && isSidebarOpen) ||
            (item.action === "toggleCart" && isCartOpen);

          if (item.isButton) {
            const IconComponent =
              item.action === "toggleSidebar" && isSidebarOpen
                ? HiX
                : item.icon;

            return (
              <button
                key={index}
                onClick={() => handleButtonClick(item.action!)}
                className="group flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2.5 transition-all duration-200"
                aria-label={item.label}
              >
                <div
                  className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-primary/15 text-primary ring-primary/20 shadow-sm ring-1"
                      : "text-text-muted group-hover:bg-primary/10 group-hover:text-primary"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  {item.hasCartBadge && cartCount > 0 && (
                    <span className="bg-primary ring-bg-alt absolute -top-1.5 -right-1.5 flex h-5 w-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-md ring-2">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-primary"
                      : "text-text-muted group-hover:text-primary"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          const IconComponent = item.icon;

          return (
            <a
              key={item.href}
              href={item.href}
              className="group flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-all duration-200"
              aria-label={item.label}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary/15 text-primary ring-primary/20 shadow-sm ring-1"
                    : "text-text-muted group-hover:bg-primary/10 group-hover:text-primary"
                }`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-text-muted group-hover:text-primary"
                }`}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
