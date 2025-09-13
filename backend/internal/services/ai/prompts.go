package ai

import (
	"fmt"
	"strings"
)

// QuizPrompt generates a system prompt for quiz creation
func QuizPrompt(topic, subject, level string, numQuestions int) string {
	prompt := fmt.Sprintf(`You are an expert educator specializing in Nigerian tertiary education (universities, polytechnics, and colleges of education).

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
	prompt := fmt.Sprintf(`You are an expert tutor for Nigerian tertiary institution students (universities, polytechnics, and colleges of education).

Provide a clear, comprehensive explanation of: %s

Requirements:
- Write for university-level students with appropriate academic depth
- Break down complex concepts into understandable parts
- Use examples relevant to Nigerian context when possible
- Align with tertiary education curriculum standards
- Include practical applications and real-world relevance
- Highlight key concepts that are important for academic success
- Use proper academic terminology while maintaining clarity
- Connect concepts to broader theoretical frameworks where applicable

`, topic)

	if subject != "" {
		prompt += fmt.Sprintf("Subject context: %s\n", subject)
	}

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
  "explanation": "Detailed explanation here...",
  "key_points": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "summary": "Brief summary of the main concept",
  "examples": [
    "Example 1",
    "Example 2"
  ]
}

Topic: ` + topic

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
		return fmt.Sprintf(`You are an expert tutor for Nigerian tertiary institution students. The user has asked a question but no relevant context was found in their uploaded documents.

Question: %s

Please respond with: "I don't have enough information from your uploaded documents to answer this question accurately. Please upload relevant documents or ask a question about the content you've already shared."

Be polite and helpful, and suggest they upload more relevant materials if needed.`, query)
	}

	prompt := fmt.Sprintf(`You are an expert tutor for Nigerian tertiary institution students. Answer the user's question based STRICTLY on the provided context from their uploaded documents.

IMPORTANT INSTRUCTIONS:
- Only use information from the provided context
- If the context doesn't contain enough information to answer the question, say so clearly
- Be accurate and cite specific parts of the context when possible
- Maintain academic rigor appropriate for tertiary education
- Use clear, educational language
- If the question cannot be answered from the context, explain what information is missing

Context from uploaded documents:
%s

Question: %s

Provide a comprehensive answer based on the context above. If the context is insufficient, clearly state what additional information would be needed.`, context, query)

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

// DocumentChunk represents a chunk of document content for RAG
type DocumentChunk struct {
	DocumentID    string
	DocumentTitle string
	SourceURL     string
	Ordinal       int
	Content       string
}