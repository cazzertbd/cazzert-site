import { useNavigation } from "@/contexts/NavigationContext";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import React, { useEffect, useState } from "react";
import {
  HiArrowRight,
  HiChevronDown,
  HiMoon,
  HiShoppingBag,
  HiSun,
} from "react-icons/hi";
import {
  MdAutoAwesome,
  MdCake,
  MdDescription,
  MdDiamond,
  MdFavorite,
  MdGridView,
  MdHelpOutline,
  MdHistory,
  MdHome,
  MdLocalShipping,
  MdLock,
  MdMenuBook,
  MdPhone,
  MdRefresh,
  MdSearch,
  MdStar,
} from "react-icons/md";
import AdminPanelMenu from "./AdminPanelMenu";
import LogoutButton from "./LogoutButton";

interface SubNavItem {
  name: string;
  href: string;
  icon: string;
}

interface MainNavItem {
  name: string;
  href?: string;
  icon: string;
  submenu?: SubNavItem[];
}

interface NavigationData {
  mainNav: MainNavItem[];
  categories: Array<{
    href: string;
    name: string;
    icon: string;
    count: number;
  }>;
}

interface HeaderProps {
  navigationData: NavigationData;
}

// Comprehensive icon mapping function
const getIcon = (iconName: string, className?: string) => {
  const iconProps = { className: className || "h-4 w-4" };

  const iconMap: Record<string, React.ReactElement> = {
    // Main Navigation Icons
    "simple-line-icons:home": <MdHome {...iconProps} />,
    "simple-line-icons:book-open": <MdMenuBook {...iconProps} />,
    "simple-line-icons:phone": <MdPhone {...iconProps} />,
    "simple-line-icons:question": <MdHelpOutline {...iconProps} />,
    "simple-line-icons:magnifier": <MdSearch {...iconProps} />,
    "simple-line-icons:clock": <MdHistory {...iconProps} />,

    // Footer Links
    "simple-line-icons:lock": <MdLock {...iconProps} />,
    "simple-line-icons:doc": <MdDescription {...iconProps} />,
    "simple-line-icons:plane": <MdLocalShipping {...iconProps} />,
    "simple-line-icons:refresh": <MdRefresh {...iconProps} />,

    // Category Icons
    "simple-line-icons:diamond": <MdDiamond {...iconProps} />,
    "simple-line-icons:present": <MdCake {...iconProps} />,
    "simple-line-icons:magic-wand": <MdAutoAwesome {...iconProps} />,
    "simple-line-icons:heart": <MdFavorite {...iconProps} />,
    "simple-line-icons:star": <MdStar {...iconProps} />,

    // UI Icons
    "simple-line-icons:grid": <MdGridView {...iconProps} />,
    "simple-line-icons:handbag": <HiShoppingBag {...iconProps} />,

    // Action Icons
    "mdi:arrow-right": <HiArrowRight {...iconProps} />,
    "mdi:chevron-down": <HiChevronDown {...iconProps} />,
  };

  return iconMap[iconName] || <MdGridView {...iconProps} />;
};

