import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Eye,
  Edit3,
  Trash2,
  Flag,
  CheckCircle,
  X,
  Tag,
  Upload,
  Download,
  MoreHorizontal,
  Grid,
  List,
  RefreshCw,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

// Mock data for content materials
const materials = [
  {
    id: 1,
    title: "Organic Chemistry Chapter 5: Alcohols and Ethers",
    type: "PDF",
    tags: ["Chemistry", "Organic", "WAEC", "JAMB"],
    uploader: "Dr. Sarah Johnson",
    course: "CHM 101",
    visibility: "public",
    status: "approved",
    uploadDate: "2024-01-15",
    views: 245,
    size: "2.3 MB",
    flaggedReasons: [],
  },
  {
    id: 2,
    title: "Mathematics Past Questions 2020-2023",
    type: "DOC",
    tags: ["Mathematics", "Past Questions", "WAEC"],
    uploader: "Prof. Mike Adams",
    course: "MTH 101",
    visibility: "premium",
    status: "flagged",
    uploadDate: "2024-01-14",
    views: 189,
    size: "1.8 MB",
    flaggedReasons: ["Copyright concern", "Quality issues"],
  },
  {
    id: 3,
    title: "Physics Laboratory Manual",
    type: "PDF",
    tags: ["Physics", "Laboratory", "Practical"],
    uploader: "Dr. Emily Chen",
    course: "PHY 201",
    visibility: "public",
    status: "pending",
    uploadDate: "2024-01-13",
    views: 67,
    size: "4.1 MB",
    flaggedReasons: [],
  },
];

export const ContentManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showInspector, setShowInspector] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      material.status === selectedFilter ||
      (selectedFilter === "flagged" && material.status === "flagged");
    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredMaterials.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredMaterials.map((m) => m.id));
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleInspect = (material: any) => {
    setSelectedMaterial(material);
    setShowInspector(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-dark-muted">
            Manage uploaded materials and moderation queue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload size={16} className="mr-2" />
            Bulk Upload
          </Button>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-turbo-purple to-turbo-indigo"
          >
            <FileText size={16} className="mr-2" />
            Add Content
          </Button>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-4 h-4" />
                <Input
                  placeholder="Search materials by title, tags, or uploader..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-dark-accent/30 border-white/10"
                />
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[180px] bg-dark-accent/30 border-white/10">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Materials</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List size={16} />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-turbo-indigo/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-turbo-indigo" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Total Materials</p>
                  <p className="text-xl font-bold">2,847</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Flag className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Flagged</p>
                  <p className="text-xl font-bold text-red-500">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Pending</p>
                  <p className="text-xl font-bold text-orange-500">34</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Approved</p>
                  <p className="text-xl font-bold text-green-500">2,801</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-4 z-10"
        >
          <Card className="border-turbo-purple/30 bg-turbo-purple/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedItems.length} items selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Tag size={14} className="mr-2" />
                      Edit Tags
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye size={14} className="mr-2" />
                      Change Visibility
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-400 border-red-400/30"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedItems([])}
                >
                  <X size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Materials Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Materials Library</CardTitle>
              <Button variant="ghost" size="sm">
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-dark-accent/20">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedItems.length === filteredMaterials.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Uploader</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => (
                  <TableRow
                    key={material.id}
                    className="border-white/5 hover:bg-dark-accent/10"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(material.id)}
                        onCheckedChange={() => handleSelectItem(material.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-turbo-purple/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-turbo-purple" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {material.title}
                          </div>
                          <div className="text-xs text-dark-muted">
                            {material.type} • {material.size}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {material.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs bg-turbo-indigo/10 text-turbo-indigo border-turbo-indigo/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {material.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{material.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{material.uploader}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {material.course}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "text-xs",
                          material.status === "approved" &&
                            "bg-green-500/20 text-green-400 border-green-500/30",
                          material.status === "pending" &&
                            "bg-orange-500/20 text-orange-400 border-orange-500/30",
                          material.status === "flagged" &&
                            "bg-red-500/20 text-red-400 border-red-500/30"
                        )}
                      >
                        {material.status}
                        {material.flaggedReasons.length > 0 && (
                          <AlertTriangle className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{material.views}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleInspect(material)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Inspect
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upload Inspector Sheet */}
      <Sheet open={showInspector} onOpenChange={setShowInspector}>
        <SheetContent className="w-[600px] sm:max-w-[600px] bg-dark-card border-white/5">
          <SheetHeader>
            <SheetTitle>Material Inspector</SheetTitle>
            <SheetDescription>
              View and edit material details, metadata, and version history
            </SheetDescription>
          </SheetHeader>

          {selectedMaterial && (
            <div className="space-y-6 mt-6">
              {/* Preview */}
              <div className="space-y-3">
                <h4 className="font-medium">Preview</h4>
                <div className="border border-white/10 rounded-lg p-4 bg-dark-accent/20">
                  <div className="text-sm text-dark-muted">
                    Document preview would appear here...
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-3">
                <h4 className="font-medium">Metadata</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-dark-muted">Uploader:</span>
                    <div className="font-medium">
                      {selectedMaterial.uploader}
                    </div>
                  </div>
                  <div>
                    <span className="text-dark-muted">Upload Date:</span>
                    <div className="font-medium">
                      {selectedMaterial.uploadDate}
                    </div>
                  </div>
                  <div>
                    <span className="text-dark-muted">File Size:</span>
                    <div className="font-medium">{selectedMaterial.size}</div>
                  </div>
                  <div>
                    <span className="text-dark-muted">Views:</span>
                    <div className="font-medium">{selectedMaterial.views}</div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <h4 className="font-medium">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMaterial.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-turbo-indigo/10 text-turbo-indigo border-turbo-indigo/30"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-white/5">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-turbo-purple to-turbo-indigo"
                >
                  <CheckCircle size={14} className="mr-2" />
                  Approve
                </Button>
                <Button size="sm" variant="outline">
                  <Edit3 size={14} className="mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-400 border-red-400/30"
                >
                  <Flag size={14} className="mr-2" />
                  Flag
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
