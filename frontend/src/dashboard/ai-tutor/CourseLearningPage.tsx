"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import { Badge } from "@/shared/components/ui/badge"
import {
  CheckCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  BookOpen,
  FileText,
  User,
  Calendar,
  Menu,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet"
import { useCourseLearning } from "@/hooks/useCourseLearning"
import { useCourseProgress } from "@/hooks/useCourseProgress"
import { toast } from "sonner"

const getTypeIcon = (type: string) => {
  switch (type) {
    case "reading":
      return <FileText className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

export default function CourseLearningPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  
  // Fetch course learning content
  const { 
    data: learningContent, 
    isLoading: isLoadingContent, 
    error: contentError,
    refetch: refetchContent 
  } = useCourseLearning(courseId ?? null)
  
  // Fetch course progress
  const { 
    progress, 
    isLoading: isLoadingProgress, 
    isUpdating: isUpdatingProgress,
    error: progressError,
    updateProgress,
    refetch: refetchProgress 
  } = useCourseProgress(courseId ?? null)

  // Local state for UI
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())

  // Initialize active module and expanded modules when data loads
  useEffect(() => {
    if (learningContent?.modules && learningContent.modules.length > 0) {
      // Set first module as active if none selected
      if (!activeModuleId) {
        setActiveModuleId(learningContent.modules[0].id)
      }
      
      // Expand all modules by default
      setExpandedModules(learningContent.modules.map(m => m.id))
    }
  }, [learningContent, activeModuleId])

  // Update completed modules based on course progress
  useEffect(() => {
    if (progress && learningContent?.modules) {
      const completedCount = progress.completed_modules
      const newCompletedModules = new Set<string>()
      
      // Mark first N modules as completed based on completed_modules count
      // This is a simplified approach - in a real implementation you'd want
      // individual module progress tracking
      for (let i = 0; i < Math.min(completedCount, learningContent.modules.length); i++) {
        newCompletedModules.add(learningContent.modules[i].id)
      }
      
      setCompletedModules(newCompletedModules)
    }
  }, [progress, learningContent])

  const currentModule = learningContent?.modules.find(m => m.id === activeModuleId)
  const allModules = learningContent?.modules ?? []
  const currentIndex = allModules.findIndex(m => m.id === activeModuleId)
  const nextModule = allModules[currentIndex + 1]
  const prevModule = allModules[currentIndex - 1]

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => 
      prev.includes(moduleId) 
        ? prev.filter((id) => id !== moduleId) 
        : [...prev, moduleId]
    )
  }

  const markAsComplete = async (moduleId: string) => {
    if (!updateProgress || !courseId) {
      toast.error("Unable to update progress")
      return
    }

    try {
      const result = await updateProgress({
        module_id: moduleId,
        completed: true,
        progress: 100
      })

      if (result) {
        toast.success("Module marked as complete!")
        
        // Update local state
        setCompletedModules(prev => new Set([...prev, moduleId]))
        
        // Move to next module if available
        if (nextModule) {
          setActiveModuleId(nextModule.id)
        }
        
        // Refresh progress data
        refetchProgress()
      }
    } catch (error) {
      toast.error("Failed to update progress")
    }
  }

  const calculateProgress = () => {
    if (!progress) return 0
    return Math.round(progress.progress)
  }

  const isModuleCompleted = (moduleId: string) => {
    return completedModules.has(moduleId)
  }

  const getModuleProgress = (moduleId: string) => {
    return isModuleCompleted(moduleId) ? 100 : 0
  }

  // Loading state
  if (isLoadingContent || isLoadingProgress) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-50px)]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-turbo-purple mx-auto" />
          <p className="text-white/60">Loading course content...</p>
        </div>
      </div>
    )
  }

  // Error state (content error is fatal; progress error is non-fatal e.g., not enrolled yet)
  if (contentError) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-50px)]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-white/60">{contentError ?? "Failed to load course content"}</p>
          <Button 
            onClick={() => {
              refetchContent()
            }}
            className="bg-turbo-purple hover:bg-turbo-purple/80"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // No data state
  if (!learningContent) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-50px)]">
        <div className="text-center space-y-4">
          <BookOpen className="w-8 h-8 text-white/40 mx-auto" />
          <p className="text-white/60">No course content found</p>
          <Button 
            onClick={() => navigate("/dashboard/explore")}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/10"
          >
            Browse Courses
          </Button>
        </div>
      </div>
    )
  }

  const { course, modules } = learningContent

  return (
    <div className="flex max-h-[calc(100dvh-50px)] h-[calc(100dvh-50px)] w-full text-dark-text">
      <aside className={cn(
        "max-sm:hidden border-r border-white/10 w-80 bg-dark-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-dark-card/60 z-10",
        sidebarOpen && "max-sm:block max-sm:fixed max-sm:h-screen max-sm:pb-16"
      )}>
        <div className="h-full flex flex-col">
          <div className="max-sm:px-4 p-6 border-b border-white/10">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-3">
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="sm:hidden !p-0 w-6 h-6 focus:ring-1 rounded-full hover:bg-white/20"
                      >
                        <X className="h-4 w-4" strokeWidth="3" />
                      </Button>
                    </SheetTrigger>
                  </Sheet>
                  <h2 className="font-semibold text-lg text-white">{course.title}</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-dark-muted">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>Course Creator</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{modules.length} modules</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-muted">Course Progress</span>
                  <span className="font-medium text-white">{calculateProgress()}% complete</span>
                </div>
                <div className="space-y-1">
                  <Progress value={calculateProgress()} className="h-2 bg-dark-accent/50" />
                  <p className="text-xs text-dark-muted">
                    {progress?.completed_modules ?? 0} of {modules.length} modules completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {modules.map((module) => {
                const moduleProgress = getModuleProgress(module.id)
                const isExpanded = expandedModules.includes(module.id)
                const isCompleted = isModuleCompleted(module.id)

                return (
                  <div key={module.id}>
                    <div
                      className="font-medium cursor-pointer hover:bg-white/10 transition-colors duration-200 p-3 rounded-lg text-white"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                          />
                          <span className="truncate text-sm">{module.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-dark-accent/50 text-white border-white/10">
                            {moduleProgress}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      <div className="mt-2 ml-4 space-y-1">
                        <div
                          onClick={() => {
                            setActiveModuleId(module.id)
                            setSidebarOpen(false) // Close drawer when module is selected on mobile
                          }}
                          className={`cursor-pointer transition-all duration-200 rounded-md p-2.5 text-white ${
                            activeModuleId === module.id
                              ? "bg-gradient-to-r from-turbo-purple/30 to-turbo-indigo/30 border-l-2 border-turbo-purple"
                              : "hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : activeModuleId === module.id ? (
                                <div className="h-4 w-4 rounded-full bg-turbo-purple/20 border-2 border-turbo-purple flex items-center justify-center">
                                  <div className="h-1.5 w-1.5 rounded-full bg-turbo-purple" />
                                </div>
                              ) : (
                                <div className="h-4 w-4 rounded-full bg-dark-accent border border-white/10" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {getTypeIcon("reading")}
                                <span className="truncate text-sm">{module.title}</span>
                              </div>
                            </div>
                            <span className="text-xs text-dark-muted flex-shrink-0">
                              {Math.ceil(module.content.length / 1000)} min read
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </aside>

      <div className="w-full flex flex-col">
        <header className="flex shrink-0 h-16 pt-2 items-center gap-4 border-b border-white/10 px-4 sm:px-6 bg-dark-card/95 backdrop-blur supports-[backdrop-filter]:bg-dark-card/60">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden !p-0 w-6 h-6 hover:bg-white/20"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-dark-muted">
              Module {currentIndex + 1}
            </span>
            <ChevronRight className="h-3 w-3 text-dark-muted" />
            <span className="font-medium text-white">{currentModule?.title}</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          <div className="flex-1 max-sm:px-4 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-2.5 sm:gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-r from-turbo-purple/20 to-turbo-indigo/20 border border-white/10">
                    {isModuleCompleted(activeModuleId ?? "") ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      getTypeIcon("reading")
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <h1 className="text-3xl font-bold text-white leading-tight">{currentModule?.title}</h1>
                    <div className="flex items-center gap-6 text-sm text-dark-muted">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{Math.ceil((currentModule?.content.length || 0) / 1000)} min read</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Module {currentIndex + 1} of {modules.length}
                        </span>
                      </div>
                      <Badge
                        variant={isModuleCompleted(activeModuleId ?? "") ? "default" : "secondary"}
                        className={`px-3 py-1 ${
                          isModuleCompleted(activeModuleId ?? "") 
                            ? "bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white" 
                            : "bg-dark-accent/50 text-white border-white/10"
                        }`}
                      >
                        {isModuleCompleted(activeModuleId ?? "") ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-dark-accent/30 to-dark-accent/10 rounded-xl border border-white/10 max-sm:p-6 p-8">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <div className="text-white leading-relaxed text-base whitespace-pre-line">
                    {currentModule?.content || "No content available for this module."}
                  </div>
                </div>
              </div>

              <footer className="max-sm:pt-0 p-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    disabled={!prevModule}
                    onClick={() => prevModule && setActiveModuleId(prevModule.id)}
                    className="flex items-center gap-2 sm:px-6 px-3 py-2.5 border-white/10 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="max-sm:hidden">Previous Module</span>
                  </Button>

                  <div className="flex items-center gap-3">
                    {!isModuleCompleted(activeModuleId ?? "") && activeModuleId && (
                      <Button 
                        variant="outline" 
                        onClick={() => markAsComplete(activeModuleId)}
                        disabled={isUpdatingProgress}
                        className="px-3 sm:px-6 py-2.5 bg-dark-accent/50 text-white border-white/10 hover:bg-dark-accent/70"
                      >
                        {isUpdatingProgress ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <span className="max-sm:hidden">Mark as Complete</span>
                            <CheckCircle className="h-4 w-4 sm:hidden" />
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      disabled={!nextModule}
                      onClick={() => nextModule && setActiveModuleId(nextModule.id)}
                      className="flex items-center gap-2 sm:px-6 px-3 py-2.5 bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
                    >
                      <span className="max-sm:hidden">Next Module</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
