import { QuizAttempt } from "@/dashboard/quizzes/Quiz";
import { Button } from "@/shared/components/ui";
import { ArrowLeft, BookmarkPlus, MessageCircle, RotateCcw } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { QuestionComponent } from "./QuestionComponent";
import { mockQuestions } from "@/dashboard/constants/quizzes";

interface ResultsProps {
  score: number
  correctAnswers: number
  quizAttempts: QuizAttempt[]
  handleRestart: () => void
}

export const Results = ({score, correctAnswers, quizAttempts, handleRestart}: ResultsProps) => {
  const location = useLocation()
  const navigate = useNavigate()

  const selectedQuiz = location.pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ")

  const handleReturn = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/chat");
    }
  }

  return (
    <div className="h-full w-full space-y-6 px-3 py-4">
      {/* Results Header */}
      <div className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={handleReturn}
            variant="ghost"
            size="icon"
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Quiz Results</h1>
            <p className="text-white/60">{selectedQuiz}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-dark-background/40 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-turbo-purple mb-1">
              {score}%
            </div>
            <div className="text-sm text-white/60">Final Score</div>
          </div>
          <div className="bg-dark-background/40 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {correctAnswers}
            </div>
            <div className="text-sm text-white/60">Correct</div>
          </div>
          <div className="bg-dark-background/40 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400 mb-1">
              {quizAttempts.length - correctAnswers}
            </div>
            <div className="text-sm text-white/60">Incorrect</div>
          </div>
          <div className="bg-dark-background/40 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-amber-400 mb-1">
              {quizAttempts.length}
            </div>
            <div className="text-sm text-white/60">Total</div>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <section className="bg-dark-card/40 backdrop-blur-lg border border-white/10 rounded-xl p-4 sm:p-6">
        <h2 className="text-xl font-bold text-white mb-4">Question Review</h2>
        <div className="space-y-4">
          {mockQuestions.map((question, index) => {
            const attempt = quizAttempts[index];
            return (
              <div
                key={question.id}
                className="border border-white/10 rounded-lg p-4"
              >
                <QuestionComponent
                  question={question}
                  onAnswer={() => null}
                  userAnswer={attempt?.userAnswer}
                  showResult={true}
                  questionNumber={index + 1}
                  totalQuestions={mockQuestions.length}
                />
                <div className="mt-4 flex max-sm:flex-col gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-turbo-purple/30 text-turbo-purple hover:bg-turbo-purple/10"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ask Follow-up
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                  >
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    Add to Flashcards
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => handleRestart()}
          className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Retake Quiz
        </Button>
        <Button
          onClick={() => navigate("/dashboard/quizzes")}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          Back to Quizzes
        </Button>
      </div>
    </div>
  )
}