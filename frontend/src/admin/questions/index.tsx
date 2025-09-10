import { useState } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  Upload,
  FileText,
  Search,
  Filter,
  Edit3,
  Trash2,
  Copy,
  History,
  GitBranch,
  Plus,
  CheckCircle,
  X,
  AlertTriangle,
  FileDown,
  FileUp,
  Merge,
  Tag,
  Eye,
  MoreHorizontal,
  BookOpen,
  Calculator,
  Beaker,
  GraduationCap,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

// Mock data for questions
const questions = [
  {
    id: 1,
    question: "What is the molecular formula of water?",
    type: "MCQ",
    subject: "Chemistry",
    topic: "Chemical Formulas",
    difficulty: "easy",
    version: "v2",
    status: "published",
    createdBy: "Dr. Sarah Johnson",
    lastModified: "2024-01-15",
    syllabus: "WAEC",
    year: "2023",
    hasExplanation: true,
    options: ["H2O", "H2SO4", "CO2", "NaCl"],
    correctAnswer: "H2O",
    explanation: "Water consists of two hydrogen atoms and one oxygen atom.",
    missingTopics: false,
  },
  {
    id: 2,
    question: "Calculate the area of a circle with radius 5cm",
    type: "Essay",
    subject: "Mathematics",
    topic: "Geometry",
    difficulty: "medium",
    version: "v1",
    status: "draft",
    createdBy: "Prof. Mike Adams",
    lastModified: "2024-01-14",
    syllabus: "JAMB",
    year: "2024",
    hasExplanation: false,
    missingTopics: true,
  },
  {
    id: 3,
    question: "The acceleration due to gravity is approximately:",
    type: "True/False",
    subject: "Physics",
    topic: "Mechanics",
    difficulty: "easy",
    version: "v3",
    status: "review",
    createdBy: "Dr. Emily Chen",
    lastModified: "2024-01-13",
    syllabus: "NECO",
    year: "2023",
    hasExplanation: true,
    missingTopics: false,
  },
];

const versionHistory = [
  {
    version: "v3",
    date: "2024-01-13",
    author: "Dr. Emily Chen",
    changes: "Updated answer options",
  },
  {
    version: "v2",
    date: "2024-01-10",
    author: "Admin",
    changes: "Added explanation",
  },
  {
    version: "v1",
    date: "2024-01-08",
    author: "Dr. Emily Chen",
    changes: "Initial creation",
  },
];

