import { Button, Input } from "@/shared/components/ui"
import { ChevronRight, LayoutGrid, List, Search } from "lucide-react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Dispatch, SetStateAction, useState } from "react";

interface SearchFilterBarProps {
  viewMode: 'list' | 'grid'
  setViewMode: Dispatch<SetStateAction<'list' | 'grid'>>
  selectedCategory: string
  setSelectedCategory: Dispatch<SetStateAction<string>>
}

const categories = [
  { id: "all", name: "All Files", count: 18 },
  { id: "notes", name: "Notes", count: 12 },
  { id: "assignments", name: "Assignments", count: 3 },
  { id: "slides", name: "Presentations", count: 2 },
  { id: "images", name: "Images", count: 1 },
];

export const SearchFilterBar = ({viewMode, setViewMode, selectedCategory, setSelectedCategory}: SearchFilterBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div className="flex gap-2 w-full">
        <div className="relative w-full md:w-auto">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search files..."
            className="pl-10 pr-4 w-full md:w-80 bg-white/10 border-gray-200/20 focus:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="sm:hidden flex items-center bg-white/10 rounded-md p-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-md ${
              viewMode === "grid" ? "bg-white/20" : ""
            }`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-md ${
              viewMode === "list" ? "bg-white/20" : ""
            }`}
            onClick={() => setViewMode("list")}
          >
            <List size={18} />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <Tabs
          defaultValue="all"
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full md:w-auto"
        >
          <TabsList className="flex md:flex-row gap-1">
            {categories.slice(0, 3).map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-xs py-1.5 px-1.5 sm:px-3"
              >
                {category.name} ({category.count})
              </TabsTrigger>
            ))}
            <TabsTrigger
              value="more"
              className="text-xs py-1.5 px-1.5 sm:px-3"
              onClick={(e) => e.preventDefault()}
            >
              More <ChevronRight size={14} />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="max-sm:hidden flex items-center bg-white/10 rounded-md p-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-md ${
              viewMode === "grid" ? "bg-white/20" : ""
            }`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-md ${
              viewMode === "list" ? "bg-white/20" : ""
            }`}
            onClick={() => setViewMode("list")}
          >
            <List size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}