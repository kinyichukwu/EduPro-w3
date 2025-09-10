import { History, Upload, BarChart2, PlusCircle, FileText } from "lucide-react";

// Main library feature cards
export const libraryFeatures = [
  {
    title: "Past Questions",
    description:
      "Access examination questions from previous years and practice tests",
    icon: History,
    stats: { value: 240, label: "Questions Available" },
    color: "from-turbo-purple to-purple",
    path: "/dashboard/library/past-questions",
    action: "Browse Questions",
  },
  {
    title: "My Uploads",
    description: "Manage your uploaded documents, notes and study materials",
    icon: Upload,
    stats: { value: 18, label: "Documents" },
    color: "from-turbo-blue to-light-blue",
    path: "/dashboard/library/uploads",
    action: "View Uploads",
  },
  {
    title: "Analytics",
    description:
      "Track study patterns, question performance, and subject mastery",
    icon: BarChart2,
    stats: { value: "72%", label: "Mastery Score" },
    color: "from-green to-teal",
    path: "/dashboard/library/analytics",
    action: "View Statistics",
  },
  {
    title: "Upload New",
    description:
      "Add new study materials, notes, or documents to your library",
    icon: PlusCircle,
    stats: { value: "3/5", label: "Monthly Uploads" },
    color: "from-amber to-orange",
    path: "/dashboard/library/upload",
    action: "Upload Material",
  },
];

// Recent uploads data
export const recentUploads = [
  {
    name: "Chemistry Notes.pdf",
    date: "2 days ago",
    size: "4.2 MB",
    icon: {
      name: FileText,
      color: "text-red"
    },
  },
  {
    name: "Biology Diagrams.png",
    date: "1 week ago",
    size: "2.8 MB",
    icon: {
      name: FileText,
      color: "text-turbo-blue"
    },
  },
  {
    name: "Physics Formulas.docx",
    date: "2 weeks ago",
    size: "1.5 MB",
    icon: {
      name: FileText,
      color: "text-green"
    },
  },
];

// Popular exam topics
export const examTopics = [
  {
    name: "Algebra",
    count: 45,
    color:
      "bg-purple text-purple dark:bg-purple/10 dark:text-purple",
  },
  {
    name: "Organic Chemistry",
    count: 38,
    color: "bg-turbo-blue text-turbo-blue dark:bg-turbo-blue/15 dark:text-turbo-blue",
  },
  {
    name: "Cell Biology",
    count: 32,
    color:
      "bg-green text-green dark:bg-green/15 dark:text-green",
  },
  {
    name: "Mechanics",
    count: 28,
    color: "bg-amber text-amber dark:bg-amber/15 dark:text-amber",
  },
  {
    name: "Literature",
    count: 24,
    color: "bg-red text-red dark:bg-red/15 dark:text-red",
  },
];

export const performanceStats = [
  {
    id: "questions",
    label: "Questions Attempted",
    value: 128,
    change: 12,
    trend: "up",
    color: "bg-purple-500",
  },
  {
    id: "accuracy",
    label: "Average Accuracy",
    value: "76%",
    change: -3,
    trend: "down",
    color: "bg-blue-500",
  },
  {
    id: "streak",
    label: "Current Streak",
    value: 5,
    change: 2,
    trend: "up",
    color: "bg-emerald-500",
  },
  {
    id: "materials",
    label: "Materials Studied",
    value: 14,
    change: 5,
    trend: "up",
    color: "bg-amber-500",
  },
];

// Mock data for subjects
export const subjects = [
  {
    id: "mathematics",
    name: "Mathematics",
    color: "bg-violet-600",
    questions: 78,
    completed: 24,
  },
  {
    id: "physics",
    name: "Physics",
    color: "bg-blue-600",
    questions: 62,
    completed: 18,
  },
  {
    id: "chemistry",
    name: "Chemistry",
    color: "bg-emerald-600",
    questions: 55,
    completed: 32,
  },
  {
    id: "biology",
    name: "Biology",
    color: "bg-amber-600",
    questions: 67,
    completed: 15,
  },
  {
    id: "english",
    name: "English",
    color: "bg-pink-600",
    questions: 45,
    completed: 22,
  },
];

// Mock data for exams
export const examTypes = [
  { id: "waec", name: "WAEC", questions: 120 },
  { id: "neco", name: "NECO", questions: 85 },
  { id: "jamb", name: "JAMB", questions: 75 },
  { id: "cambridge", name: "Cambridge", questions: 50 },
];

// Mock data for past questions
export const pastQuestions = [
  {
    id: 1,
    subject: "Mathematics",
    year: 2023,
    examType: "WAEC",
    paper: "Paper 1",
    questions: 50,
    duration: 90,
    difficulty: "Medium",
    progress: 68,
  },
  {
    id: 2,
    subject: "Physics",
    year: 2022,
    examType: "NECO",
    paper: "Paper 2",
    questions: 40,
    duration: 120,
    difficulty: "Hard",
    progress: 45,
  },
  {
    id: 3,
    subject: "Chemistry",
    year: 2023,
    examType: "JAMB",
    paper: "MCQ",
    questions: 60,
    duration: 60,
    difficulty: "Easy",
    progress: 92,
  },
  {
    id: 4,
    subject: "Mathematics",
    year: 2021,
    examType: "Cambridge",
    paper: "Paper 2",
    questions: 45,
    duration: 75,
    difficulty: "Medium",
    progress: 0,
  },
];

// Difficulty badge colors
export const difficultyColors = {
  Easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};