export function Header({ navigationData }: HeaderProps) {
  const {
    activeSection,
    isDarkMode,
    toggleTheme,
    cartCount,
    toggleCart,
    isCartOpen,
  } = useNavigation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Use section observer
  useSectionObserver();

  // Handle scroll behavior
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // Add shadow when scrolled
          setIsScrolled(scrollY > 10);

          // Hide/show header based on scroll direction
          if (scrollY > 50 && scrollY > lastScrollY) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }

          setLastScrollY(scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const { mainNav, categories } = navigationData;

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="bg-bg-alt/80 absolute inset-0 backdrop-blur-md transition-opacity duration-300" />

      <nav className="relative container mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <a href="/" className="group flex-shrink-0 text-center">
          <span className="font-Secondary text-primary block text-3xl leading-none font-bold tracking-tight">
            Cazzert
          </span>
          <span className="text-text-subtle -mt-1 block text-xs tracking-wider uppercase">
            Since 2021
          </span>
        </a>

        {/* Desktop Navigation */}
        <ul className="mx-auto hidden items-center space-x-6 text-base md:flex lg:space-x-8">
          {mainNav.map((item) => {
            // Handle items with submenus
            if (item.submenu && item.submenu.length > 0) {
              return (
                <li key={item.name} className="group relative">
                  <button
                    className="nav-dropdown-trigger text-text-muted hover:text-primary hover:border-primary-light group-hover:text-primary flex cursor-pointer items-center border-b-2 border-transparent pb-1 transition-colors duration-300"
                    aria-expanded="false"
                    aria-controls={`${item.name.toLowerCase()}-submenu`}
                  >
                    {item.name}
                    <HiChevronDown className="text-text-subtle group-hover:text-primary ml-1 h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
                  </button>

                  <ul
                    id={`${item.name.toLowerCase()}-submenu`}
                    className="border-border-light bg-bg-alt invisible absolute left-0 z-40 mt-2 w-56 rounded-md border py-2 opacity-0 shadow-lg transition-all duration-300 group-hover:visible group-hover:opacity-100"
                    role="menu"
                  >
                    {item.submenu.map((subItem) => (
                      <li key={subItem.href} role="none">
                        <a
                          href={subItem.href}
                          className="text-text-muted hover:bg-primary-light/10 hover:text-primary flex items-center px-4 py-2 text-sm font-medium transition-colors"
                          role="menuitem"
                        >
                          {getIcon(subItem.icon, "mr-3 h-4 w-4 flex-shrink-0")}
                          <span>{subItem.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            // Handle regular items
            const isActive = item.href && activeSection === item.href.slice(1);

            return (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={`nav-link border-b-2 pb-1 transition-colors duration-300 ${
                    isActive
                      ? "text-primary border-primary"
                      : "text-text-muted hover:text-primary hover:border-primary-light border-transparent"
                  }`}
                >
                  {item.name}
                </a>
              </li>
            );
          })}

          {/* Categories Dropdown */}
          {categories.length > 0 && (
            <li className="group relative">
              <button
                className="nav-dropdown-trigger text-text-muted hover:text-primary hover:border-primary-light group-hover:text-primary flex cursor-pointer items-center border-b-2 border-transparent pb-1 transition-colors duration-300"
                aria-expanded="false"
                aria-controls="categories-menu"
              >
                Categories
                <HiChevronDown className="text-text-subtle group-hover:text-primary ml-1 h-5 w-5 transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <ul
                id="categories-menu"
                className="border-border-light bg-bg-alt invisible absolute left-0 z-40 mt-2 w-64 rounded-md border py-2 opacity-0 shadow-lg transition-all duration-300 group-hover:visible group-hover:opacity-100"
                role="menu"
              >
                {/* All Products Link */}
                <li role="none">
                  <a
                    href="/products"
                    className="text-text-muted hover:bg-primary-light/10 hover:text-primary flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors"
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      <MdGridView className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span>All Products</span>
                    </div>
                    <HiArrowRight className="h-4 w-4 opacity-50" />
                  </a>
                </li>

                <li role="none" className="border-border-light my-1 border-t" />

                {/* Dynamic Categories */}
                {categories.map((category) => (
                  <li key={category.href} role="none">
                    <a
                      href={category.href}
                      className="text-text-muted hover:bg-primary-light/10 hover:text-primary group flex items-center justify-between px-4 py-2 text-sm transition-colors"
                      role="menuitem"
                    >
                      <div className="flex items-center">
                        {getIcon(category.icon, "mr-3 h-4 w-4 flex-shrink-0")}
                        <span>{category.name}</span>
                      </div>
                      <span className="text-primary bg-bg-alt group-hover:bg-primary-light/20 rounded-full px-2 py-1 text-xs font-medium transition-colors">
                        {category.count}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>

        {/* Action Items */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle text-text-muted hover:bg-bg hover:text-primary focus:ring-primary/30 relative cursor-pointer rounded-full p-2 transition-all duration-200 focus:ring-0 focus:outline-none"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <HiSun className="h-5 w-5" />
            ) : (
              <HiMoon className="h-5 w-5" />
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={toggleCart}
            className={`text-text-muted hover:bg-bg hover:text-primary focus:ring-primary/30 relative hidden cursor-pointer rounded-full p-2 transition-all duration-200 focus:ring-0 focus:outline-none md:block ${
              isCartOpen ? "bg-primary/10 text-primary" : ""
            }`}
            aria-label={`Shopping Cart${
              cartCount > 0 ? ` (${cartCount} items)` : ""
            }`}
            aria-expanded={isCartOpen}
          >
            {/* Cart Badge */}
            {cartCount > 0 && (
              <span className="bg-primary ring-bg-alt absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white ring-2 transition-all duration-200">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}

            {/* Cart Icon with Animation */}
            <HiShoppingBag
              className={`h-5 w-5 transition-transform duration-200 ${
                isCartOpen ? "scale-110" : ""
              }`}
            />
          </button>

          {/* Admin Panel Menu - Only visible to admins */}
          <AdminPanelMenu />

          {/* Logout Button - Only visible when logged in */}
          <LogoutButton />

          {/* Quick Cart Preview (Optional - shows on hover) */}
          {cartCount > 0 && (
            <div className="hidden lg:block">
              <div className="group relative">
                <div className="border-border/20 bg-bg-alt invisible absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border p-4 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-text-base font-semibold">
                      Cart Preview
                    </h3>
                    <span className="text-text-muted text-xs">
                      {cartCount} items
                    </span>
                  </div>

                  <div className="mb-3 space-y-2">
                    <p className="text-text-muted text-sm">
                      Click cart to view all items
                    </p>
                  </div>

                  <button
                    onClick={toggleCart}
                    className="bg-primary hover:bg-primary-dark w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                  >
                    View Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
