import { useNavigation } from "@/contexts/NavigationContext";
import { useEffect } from "react";

export function useSectionObserver() {
  const { setActiveSection } = useNavigation();

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("id");
            if (sectionId) {
              setActiveSection(sectionId);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1,
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [setActiveSection]);
}
