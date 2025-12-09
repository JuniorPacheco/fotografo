import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Package,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
  Sun,
  Moon,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/clientes", label: "Clientes", icon: Users },
    { path: "/facturas", label: "Facturas", icon: FileText },
    { path: "/pagos", label: "Pagos", icon: DollarSign },
    { path: "/paquetes", label: "Paquetes", icon: Package },
    { path: "/recordatorios", label: "Recordatorios", icon: Bell },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Aside Navigation */}
      <aside
        className={cn(
          "sticky top-0 flex h-screen flex-col border-r transition-all duration-300",
          "bg-background border-border",
          isCollapsed ? "w-[70px]" : "w-[250px]",
          theme === "dark" && "bg-black border-red-900/20"
        )}
        style={
          theme === "dark"
            ? {
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }
            : undefined
        }
      >
        <div
          className={cn(
            "flex flex-col p-4 border-b space-y-0",
            theme === "dark" ? "border-red-900/20" : "border-border"
          )}
        >
          {isCollapsed ? (
            <>
              <div className="flex justify-center">
                <Logo variant="compact" />
              </div>
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapse}
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label="Expandir menú"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Logo variant="full" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapse}
                  className="ml-auto text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label="Colapsar menú"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              {user?.email && (
                <small
                  className={cn(
                    "text-sm text-center",
                    theme === "dark"
                      ? "text-red-300/70"
                      : "text-muted-foreground"
                  )}
                >
                  {user.email}
                </small>
              )}
            </>
          )}
        </div>

        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={cn(
            "border-t p-4 space-y-2",
            theme === "dark" ? "border-red-900/20" : "border-border"
          )}
        >
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className={cn(
              "w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={
              isCollapsed
                ? theme === "dark"
                  ? "Modo claro"
                  : "Modo oscuro"
                : undefined
            }
          >
            {theme === "dark" ? (
              <Sun className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            ) : (
              <Moon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            )}
            {!isCollapsed && (theme === "dark" ? "Modo claro" : "Modo oscuro")}
          </Button>
          <Button
            variant="ghost"
            onClick={logout}
            className={cn(
              "w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && "Cerrar Sesión"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 p-8",
          theme === "dark" ? "bg-black/50" : "bg-background"
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default Layout;
