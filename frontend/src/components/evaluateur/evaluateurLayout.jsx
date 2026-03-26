/*import { Link, useLocation } from "react-router-dom";
import { ClipboardCheck, LayoutDashboard, LogOut, User } from "lucide-react";

const navItems = [
  { to: "/evaluateur", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/evaluateur/evaluations", icon: ClipboardCheck, label: "Évaluations" },
];

export const EvaluateurLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar 
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            Espace Évaluateur
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Système de suivi et évaluation
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/evaluateur" &&
                location.pathname.startsWith(item.to));

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Dr. Nabil Rachid
              </p>
              <p className="text-xs text-muted-foreground">Évaluateur</p>
            </div>
          </div>

          <button className="flex items-center gap-3 px-3 py-2 mt-1 w-full text-sm text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-muted">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content 
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};*/