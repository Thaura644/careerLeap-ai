
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface ResourceSearchProps {
  onSearch?: (query: string) => void;
  onFilter?: () => void;
}

export const ResourceSearch: React.FC<ResourceSearchProps> = ({ 
  onSearch, 
  onFilter 
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search resources..." 
          className="pl-10" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Button 
        type="button" 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={onFilter}
      >
        <Filter className="h-4 w-4" />
        Filters
      </Button>
    </form>
  );
};
