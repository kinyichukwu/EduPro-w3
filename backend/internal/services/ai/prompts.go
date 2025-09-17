package ai

import (
	"fmt"
	"strings"
)

// QuizPrompt generates a system prompt for quiz creation
func QuizPrompt(topic, subject, level string, numQuestions int) string {
	prompt := fmt.Sprintf(`Break topics down clearly, step by step. Use simple, easy-to-understand language. Provide examples or analogies where helpful. Be concise but thorough. Avoid unnecessary filler or irrelevant information. If unsure, state this and suggest next steps. Always be helpful, friendly, and professional.

Generate exactly %d multiple-choice questions about: %s

Requirements:
- Questions should be appropriate for Nigerian tertiary institution students
- Align with university-level academic standards
- Each question must have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Include brief explanations for correct answers
- Use clear, academic language appropriate for higher education
- Focus on critical thinking, analysis, and application
- Include both theoretical and practical aspects where relevant

`, numQuestions, topic)

	if subject != "" {
		prompt += fmt.Sprintf("Subject context: %s\n", subject)
	}

	if level != "" {
		prompt += fmt.Sprintf("Academic level: %s (e.g., 100L, 200L, 300L, 400L, HND1, HND2, NCE, etc.)\n", level)
	}

	prompt += `
IMPORTANT: Return ONLY valid JSON. Do not wrap in markdown code blocks or backticks.

Return in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": [
        "A) Option 1",
        "B) Option 2", 
        "C) Option 3",
        "D) Option 4"
      ],
      "correct_answer": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Topic: ` + topic

	return prompt
}

// ExplanationPrompt generates a system prompt for explanations
func ExplanationPrompt(topic, subject, level string) string {
	prompt := fmt.Sprintf(`When providing explanations:
- Break topics down clearly, step by step
- Use simple, easy-to-understand language
- Provide examples or analogies where helpful

When providing information:
- Use available knowledge base or search tools
- Return accurate, up-to-date answers
- Always cite or reference sources when available

When solving problems:
- Work through solutions step by step
- Show the reasoning process
- Provide clear final answers

Be concise but thorough. Avoid unnecessary filler or irrelevant information. If unsure, state this and suggest next steps. Always be helpful, friendly, and professional.

Please explain the following topic: %s
`, topic)

	if subject != "" {
		prompt += fmt.Sprintf("SUBJECT: %s\n", subject)
	}

	if level != "" {
		prompt += fmt.Sprintf("LEVEL: %s\n", level)
	}

	prompt += `
IMPORTANT: Return ONLY valid JSON. Do not wrap in markdown code blocks or backticks.

Return in this exact format:
{
  "explanation": "Clear, helpful explanation",
  "key_points": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "summary": "Brief summary",
  "examples": [
    "Relevant example"
  ]
}
`

	return prompt
}

// SanitizeInput cleans and validates user input
func SanitizeInput(input string) string {
	// Remove potentially harmful characters
	input = strings.TrimSpace(input)

	// Remove excessive whitespace
	input = strings.Join(strings.Fields(input), " ")

	// Basic length check
	if len(input) > 1000 {
		input = input[:1000]
	}

	return input
}

// BuildContext creates context string from subject and level
func BuildContext(subject, level string) string {
	var context []string

	if subject != "" {
		context = append(context, fmt.Sprintf("Subject: %s", subject))
	}

	if level != "" {
		context = append(context, fmt.Sprintf("Level: %s", level))
	}

	if len(context) > 0 {
		return strings.Join(context, ", ")
	}

	return ""
}

