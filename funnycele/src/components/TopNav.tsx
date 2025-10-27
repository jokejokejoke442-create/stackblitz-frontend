import { NavLink } from "react-router-dom";
import { Bell, Search, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", path: "/" },
  { title: "Students", path: "/students" },
  { title: "Classes", path: "/classes" },
];

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 glass-card border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-primary">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  EduFlow
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl font-medium transition-all ${
                      isActive
                        ? "bg-gradient-primary text-white shadow-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`
                  }
                >
                  {item.title}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 w-64 glass-card"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-secondary animate-pulse" />
            </Button>

            <div className="h-10 w-10 rounded-xl bg-gradient-secondary flex items-center justify-center text-white font-bold shadow-secondary cursor-pointer hover-float">
              A
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
