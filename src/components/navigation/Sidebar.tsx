import { useNavigation } from "@/contexts/NavigationContext";
import React, { useEffect, useRef, useState } from "react";
import { HiArrowRight, HiX } from "react-icons/hi";
import {
  MdAutoAwesome,
  MdCake,
  MdDescription,
  MdDiamond,
  MdEmail,
  MdExpandLess,
  MdExpandMore,
  MdExplore,
  MdFavorite,
  MdGridView,
  MdHelpOutline,
  MdHistory,
  MdHome,
  MdLayers,
  MdLocalShipping,
  MdLock,
  MdMenuBook,
  MdPhone,
  MdRefresh,
  MdSearch,
  MdStar,
  MdSupportAgent,
} from "react-icons/md";

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

interface SidebarProps {
  navigationData: NavigationData;
}

// Comprehensive icon mapping function
const getIcon = (
  iconName: string,
  className?: string,
): React.ReactElement<any> => {
  const iconProps = { className: className || "h-5 w-5" };

  const iconMap: Record<string, React.ReactElement<any>> = {
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
    "simple-line-icons:envelope": <MdEmail {...iconProps} />,
    "simple-line-icons:compass": <MdExplore {...iconProps} />,
    "simple-line-icons:layers": <MdLayers {...iconProps} />,
    "simple-line-icons:support": <MdSupportAgent {...iconProps} />,

    // Action Icons
    "mdi:arrow-right": <HiArrowRight {...iconProps} />,
  };

  return iconMap[iconName] || <MdGridView {...iconProps} />;
};

