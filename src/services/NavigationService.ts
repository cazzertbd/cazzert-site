import type { CategoryWithProductCount } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";

export interface SubNavItem {
  name: string;
  href: string;
  icon: string;
}

export interface MainNavItem {
  name: string;
  href?: string; // Optional for items with submenus
  icon: string;
  submenu?: SubNavItem[]; // Optional submenu items
}

export interface CategoryNavItem {
  name: string;
  href: string;
  slug: string;
  icon: string;
  count: number;
}

export interface NavigationData {
  mainNav: MainNavItem[];
  categories: CategoryNavItem[];
  footerLinks: MainNavItem[];
}

export class NavigationService {
  private static readonly MAIN_NAV: MainNavItem[] = [
    { name: "Home", href: "/", icon: "simple-line-icons:home" },
    { name: "Our Story", href: "/#about", icon: "simple-line-icons:book-open" },
    { name: "Contact", href: "/contact", icon: "simple-line-icons:phone" },
    {
      name: "Track",
      icon: "simple-line-icons:question",
      submenu: [
        {
          name: "Specific Order",
          href: "/orders/track",
          icon: "simple-line-icons:magnifier",
        },
        {
          name: "Order History",
          href: "/orders/history",
          icon: "simple-line-icons:clock",
        },
      ],
    },
  ];

  private static readonly FOOTER_LINKS: MainNavItem[] = [
    {
      name: "Privacy Policy",
      href: "/privacy",
      icon: "simple-line-icons:lock",
    },
    { name: "Terms of Service", href: "/terms", icon: "simple-line-icons:doc" },
    {
      name: "Shipping Info",
      href: "/shipping",
      icon: "simple-line-icons:plane",
    },
    { name: "Returns", href: "/returns", icon: "simple-line-icons:refresh" },
  ];

  private static readonly CATEGORY_ICON_MAP: Record<string, string> = {
    cakes: "simple-line-icons:diamond",
    cupcakes: "simple-line-icons:present",
    pastries: "simple-line-icons:magic-wand",
    "special-occasions": "simple-line-icons:heart",
    seasonal: "simple-line-icons:star",
  };

  /**
   * Get category icon based on slug
   */
  private static getCategoryIcon(slug: string): string {
    return this.CATEGORY_ICON_MAP[slug] || "simple-line-icons:bag";
  }

  /**
   * Transform database categories to navigation items
   */
  private static transformCategories(
    categories: CategoryWithProductCount[],
  ): CategoryNavItem[] {
    return categories.map((category) => ({
      name: category.name,
      href: `/category/${category.slug}`,
      slug: category.slug,
      icon: this.getCategoryIcon(category.slug),
      count: category._count.products,
    }));
  }

  /**
   * Fetch all navigation data from database
   */
  static async getNavigationData(): Promise<NavigationData> {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return {
        mainNav: this.MAIN_NAV,
        categories: this.transformCategories(categories),
        footerLinks: this.FOOTER_LINKS,
      };
    } catch (error) {
      console.error("Error fetching navigation data:", error);

      // Return safe fallback data
      return {
        mainNav: this.MAIN_NAV,
        categories: [],
        footerLinks: this.FOOTER_LINKS,
      };
    }
  }

  /**
   * Get main navigation only
   */
  static getMainNavigation(): MainNavItem[] {
    return this.MAIN_NAV;
  }

  /**
   * Get footer links only
   */
  static getFooterLinks(): MainNavItem[] {
    return this.FOOTER_LINKS;
  }

  /**
   * Get breadcrumb data for category pages
   */
  static async getBreadcrumbs(categorySlug?: string): Promise<MainNavItem[]> {
    const breadcrumbs: MainNavItem[] = [
      { name: "Home", href: "/", icon: "simple-line-icons:home" },
    ];

    if (categorySlug) {
      try {
        const category = await prisma.category.findUnique({
          where: { slug: categorySlug },
        });

        if (category) {
          breadcrumbs.push({
            name: "Products",
            href: "/products",
            icon: "simple-line-icons:grid",
          });

          breadcrumbs.push({
            name: category.name,
            href: `/category/${category.slug}`,
            icon: this.getCategoryIcon(category.slug),
          });
        }
      } catch (error) {
        console.error("Error fetching breadcrumb data:", error);
      }
    }

    return breadcrumbs;
  }
}
