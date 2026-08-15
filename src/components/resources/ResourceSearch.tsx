import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ResourceSearchProps {
  value: string;
  onChange: (query: string) => void;
}

export const ResourceSearch: React.FC<ResourceSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative mb-8">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search resources by title, type, or description…"
        className="pl-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
