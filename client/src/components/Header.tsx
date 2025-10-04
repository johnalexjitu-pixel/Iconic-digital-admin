import { Menu, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Header() {
  return (
    <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          data-testid="button-menu"
          className="p-2 hover:bg-muted rounded-md"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Language:</span>
          <Select defaultValue="english">
            <SelectTrigger data-testid="select-language" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english,">English</SelectItem>
              <SelectItem value="bangla,">Bangla</SelectItem>
              <SelectItem value="chinese,">Chinese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span
          data-testid="text-team-badge"
          className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded"
        >
          TEAM 1 - RUPEE
        </span>

        <button
          data-testid="button-settings-header"
          className="p-2 hover:bg-muted rounded-md"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