// RAGPrompt generates a system prompt for RAG-based question answering
func RAGPrompt(query, context string) string {
	if context == "" {
		return fmt.Sprintf(`Break topics down clearly, step by step. Use simple, easy-to-understand language. Provide examples or analogies where helpful. Be concise but thorough. Avoid unnecessary filler or irrelevant information. If unsure, state this and suggest next steps. Always be helpful, friendly, and professional.

IMPORTANT: Return ONLY valid JSON. Do not wrap in markdown code blocks or backticks.

Return in this exact format:
{
  "explanation": "Clear, helpful explanation",
  "key_points": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "summary": "Brief summary",
  "examples": [
    "Relevant example"
  ]
}

Question: %s`, query)
	}

	prompt := fmt.Sprintf(`Break topics down clearly, step by step. Use simple, easy-to-understand language. Provide examples or analogies where helpful. Be concise but thorough. Avoid unnecessary filler or irrelevant information. If unsure, state this and suggest next steps. Always be helpful, friendly, and professional.

Context:
%s

Question: %s

IMPORTANT: Answer based on the provided context first. If information isn't in the context, clearly state that and provide general guidance.

Return ONLY valid JSON. Do not wrap in markdown code blocks or backticks.

Return in this exact format:
{
  "explanation": "Clear, helpful explanation based on context",
  "key_points": [
    "Key point 1",
    "Key point 2", 
    "Key point 3"
  ],
  "summary": "Brief summary",
  "examples": [
    "Relevant example"
  ]
}`, context, query)

	return prompt
}

// BuildRAGContext creates a formatted context string from document chunks
func BuildRAGContext(chunks []DocumentChunk) string {
	if len(chunks) == 0 {
		return ""
	}

	var contextBuilder strings.Builder

	for i, chunk := range chunks {
		if i > 0 {
			contextBuilder.WriteString("\n\n---\n\n")
		}

		contextBuilder.WriteString(fmt.Sprintf("Document: %s\n", chunk.DocumentTitle))
		if chunk.SourceURL != "" {
			contextBuilder.WriteString(fmt.Sprintf("Source: %s\n", chunk.SourceURL))
		}
		contextBuilder.WriteString(fmt.Sprintf("Section %d: %s", chunk.Ordinal+1, chunk.Content))
	}

	return contextBuilder.String()
}

// FlashcardPrompt generates a system prompt for flashcard creation
func FlashcardPrompt(topic, subject, level string, numCards int) string {
	prompt := fmt.Sprintf(`Break topics down clearly, step by step. Use simple, easy-to-understand language. Provide examples or analogies where helpful. Be concise but thorough. Avoid unnecessary filler or irrelevant information. If unsure, state this and suggest next steps. Always be helpful, friendly, and professional.

Generate exactly %d educational flashcards about: %s

Requirements:
- Create flashcards appropriate for Nigerian tertiary institution students
- Align with university-level academic standards
- Each flashcard should have a clear, specific question on the front
- Each flashcard should have a comprehensive answer on the back
- Include appropriate difficulty level: "easy", "medium", or "hard"
- Focus on key concepts, definitions, processes, and critical thinking
- Use clear, academic language appropriate for higher education
- Include both theoretical and practical aspects where relevant
- Questions should test understanding, not just memorization
- AVOID complex mathematical notation, LaTeX, or special characters that could break JSON parsing
- Use simple text descriptions instead of mathematical symbols

`, numCards, topic)

	if subject != "" {
		prompt += fmt.Sprintf("Subject context: %s\n", subject)
	}

	if level != "" {
		prompt += fmt.Sprintf("Academic level: %s (e.g., 100L, 200L, 300L, 400L, HND1, HND2, NCE, etc.)\n", level)
	}

	prompt += `
IMPORTANT: Return ONLY valid JSON. Do not wrap in markdown code blocks or backticks.

Return in this exact format:
{
  "flashcards": [
    {
      "front": "What is the definition of X?",
      "back": "X is defined as... (comprehensive explanation)",
      "difficulty": "medium"
    }
  ]
}

Topic: ` + topic

	return prompt
}

// DocumentChunk represents a chunk of document content for RAG
type DocumentChunk struct {
	DocumentID    string
	DocumentTitle string
	SourceURL     string
	Ordinal       int
	Content       string
}
