/**
 * ScrollToTop
 *
 * Scrolls the window to (0, 0) every time the route pathname changes.
 * Without this, React Router retains the previous page's scroll position
 * when navigating, making page tops appear hidden under the fixed navbar.
 *
 * Usage: render once inside <BrowserRouter>, before <Routes>.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