export const QuestionBankPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSyllabus, setSelectedSyllabus] = useState("all");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || question.status === selectedFilter;
    const matchesSubject =
      selectedSubject === "all" || question.subject === selectedSubject;
    const matchesSyllabus =
      selectedSyllabus === "all" || question.syllabus === selectedSyllabus;
    return matchesSearch && matchesFilter && matchesSubject && matchesSyllabus;
  });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredQuestions.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredQuestions.map((q) => q.id));
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleEditQuestion = (question: any) => {
    setSelectedQuestion(question);
    setEditorMode("edit");
    setShowEditor(true);
  };

  const handleCreateQuestion = () => {
    setSelectedQuestion(null);
    setEditorMode("create");
    setShowEditor(true);
  };

  const handleViewHistory = (question: any) => {
    setSelectedQuestion(question);
    setShowHistory(true);
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case "chemistry":
        return <Beaker className="w-4 h-4" />;
      case "mathematics":
        return <Calculator className="w-4 h-4" />;
      case "physics":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <GraduationCap className="w-4 h-4" />;
    }
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
          <h1 className="text-3xl font-bold">Question Bank Manager</h1>
          <p className="text-dark-muted">
            Manage MCQ, True/False, and Essay questions with version control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportWizard(true)}
          >
            <Upload size={16} className="mr-2" />
            Import Questions
          </Button>
          <Button variant="outline" size="sm">
            <FileDown size={16} className="mr-2" />
            Export Bank
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-turbo-purple to-turbo-indigo"
            onClick={handleCreateQuestion}
          >
            <Plus size={16} className="mr-2" />
            New Question
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-turbo-indigo/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-turbo-indigo" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Total Questions</p>
                  <p className="text-xl font-bold">1,847</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Missing Topics</p>
                  <p className="text-xl font-bold text-orange-500">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-muted">No Explanation</p>
                  <p className="text-xl font-bold text-red-500">89</p>
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
                  <p className="text-sm text-dark-muted">Published</p>
                  <p className="text-xl font-bold text-green-500">1,735</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-4 h-4" />
                <Input
                  placeholder="Search questions by content, topic, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-dark-accent/30 border-white/10"
                />
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[150px] bg-dark-accent/30 border-white/10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="w-[150px] bg-dark-accent/30 border-white/10">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedSyllabus}
                onValueChange={setSelectedSyllabus}
              >
                <SelectTrigger className="w-[150px] bg-dark-accent/30 border-white/10">
                  <SelectValue placeholder="Syllabus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Syllabus</SelectItem>
                  <SelectItem value="WAEC">WAEC</SelectItem>
                  <SelectItem value="JAMB">JAMB</SelectItem>
                  <SelectItem value="NECO">NECO</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>
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
                    {selectedItems.length} questions selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Tag size={14} className="mr-2" />
                      Mass Retag
                    </Button>
                    <Button size="sm" variant="outline">
                      <Merge size={14} className="mr-2" />
                      Merge Duplicates
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileUp size={14} className="mr-2" />
                      Export Selected
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

      {/* Questions Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question Library</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <GitBranch size={16} className="mr-2" />
                  Version Control
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-dark-accent/20">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedItems.length === filteredQuestions.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Syllabus Coverage</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow
                    key={question.id}
                    className="border-white/5 hover:bg-dark-accent/10"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(question.id)}
                        onCheckedChange={() => handleSelectItem(question.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="font-medium text-sm truncate">
                          {question.question}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {question.difficulty}
                          </Badge>
                          {!question.hasExplanation && (
                            <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                              No explanation
                            </Badge>
                          )}
                          {question.missingTopics && (
                            <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                              Missing topics
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {question.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSubjectIcon(question.subject)}
                        <span className="text-sm">{question.subject}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{question.topic}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "text-xs",
                          question.status === "published" &&
                            "bg-green-500/20 text-green-400 border-green-500/30",
                          question.status === "draft" &&
                            "bg-orange-500/20 text-orange-400 border-orange-500/30",
                          question.status === "review" &&
                            "bg-turbo-indigo/20 text-turbo-indigo border-turbo-indigo/30"
                        )}
                      >
                        {question.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {question.version}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleViewHistory(question)}
                        >
                          <History size={12} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-dark-muted">
                          {question.syllabus}
                        </span>
                        {question.missingTopics && (
                          <div className="text-xs text-orange-400 mt-1">
                            Missing coverage
                          </div>
                        )}
                      </div>
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
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewHistory(question)}
                          >
                            <History className="mr-2 h-4 w-4" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
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

      {/* Import Wizard Dialog */}
      <Dialog open={showImportWizard} onOpenChange={setShowImportWizard}>
        <DialogContent className="max-w-2xl bg-dark-card border-white/5">
          <DialogHeader>
            <DialogTitle>Import Questions Wizard</DialogTitle>
            <DialogDescription>
              Upload CSV, DOCX, or ZIP files with images. AI will auto-parse
              MCQ/T&F/Essay fields.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-dark-muted mb-4" />
              <p className="text-sm text-dark-muted mb-2">
                Drag and drop your files here, or click to browse
              </p>
              <Button variant="outline">Choose Files</Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-white/5 bg-dark-accent/20">
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto text-turbo-purple mb-2" />
                  <p className="text-sm font-medium">CSV/Excel</p>
                  <p className="text-xs text-dark-muted">
                    Structured question data
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-dark-accent/20">
                <CardContent className="p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto text-turbo-indigo mb-2" />
                  <p className="text-sm font-medium">DOCX</p>
                  <p className="text-xs text-dark-muted">Word documents</p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-dark-accent/20">
                <CardContent className="p-4 text-center">
                  <Upload className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <p className="text-sm font-medium">ZIP</p>
                  <p className="text-xs text-dark-muted">
                    Images & mixed files
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowImportWizard(false)}
              >
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-turbo-purple to-turbo-indigo">
                Start Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Editor Sheet */}
      <Sheet open={showEditor} onOpenChange={setShowEditor}>
        <SheetContent className="w-[800px] sm:max-w-[800px] bg-dark-card border-white/5">
          <SheetHeader>
            <SheetTitle>
              {editorMode === "create"
                ? "Create New Question"
                : "Edit Question"}
            </SheetTitle>
            <SheetDescription>
              Rich editor with markdown support, math rendering (KaTeX), and
              image upload
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Question Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Question</label>
              <Textarea
                placeholder="Enter your question here... (Supports Markdown and LaTeX)"
                className="min-h-[120px] bg-dark-accent/30 border-white/10"
                defaultValue={selectedQuestion?.question}
              />
            </div>

            {/* Question Type & Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select defaultValue={selectedQuestion?.type || "MCQ"}>
                  <SelectTrigger className="bg-dark-accent/30 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ">Multiple Choice</SelectItem>
                    <SelectItem value="True/False">True/False</SelectItem>
                    <SelectItem value="Essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select defaultValue={selectedQuestion?.difficulty || "medium"}>
                  <SelectTrigger className="bg-dark-accent/30 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Answer Key */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Answer Key</label>
              <Textarea
                placeholder="Enter the correct answer and options (for MCQ)..."
                className="bg-dark-accent/30 border-white/10"
                defaultValue={selectedQuestion?.correctAnswer}
              />
            </div>

            {/* Explanation */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Explanation</label>
              <Textarea
                placeholder="Provide a detailed explanation for the answer..."
                className="bg-dark-accent/30 border-white/10"
                defaultValue={selectedQuestion?.explanation}
              />
            </div>

            {/* Tags & Classification */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select defaultValue={selectedQuestion?.subject}>
                  <SelectTrigger className="bg-dark-accent/30 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic</label>
                <Input
                  placeholder="Enter topic"
                  className="bg-dark-accent/30 border-white/10"
                  defaultValue={selectedQuestion?.topic}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Syllabus</label>
                <Select defaultValue={selectedQuestion?.syllabus}>
                  <SelectTrigger className="bg-dark-accent/30 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WAEC">WAEC</SelectItem>
                    <SelectItem value="JAMB">JAMB</SelectItem>
                    <SelectItem value="NECO">NECO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                Cancel
              </Button>
              <Button variant="outline">Save as Draft</Button>
              <Button className="bg-gradient-to-r from-turbo-purple to-turbo-indigo">
                {editorMode === "create"
                  ? "Create Question"
                  : "Update Question"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Version History Sheet */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent className="w-[600px] sm:max-w-[600px] bg-dark-card border-white/5">
          <SheetHeader>
            <SheetTitle>Version History</SheetTitle>
            <SheetDescription>
              Git-style commit log with compare, revert, and blame functionality
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            {versionHistory.map((version, index) => (
              <div
                key={version.version}
                className="flex items-center justify-between p-4 bg-dark-accent/20 rounded-lg border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-turbo-purple/20 flex items-center justify-center">
                    <GitBranch className="w-4 h-4 text-turbo-purple" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{version.version}</div>
                    <div className="text-xs text-dark-muted">
                      {version.date} by {version.author}
                    </div>
                    <div className="text-xs text-dark-muted mt-1">
                      {version.changes}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye size={14} className="mr-1" />
                    Compare
                  </Button>
                  {index !== 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-orange-400"
                    >
                      <History size={14} className="mr-1" />
                      Revert
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
