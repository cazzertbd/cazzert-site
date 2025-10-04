import { CartSidebar } from "@/components/cart/CartSidebar";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { Header } from "./Header";
import { MobileNavBar } from "./MobileNavBar";
import { Sidebar } from "./Sidebar";

import "./navigation.css";

interface NavigationData {
  mainNav: Array<{ href: string; name: string; icon: string }>;
  categories: Array<{
    href: string;
    name: string;
    icon: string;
    count: number;
  }>;
}

interface NavigationProps {
  navigationData: NavigationData;
}

export function Navigation({ navigationData }: NavigationProps) {
  return (
    <NavigationProvider>
      <Header navigationData={navigationData} />
      <Sidebar navigationData={navigationData} />
      <CartSidebar />
      <MobileNavBar />
    </NavigationProvider>
  );
}
