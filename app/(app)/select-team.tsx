"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTeam } from "@/lib/store";
import { ChevronDown } from "lucide-react";
import { useEffect } from "react";

export default function SelectTeam({ user }: { user: any }) {
  const activeTeam = useTeam((state) => state.team);
  const setActiveTeam = useTeam((state) => state.setTeam);

  useEffect(() => {
    if (user && activeTeam === null) {
      setActiveTeam(user.teams[0]);
    }
  }, [user, activeTeam, setActiveTeam]);

  return (
    <>
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="text-white border border-white/20 w-full p-2.5 rounded-md flex items-center justify-between text-xs font-medium hover:border-white/50 hover:bg-white/10">
            <span>{activeTeam?.name}</span>
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Teams</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.teams.map((t: any) => (
              <DropdownMenuItem onClick={() => setActiveTeam(t)} key={t.id}>
                {t.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
