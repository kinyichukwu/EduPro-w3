import Navbar from "@/landing/components/Navbar";
import Footer from "@/landing/components/Footer";
import { motion } from "framer-motion";

import { BrainCircuit, Library, BookOpen, LineChart, Target, Activity, CalendarDays } from "lucide-react";

const features = [
  {
    title: "AI Tutor",
    description: "Get intelligent tutoring and personalized learning support",
    icon: BrainCircuit,
    stats: { value: 15, label: "Sessions This Week" },
    color: "from-green to-teal",
    path: "/dashboard/ai-tutor",
    action: "Ask AI",
  },
  {
    title: "Library",
    description: "Browse past questions, notes, and educational resources",
    icon: Library,
    stats: { value: 24, label: "Materials" },
    color: "from-turbo-blue to-light-blue",
    path: "/dashboard/library",
    action: "Explore Resources",
  },
  {
    title: "Study Room",
    description: "Access your courses, study materials, and learning paths",
    icon: BookOpen,
    stats: { value: 4, label: "Active Courses" },
    color: "from-turbo-purple to-purple/90",
    path: "/dashboard/quizzes",
    action: "Continue Learning",
  },
  {
    title: "Performance",
    description: "Track your progress, achievements, and exam readiness",
    icon: LineChart,
    stats: { value: "78%", label: "Average Score" },
    color: "from-amber to-orange",
    path: "/dashboard/performance",
    action: "View Analytics",
  },
  {
    title: "Study Goals",
    description: "Set, track, and achieve your personalized learning objectives",
    icon: Target,
    stats: { value: 3, label: "Goals Active" },
    color: "from-pink-500 to-fuchsia-500",
    path: "/dashboard/goals",
    action: "Set Goals",
  },
  {
    title: "Activity Tracker",
    description: "Monitor your study habits and time spent on learning",
    icon: Activity,
    stats: { value: "12h", label: "Study Time This Week" },
    color: "from-rose-500 to-red-500",
    path: "/dashboard/activity",
    action: "Track Activity",
  },
  {
    title: "Calendar",
    description: "Plan your study schedule and stay organized",
    icon: CalendarDays,
    stats: { value: 5, label: "Upcoming Sessions" },
    color: "from-cyan-500 to-sky-500",
    path: "/dashboard/calendar",
    action: "View Calendar",
  },
];

const Courses = () => {
  return (
    <motion.div
      className="min-h-screen bg-dark-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-dark-text sm:text-5xl">
            <span className="dark-gradient-text">Our Features</span>
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Explore our AI-powered tools designed to transform your study
            materials into interactive learning resources.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <section
                key={feature.title}
                className="relative p-6 glass-card rounded-2xl hover:shadow-lg transition-all overflow-hidden duration-500 group flex flex-col items-center justify-center"
              >
                <span className="absolute w-[140px] sm:w-[150px] z-10 h-[150px] sm:h-[170px] group-hover:scale-150 group-hover:rotate-12 transition-all duration-1000 bottom-[-70%] left-0 blur-3xl bg-primary px-2 py-1 rounded-full bg-gradient-to-r from-purple-800 to-green-700" />
                <div className="flex flex-col items-center w-full">
                  <div className="h-12 w-12 z-20 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 flex items-center justify-center text-white group-hover:scale-110 transition-transform mb-4">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="text-center z-20">
                    <h3 className="text-lg md:text-xl font-bold text-dark-text mb-2">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm md:text-base text-dark-muted opacity-90 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Animated background glow */}
                <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-primary/5 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </section>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default Courses;
