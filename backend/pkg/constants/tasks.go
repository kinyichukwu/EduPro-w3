package constants

// Task types supported by the API
const (
	TaskQuiz    = "quiz"
	TaskExplain = "explain"
)

// Available task types
var ValidTasks = []string{
	TaskQuiz,
	TaskExplain,
}

// Default configuration values
const (
	DefaultQuizQuestions = 5
	MaxQuizQuestions     = 10
	MinQueryLength       = 3
	MaxQueryLength       = 1000
)