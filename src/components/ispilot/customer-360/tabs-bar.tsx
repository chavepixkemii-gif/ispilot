import { ChevronDown, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  activateCustomerTab,
  closeAllCustomerTabs,
  closeCustomerTab,
  clearActiveCustomerTab,
  type CustomerTab,
} from "@/lib/customer-tabs";
import { cn } from "@/lib/utils";

export function CustomerTabsBar({ tabs, activeId }: { tabs: CustomerTab[]; activeId: string | null }) {
  if (tabs.length === 0) return null;

  return (
    <div className="sticky top-0 z-20 flex items-center gap-1 border-b border-border bg-background/85 px-2 py-1.5 backdrop-blur-xl">
      <Users className="ml-1 mr-1 size-3.5 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <div
              key={tab.id}
              className={cn(
                "group flex shrink-0 items-center gap-1.5 rounded-t-lg border border-b-0 px-2.5 py-1.5 text-[11px] transition-colors",
                active
                  ? "border-border bg-card text-foreground shadow-[inset_0_2px_0_0_var(--color-primary)]"
                  : "border-transparent bg-secondary/40 text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
              )}
            >
              <button type="button" onClick={() => activateCustomerTab(tab.id)} className="max-w-[160px] truncate font-medium">
                {tab.name}
              </button>
              <button
                type="button"
                aria-label={`Fechar aba ${tab.name}`}
                onClick={() => closeCustomerTab(tab.id)}
                className="grid size-4 place-items-center rounded text-muted-foreground/70 transition-colors hover:bg-destructive/15 hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Menu das abas">
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {tabs.map((tab) => (
            <DropdownMenuItem key={tab.id} className="text-xs" onClick={() => activateCustomerTab(tab.id)}>
              {tab.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs" onClick={() => clearActiveCustomerTab()}>
            Ir para a lista de clientes
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs text-destructive" onClick={() => closeAllCustomerTabs()}>
            Fechar todas as abas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