export function Sidebar({ navigationData }: SidebarProps) {
  const { isSidebarOpen, closeSidebar, activeSection } = useNavigation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const { mainNav, categories } = navigationData;

  // Focus management
  useEffect(() => {
    if (isSidebarOpen) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 150);
    }
  }, [isSidebarOpen]);

  const handleLinkClick = (href: string) => {
    // Close sidebar for hash links after a delay, immediately for page links
    if (href.startsWith("#")) {
      setTimeout(closeSidebar, 100);
    } else {
      closeSidebar();
    }
  };

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
      } else {
        newSet.add(menuName);
      }
      return newSet;
    });
  };

  const isSubmenuExpanded = (menuName: string) => {
    return expandedMenus.has(menuName);
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-out ${isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"} `}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`bg-bg/95 border-border/20 fixed top-0 right-0 bottom-0 z-50 flex w-72 max-w-[85vw] flex-col border-l shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        {/* Header */}
        <header className="border-border/30 flex items-center justify-between border-b px-6 py-4">
          <a href="/" className="group flex-shrink-0">
            <div className="text-center">
              <span className="font-Secondary text-primary group-hover:text-primary-dark block text-2xl font-bold tracking-tight transition-colors">
                Cazzert
              </span>
              <span className="text-text-subtle -mt-1 block text-xs tracking-wider uppercase">
                Since 2021
              </span>
            </div>
          </a>

          <button
            ref={closeButtonRef}
            onClick={closeSidebar}
            className="text-text-muted hover:text-primary hover:bg-primary-light/10 focus:bg-primary-light/10 focus:text-primary focus:ring-primary/30 rounded-full p-2.5 transition-all duration-200 focus:ring-2 focus:outline-none"
            aria-label="Close navigation menu"
          >
            <HiX className="h-5 w-5" />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 pb-20 md:pb-6">
          {/* Main Navigation */}
          <nav className="mb-8">
            <h3 className="text-text-muted mb-4 flex items-center text-sm font-semibold tracking-wider uppercase">
              <MdExplore className="mr-2 h-4 w-4" />
              Navigation
            </h3>

            <ul className="space-y-2">
              {mainNav.map((item) => {
                // Handle items with submenus
                if (item.submenu && item.submenu.length > 0) {
                  const isExpanded = isSubmenuExpanded(item.name);

                  return (
                    <li key={item.name}>
                      {/* Main menu item with toggle */}
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className="sidebar-link text-text-base hover:bg-primary-light/5 hover:text-primary active:bg-primary-light/10 group flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all duration-200"
                      >
                        <div className="flex items-center">
                          {React.cloneElement(getIcon(item.icon), {
                            className:
                              "text-text-subtle group-hover:text-primary mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                          })}
                          <span>{item.name}</span>
                        </div>
                        {isExpanded ? (
                          <MdExpandLess className="text-text-subtle group-hover:text-primary h-5 w-5 transition-colors" />
                        ) : (
                          <MdExpandMore className="text-text-subtle group-hover:text-primary h-5 w-5 transition-colors" />
                        )}
                      </button>

                      {/* Submenu items */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <ul className="border-border/20 mt-2 ml-8 space-y-1 border-l-2 pl-4">
                          {item.submenu.map((subItem) => (
                            <li key={subItem.href}>
                              <a
                                href={subItem.href}
                                onClick={() => handleLinkClick(subItem.href)}
                                className="sidebar-sublink text-text-muted hover:bg-primary-light/5 hover:text-primary active:bg-primary-light/10 group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
                              >
                                {React.cloneElement(getIcon(subItem.icon), {
                                  className:
                                    "text-text-subtle group-hover:text-primary mr-2 h-4 w-4 flex-shrink-0 transition-colors",
                                })}
                                <span>{subItem.name}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                }

                // Handle regular items
                const isActive =
                  item.href && activeSection === item.href.slice(1);

                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      onClick={() => handleLinkClick(item.href!)}
                      className={`sidebar-link group flex items-center rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary-light/5 border-primary/20 text-primary border-l-4"
                          : "text-text-base hover:bg-primary-light/5 hover:text-primary active:bg-primary-light/10"
                      } `}
                    >
                      {React.cloneElement(getIcon(item.icon), {
                        className: `mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                          isActive
                            ? "text-primary"
                            : "text-text-subtle group-hover:text-primary"
                        }`,
                      })}
                      <span>{item.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Elegant Divider */}
          <div className="relative my-8">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="border-border/30 w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-bg text-text-muted flex items-center px-3 text-sm">
                <MdLayers className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* Categories Section */}
          {categories.length > 0 && (
            <nav className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-text-muted flex items-center text-sm font-semibold tracking-wider uppercase">
                  <MdGridView className="mr-2 h-4 w-4" />
                  Categories
                </h3>
                <span className="text-text-subtle bg-bg-alt rounded-full px-2.5 py-1 text-xs font-medium">
                  {categories.length}
                </span>
              </div>

              <ul className="space-y-2">
                {/* All Products */}
                <li>
                  <a
                    href="/products"
                    onClick={() => handleLinkClick("/products")}
                    className="sidebar-link text-text-base hover:bg-primary-light/5 hover:text-primary active:bg-primary-light/10 group flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <MdGridView className="text-text-subtle group-hover:text-primary mr-3 h-5 w-5 flex-shrink-0 transition-colors" />
                      <span>All Products</span>
                    </div>
                    <HiArrowRight className="text-text-subtle group-hover:text-primary h-4 w-4 transition-all duration-200 group-hover:translate-x-0.5" />
                  </a>
                </li>

                {/* Dynamic Categories */}
                {categories.map((category) => (
                  <li key={category.href}>
                    <a
                      href={category.href}
                      onClick={() => handleLinkClick(category.href)}
                      className="sidebar-link text-text-base hover:bg-primary-light/5 hover:text-primary active:bg-primary-light/10 group flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all duration-200"
                    >
                      <div className="flex items-center">
                        {React.cloneElement(getIcon(category.icon), {
                          className:
                            "text-text-subtle group-hover:text-primary mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                        })}
                        <span>{category.name}</span>
                      </div>
                      <span className="text-text-subtle bg-bg-alt group-hover:bg-primary-light/20 group-hover:text-primary-dark rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200">
                        {category.count}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Help Section */}
          <div className="from-primary-light/10 to-primary-light/5 border-primary-light/20 mb-4 rounded-2xl border bg-gradient-to-br p-6 shadow-sm md:mb-14">
            <div className="mb-3 flex items-center">
              <MdSupportAgent className="text-primary mr-2 h-5 w-5" />
              <h3 className="text-text-base text-base font-semibold">
                Need Help?
              </h3>
            </div>

            <p className="text-text-muted mb-4 text-sm leading-relaxed">
              Questions about an order or need assistance?
            </p>

            <div className="space-y-3">
              <a
                href="tel:+1234567890"
                className="text-text-base hover:text-primary group flex items-center transition-colors"
              >
                <MdPhone className="text-primary mr-3 h-4 w-4 flex-shrink-0" />
                <span className="group-hover:underline">(123) 456-7890</span>
              </a>

              <a
                href="mailto:hello@cazzert.com"
                className="text-text-base hover:text-primary group flex items-center transition-colors"
              >
                <MdEmail className="text-primary mr-3 h-4 w-4 flex-shrink-0" />
                <span className="group-hover:underline">hello@cazzert.com</span>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
