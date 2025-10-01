import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Settings } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
      
      {/* Floating Settings Button */}
      <button
        data-testid="button-settings-floating"
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors z-50"
      >
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
}
