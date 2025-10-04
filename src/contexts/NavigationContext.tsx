import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface NavigationContextType {
  // Sidebar state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  // Cart sidebar state
  isCartOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;

  // Active section tracking
  activeSection: string;
  setActiveSection: (section: string) => void;

  // Theme state
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Cart state
  cartCount: number;
  updateCartCount: (count: number) => void;

  // Hydration state
  isHydrated: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize theme state from DOM
  useEffect(() => {
    if (!isHydrated) return;

    const currentTheme = document.documentElement.getAttribute("data-theme");
    setIsDarkMode(currentTheme === "dark");
  }, [isHydrated]);

  // Sidebar functions
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
    if (!isSidebarOpen) {
      setIsCartOpen(false);
    }
  }, [isSidebarOpen]);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Cart sidebar functions
  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
    if (!isCartOpen) {
      setIsSidebarOpen(false);
    }
  }, [isCartOpen]);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  // Simple theme toggle
  const toggleTheme = useCallback(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setIsDarkMode(newTheme === "dark");
  }, []);

  // Cart functions
  const updateCartCount = useCallback((count: number) => {
    setCartCount(count);
  }, []);

  // Handle escape key for sidebars
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSidebarOpen) {
          closeSidebar();
        }
        if (isCartOpen) {
          closeCart();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen, isCartOpen, closeSidebar, closeCart]);

  // Handle body scroll lock
  useEffect(() => {
    const shouldLockScroll = isSidebarOpen || isCartOpen;
    document.body.style.overflow = shouldLockScroll ? "hidden" : "";
    document.body.classList.toggle("sidebar-open", shouldLockScroll);

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("sidebar-open");
    };
  }, [isSidebarOpen, isCartOpen]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        if (isSidebarOpen) {
          closeSidebar();
        }
        if (isCartOpen) {
          closeCart();
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen, isCartOpen, closeSidebar, closeCart]);

  // Cart counter initialization
  useEffect(() => {
    if (!isHydrated) return;

    const initCartCounter = async () => {
      try {
        const { CartUtils } = await import("@/utils/CartUtils");
        const summary = CartUtils.getCartSummary();
        setCartCount(summary.itemCount);

        const handleCartUpdate = () => {
          const newSummary = CartUtils.getCartSummary();
          setCartCount(newSummary.itemCount);
        };

        document.addEventListener("cartUpdated", handleCartUpdate);
        window.addEventListener("storage", (e) => {
          if (e.key === "cazzert_cart") handleCartUpdate();
        });

        return () => {
          document.removeEventListener("cartUpdated", handleCartUpdate);
          window.removeEventListener("storage", handleCartUpdate);
        };
      } catch (error) {
        console.error("Error initializing cart counter:", error);
      }
    };

    initCartCounter();
  }, [isHydrated]);

  return (
    <NavigationContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        isCartOpen,
        toggleCart,
        closeCart,
        activeSection,
        setActiveSection,
        isDarkMode,
        toggleTheme,
        cartCount,
        updateCartCount,
        isHydrated,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};
