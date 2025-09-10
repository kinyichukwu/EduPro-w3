import { Button } from "@/shared/components/ui";
import { ArrowLeft, Play, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion"
import { ProgressRing } from ".";

interface Topic {
  id: number;
  title: string;
  status: "mastered" | "in_progress" | "not_started";
  progress: number;
  description: string;
}

const topics: Topic[] = [
  {
    id: 1,
    title: "Quadratic Equations",
    status: "mastered",
    progress: 100,
    description: "Solving and graphing quadratic functions",
  },
  {
    id: 2,
    title: "Logarithms",
    status: "in_progress",
    progress: 60,
    description: "Properties and applications of logarithmic functions",
  },
  {
    id: 3,
    title: "Trigonometry",
    status: "not_started",
    progress: 0,
    description: "Sine, cosine, and tangent functions",
  },
  {
    id: 4,
    title: "Calculus Basics",
    status: "not_started",
    progress: 0,
    description: "Derivatives and basic integration",
  },
  {
    id: 5,
    title: "Linear Algebra",
    status: "in_progress",
    progress: 35,
    description: "Matrices, vectors, and linear transformations",
  },
];

export default function Topic() {
  const navigate = useNavigate()
  const location = useLocation();
  
  const selectedCourse = location.pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ")

  const handleStartTopic = (topic: Topic) => {
    navigate(`/dashboard/ai-tutor/${selectedCourse?.trim().replace(/\s+/g, "-")}/${topic.title.trim().replace(/\s+/g, "-")}`);    
  };

  const handleReturn = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/chat");
    }
  }

  return (
    <div className="h-full w-full space-y-6">
      <section className="flex flex-col bg-dark-card/40 w-full rounded-xl border border-white/5 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={handleReturn}
            variant="ghost"
            size="icon"
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {selectedCourse}
            </h1>
            <p className="text-white/60 mt-1">
              Choose a topic to start your AI tutoring session
            </p>
          </div>
        </div>

        <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic, index) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              onStart={handleStartTopic}
              index={index}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

const TopicItem: React.FC<{
  topic: Topic;
  onStart: (topic: Topic) => void;
  index: number;
}> = ({ topic, onStart, index }) => (
  <motion.div
    className="group bg-dark-card/60 backdrop-blur-lg border border-white/10 rounded-lg hover:bg-dark-card/80 hover:border-turbo-purple/30 transition-all duration-300 p-4 flex items-center justify-between"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ x: 4 }}
  >
    <div className="flex items-center gap-4 flex-1">
      <ProgressRing value={topic.progress} size={40} textStyle="text-[10px]" />
      <div className="flex-1">
        <h4 className="font-semibold text-white group-hover:text-turbo-purple transition-colors">
          {topic.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <div
            className={`w-2 h-2 rounded-full ${
              topic.status === "mastered"
                ? "bg-green-400"
                : topic.status === "in_progress"
                ? "bg-amber-400"
                : "bg-white/40"
            }`}
          />
          <p className="text-sm text-white/60">
            {topic.description?.slice(0, 50)}...
          </p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Button
        onClick={() => onStart(topic)}
        size="sm"
        className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 sm:opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <Play className="w-3 h-3 mr-1" />
        Start
      </Button>
      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-turbo-purple transition-colors" />
    </div>
  </motion.div>
);