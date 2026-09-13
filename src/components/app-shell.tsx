import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const navigationItems = [
  { href: "/", label: "Inicio" },
  { href: "/inspections", label: "Inspecciones" },
  { href: "/laboratories", label: "Laboratorios" },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>

      <header className="app-header">
        <div className="app-header-content">
          <a className="app-brand" href="/">
            Inspecciones de laboratorio
          </a>

          <nav aria-label="Navegación principal">
            <ul className="app-navigation">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" className="app-main">
        {children}
      </main>

      <footer className="app-footer">
        <p>PWA by Equipo 12 · Universidad Tecnológica de Tehuacán</p>
      </footer>
    </div>
  );
}