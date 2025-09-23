"use client"

import { useState } from "react"
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
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet"

const courseData = {
  title: "Advanced React & TypeScript",
  progress: 65,
  modules: [
    {
      id: 1,
      title: "Getting Started",
      progress: 100,
      chapters: [
        { id: 1, title: "Course Introduction", type: "reading", duration: "5 min", completed: true, content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." },
        { id: 2, title: "Development Setup", type: "reading", duration: "12:45", completed: true, content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." },
        { id: 3, title: "Project Overview", type: "reading", duration: "8 min", completed: true, content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." },
      ],
    },
    {
      id: 2,
      title: "React Fundamentals",
      progress: 75,
      chapters: [
        { id: 4, title: "Components & Props", type: "reading", duration: "15:30", completed: true, content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." },
        { id: 5, title: "State Management", type: "reading", duration: "18:45", completed: true, content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." },
        { id: 6, title: "Event Handling", type: "reading", duration: "12:20", completed: true, content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." },
        { id: 7, title: "Practice Exercise", type: "reading", duration: "4:30", completed: false, content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." },
      ],
    },
    {
      id: 3,
      title: "Advanced Patterns",
      progress: 25,
      chapters: [
        { id: 8, title: "Higher-Order Components", type: "reading", duration: "22:10", completed: true, content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." },
        { id: 9, title: "Render Props", type: "reading", duration: "19:30", completed: false, content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." },
        { id: 10, title: "Custom Hooks", type: "reading", duration: "25:45", completed: false, content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." },
        { id: 11, title: "Context API", type: "reading", duration: "20:15", completed: false, content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of 'de Finibus Bonorum et Malorum' (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, 'Lorem ipsum dolor sit amet..', comes from a line in section 1.10.32. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." },
      ],
    },
  ],
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "reading":
      return <FileText className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

export default function CourseLearningPage() {
  const [activeChapter, setActiveChapter] = useState(7)
  const [expandedModules, setExpandedModules] = useState<number[]>([1, 2, 3])
  const [completedChapters, setCompletedChapters] = useState<number[]>([1, 2, 3, 4, 5, 6, 8])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentChapter = courseData.modules
    .flatMap((module) => module.chapters)
    .find((chapter) => chapter.id === activeChapter)

  const allChapters = courseData.modules.flatMap((module) => module.chapters)
  const currentIndex = allChapters.findIndex((chapter) => chapter.id === activeChapter)
  const nextChapter = allChapters[currentIndex + 1]
  const prevChapter = allChapters[currentIndex - 1]

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const markAsComplete = (chapterId: number) => {
    setCompletedChapters((prev) => [...prev, chapterId])
    if (nextChapter) {
      setActiveChapter(nextChapter.id)
    }
  }

  const calculateProgress = () => {
    const totalChapters = allChapters.length
    const completed = completedChapters.length
    return Math.round((completed / totalChapters) * 100)
  }

  const isChapterCompleted = (chapterId: number) => completedChapters.includes(chapterId)

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
                  <h2 className="font-semibold text-lg text-white">{courseData.title}</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-dark-muted">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>Sarah Chen</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{allChapters.length} lessons</span>
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
                    {completedChapters.length} of {allChapters.length} lessons completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {courseData.modules.map((module) => {
                const moduleChapters = module.chapters
                const completedInModule = moduleChapters.filter((ch) => isChapterCompleted(ch.id)).length
                const moduleProgress = Math.round((completedInModule / moduleChapters.length) * 100)
                const isExpanded = expandedModules.includes(module.id)

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
                          {moduleProgress === 100 && <CheckCircle className="h-4 w-4 text-green-600" />}
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-dark-accent/50 text-white border-white/10">
                            {completedInModule}/{moduleChapters.length}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      <div className="mt-2 ml-4 space-y-1">
                        {module.chapters.map((chapter) => (
                          <div key={chapter.id}>
                            <div
                              onClick={() => {
                                setActiveChapter(chapter.id)
                                setSidebarOpen(false) // Close drawer when chapter is selected on mobile
                              }}
                              className={`cursor-pointer transition-all duration-200 rounded-md p-2.5 text-white ${
                                activeChapter === chapter.id
                                  ? "bg-gradient-to-r from-turbo-purple/30 to-turbo-indigo/30 border-l-2 border-turbo-purple"
                                  : "hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="flex-shrink-0">
                                  {isChapterCompleted(chapter.id) ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : activeChapter === chapter.id ? (
                                    <div className="h-4 w-4 rounded-full bg-turbo-purple/20 border-2 border-turbo-purple flex items-center justify-center">
                                      <div className="h-1.5 w-1.5 rounded-full bg-turbo-purple" />
                                    </div>
                                  ) : (
                                    <div className="h-4 w-4 rounded-full bg-dark-accent border border-white/10" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {getTypeIcon(chapter.type)}
                                    <span className="truncate text-sm">{chapter.title}</span>
                                  </div>
                                </div>
                                <span className="text-xs text-dark-muted flex-shrink-0">{chapter.duration}</span>
                              </div>
                            </div>
                          </div>
                        ))}
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
              Module {courseData.modules.find((m) => m.chapters.some((c) => c.id === activeChapter))?.id}
            </span>
            <ChevronRight className="h-3 w-3 text-dark-muted" />
            <span className="font-medium text-white">{currentChapter?.title}</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          <div className="flex-1 max-sm:px-4 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-2.5 sm:gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-r from-turbo-purple/20 to-turbo-indigo/20 border border-white/10">
                    {isChapterCompleted(activeChapter) ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      getTypeIcon(currentChapter?.type ?? "reading")
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <h1 className="text-3xl font-bold text-white leading-tight">{currentChapter?.title}</h1>
                    <div className="flex items-center gap-6 text-sm text-dark-muted">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{currentChapter?.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Lesson {currentIndex + 1} of {allChapters.length}
                        </span>
                      </div>
                      <Badge
                        variant={isChapterCompleted(activeChapter) ? "default" : "secondary"}
                        className={`px-3 py-1 ${
                          isChapterCompleted(activeChapter) 
                            ? "bg-gradient-to-r from-turbo-purple to-turbo-indigo text-white" 
                            : "bg-dark-accent/50 text-white border-white/10"
                        }`}
                      >
                        {isChapterCompleted(activeChapter) ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-dark-accent/30 to-dark-accent/10 rounded-xl border border-white/10 max-sm:p-6 p-8">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <div className="text-white leading-relaxed text-base whitespace-pre-line">
                    {currentChapter?.content}
                  </div>
                </div>
              </div>

              <footer className="max-sm:pt-0 p-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    disabled={!prevChapter}
                    onClick={() => prevChapter && setActiveChapter(prevChapter.id)}
                    className="flex items-center gap-2 sm:px-6 px-3 py-2.5 border-white/10 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="max-sm:hidden">Previous Lesson</span>
                  </Button>

                  <div className="flex items-center gap-3">
                    {!isChapterCompleted(activeChapter) && (
                      <Button 
                        variant="outline" 
                        onClick={() => markAsComplete(activeChapter)} 
                        className="px-3 sm:px-6 py-2.5 bg-dark-accent/50 text-white border-white/10 hover:bg-dark-accent/70"
                      >
                        <span className="max-sm:hidden">Mark as Complete</span>
                        <CheckCircle className="h-4 w-4 sm:hidden" />
                      </Button>
                    )}

                    <Button
                      disabled={!nextChapter}
                      onClick={() => nextChapter && setActiveChapter(nextChapter.id)}
                      className="flex items-center gap-2 sm:px-6 px-3 py-2.5 bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
                    >
                      <span className="max-sm:">Next Lesson</span>
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
