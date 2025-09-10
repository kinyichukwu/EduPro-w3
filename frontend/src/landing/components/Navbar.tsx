import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ArrowRight, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-[51] transition-all duration-300 ${
          isScrolled || isMenuOpen
            ? "bg-dark-card/80 backdrop-blur-lg border-b border-white/10 shadow-md"
            : "bg-transparent border-b border-transparent"
        }`}
        initial={false}
        animate={isScrolled || isMenuOpen ? "scrolled" : "top"}
        variants={{
          top: {
            backgroundColor: "rgba(10, 12, 18, 0)",
            backdropFilter: "blur(0px)",
          },
          scrolled: {
            backgroundColor: "rgba(21, 25, 37, 0.8)",
            backdropFilter: "blur(16px)",
          },
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-extrabold gradient-text">
                  EduPro AI
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `relative px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
                      isActive ? "text-white" : "text-dark-muted"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.name}
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                          layoutId="underline"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="hidden md:block">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  className="btn-outline cursor-pointer flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Button>
                <Button className="btn-primary cursor-pointer group flex items-center gap-2">
                  Get Started
                  <motion.div
                    className="ml-1"
                    initial={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </Button>
              </div>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-dark-muted hover:text-white focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}

      <nav
        className={`md:hidden h-screen pt-2 fixed left-0 right-0 z-50 bg-slate-700/20 transition-all duration-300 border-t border-white/10 backdrop-blur-xl ${
          isMenuOpen
            ? "opacity-100 top-16"
            : "opacity-0 -top-20 pointer-events-none"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-dark-accent hover:text-white ${
                  isActive ? "bg-dark-accent text-white" : "text-dark-muted"
                }`
              }
              onClick={toggleMenu}
            >
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="pt-4 pb-4 border-t border-white/10 px-5">
          <div className="flex flex-col space-y-3">
            <Button
              variant="outline"
              className="w-full btn-outline cursor-pointer flex items-center justify-center gap-2"
              onClick={toggleMenu}
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
            <Button
              className="w-full btn-primary cursor-pointer group flex items-center justify-center gap-2"
              onClick={toggleMenu}
            >
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
};
export default Navbar;
