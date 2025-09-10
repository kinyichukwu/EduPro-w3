import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Target,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";

// Mock data for analytics
const cohorts = [
  { id: "UNILAG_CS_2024", name: "UNILAG Computer Science 2024", students: 245 },
  { id: "UI_ENG_2024", name: "UI Engineering 2024", students: 189 },
  { id: "FUTA_SCI_2024", name: "FUTA Sciences 2024", students: 156 },
];

const performanceData = [
  {
    subject: "Mathematics",
    completion: 87,
    avgScore: 78,
    weakness: "Calculus",
  },
  { subject: "Physics", completion: 72, avgScore: 68, weakness: "Mechanics" },
  {
    subject: "Chemistry",
    completion: 91,
    avgScore: 82,
    weakness: "Organic Chemistry",
  },
  { subject: "Biology", completion: 65, avgScore: 71, weakness: "Genetics" },
];

const completionFunnels = [
  { stage: "Registration", count: 1247, percentage: 100 },
  { stage: "First Quiz", count: 987, percentage: 79 },
  { stage: "Midterm", count: 756, percentage: 61 },
  { stage: "Final Assessment", count: 623, percentage: 50 },
];

const weakTopics = [
  { topic: "Calculus Integration", subject: "Mathematics", difficulty: 89 },
  { topic: "Quantum Mechanics", subject: "Physics", difficulty: 85 },
  { topic: "Organic Synthesis", subject: "Chemistry", difficulty: 78 },
  { topic: "DNA Replication", subject: "Biology", difficulty: 72 },
];

export const AnalyticsPage = () => {
  const [selectedCohort, setSelectedCohort] = useState("UNILAG_CS_2024");
  const [timeRange, setTimeRange] = useState("30d");

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
          <h1 className="text-3xl font-bold">Class Analytics</h1>
          <p className="text-dark-muted">
            Performance insights and learning patterns across cohorts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Refresh Data
          </Button>
        </div>
      </motion.div>

      {/* Cohort Selector & Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Select Cohort
                </label>
                <Select
                  value={selectedCohort}
                  onValueChange={setSelectedCohort}
                >
                  <SelectTrigger className="bg-dark-accent/30 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cohorts.map((cohort) => (
                      <SelectItem key={cohort.id} value={cohort.id}>
                        {cohort.name} ({cohort.students} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <label className="text-sm font-medium mb-2 block">
                  Time Range
                </label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="bg-dark-accent/30 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 3 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="sm">
                  <Filter size={16} className="mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Heat-maps */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} className="text-turbo-indigo" />
              Subject Performance Heat-map
            </CardTitle>
            <CardDescription>
              Completion rates and average scores by subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.map((subject) => (
                <div
                  key={subject.subject}
                  className="p-4 bg-dark-accent/20 rounded-xl border border-white/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-turbo-purple/10 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-turbo-purple" />
                      </div>
                      <div>
                        <h4 className="font-medium">{subject.subject}</h4>
                        <p className="text-xs text-dark-muted">
                          Weak area: {subject.weakness}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {subject.avgScore}% avg score
                      </div>
                      <div className="text-xs text-dark-muted">
                        {subject.completion}% completion
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Completion Rate</span>
                        <span>{subject.completion}%</span>
                      </div>
                      <Progress value={subject.completion} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Average Score</span>
                        <span>{subject.avgScore}%</span>
                      </div>
                      <Progress value={subject.avgScore} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Funnels */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} className="text-green-500" />
                Completion Funnel
              </CardTitle>
              <CardDescription>
                Student progression through assessment stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completionFunnels.map((stage, index) => (
                  <div
                    key={stage.stage}
                    className="flex items-center justify-between p-3 bg-dark-accent/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <span className="font-medium">{stage.stage}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{stage.count}</div>
                      <div className="text-xs text-dark-muted">
                        {stage.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weak Topics List */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-orange-500" />
                Weak Topics
              </CardTitle>
              <CardDescription>
                Topics with lowest performance scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weakTopics.map((topic, index) => (
                  <div
                    key={topic.topic}
                    className="flex items-center justify-between p-3 bg-dark-accent/20 rounded-lg hover:bg-dark-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-400">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{topic.topic}</div>
                        <div className="text-xs text-dark-muted">
                          {topic.subject}
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs",
                        topic.difficulty > 80
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : topic.difficulty > 70
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      )}
                    >
                      {topic.difficulty}% difficulty
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Learning Patterns */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} className="text-turbo-indigo" />
              Learning Patterns
            </CardTitle>
            <CardDescription>
              When and how students engage with content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Peak Study Hours</h4>
                <div className="space-y-2">
                  {[
                    { time: "2-4 PM", usage: 78 },
                    { time: "8-10 PM", usage: 65 },
                    { time: "10-12 PM", usage: 52 },
                  ].map((period) => (
                    <div
                      key={period.time}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{period.time}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={period.usage} className="w-20 h-2" />
                        <span className="text-xs text-dark-muted">
                          {period.usage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Content Preferences</h4>
                <div className="space-y-2">
                  {[
                    { type: "Video Lessons", preference: 89 },
                    { type: "Practice Quizzes", preference: 76 },
                    { type: "Study Notes", preference: 58 },
                  ].map((content) => (
                    <div
                      key={content.type}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{content.type}</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={content.preference}
                          className="w-20 h-2"
                        />
                        <span className="text-xs text-dark-muted">
                          {content.preference}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Device Usage</h4>
                <div className="space-y-2">
                  {[
                    { device: "Mobile", usage: 67 },
                    { device: "Desktop", usage: 28 },
                    { device: "Tablet", usage: 5 },
                  ].map((device) => (
                    <div
                      key={device.device}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{device.device}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={device.usage} className="w-20 h-2" />
                        <span className="text-xs text-dark-muted">
                          {device.usage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
