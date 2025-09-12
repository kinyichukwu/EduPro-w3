import React from "react";
import { cn } from "@/shared/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
}) => {
  // Simple markdown parser for common patterns
  const parseMarkdown = (text: string): React.ReactElement => {
    const lines = text.split("\n");
    const elements: React.ReactElement[] = [];
    let listItems: string[] = [];
    let isInCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = "";

    const flushListItems = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul
            key={`list-${elements.length}`}
            className="list-disc list-inside space-y-1 my-2 ml-4"
          >
            {listItems.map((item, index) => (
              <li key={index} className="text-sm leading-relaxed">
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <div key={`code-${elements.length}`} className="my-3">
            {codeBlockLanguage && (
              <div className="text-xs text-white/60 bg-dark-background/60 px-3 py-1 rounded-t-lg border border-white/10 border-b-0">
                {codeBlockLanguage}
              </div>
            )}
            <pre className="bg-dark-background/60 border border-white/10 rounded-lg rounded-t-none p-3 overflow-x-auto max-w-full break-all">
              <code className="text-sm text-green-300 font-mono whitespace-pre-wrap break-all">
                {codeBlockContent.join("\n")}
              </code>
            </pre>
          </div>
        );
        codeBlockContent = [];
        codeBlockLanguage = "";
      }
    };

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith("```")) {
        if (isInCodeBlock) {
          flushCodeBlock();
          isInCodeBlock = false;
        } else {
          flushListItems();
          isInCodeBlock = true;
          codeBlockLanguage = line.slice(3).trim();
        }
        return;
      }

      if (isInCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Handle headers
      if (line.startsWith("### ")) {
        flushListItems();
        elements.push(
          <h3
            key={index}
            className="text-lg font-semibold text-white mt-4 mb-2"
          >
            {parseInlineMarkdown(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        flushListItems();
        elements.push(
          <h2 key={index} className="text-xl font-bold text-white mt-4 mb-2">
            {parseInlineMarkdown(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        flushListItems();
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-white mt-4 mb-2">
            {parseInlineMarkdown(line.slice(2))}
          </h1>
        );
      }
      // Handle bullet points
      else if (line.match(/^[•\-\*]\s+/)) {
        listItems.push(line.replace(/^[•\-\*]\s+/, ""));
      }
      // Handle numbered lists
      else if (line.match(/^\d+\.\s+/)) {
        flushListItems();
        const content = line.replace(/^\d+\.\s+/, "");
        elements.push(
          <div key={index} className="flex items-start gap-2 my-1">
            <span className="text-turbo-purple font-medium text-sm mt-0.5">
              {line.match(/^(\d+)\./)?.[1]}.
            </span>
            <span className="text-sm leading-relaxed flex-1">
              {parseInlineMarkdown(content)}
            </span>
          </div>
        );
      }
      // Handle bold text lines (like **Key Points:**)
      else if (line.match(/^\*\*.*\*\*:?\s*$/)) {
        flushListItems();
        elements.push(
          <div
            key={index}
            className="font-semibold text-turbo-purple mt-3 mb-2 text-sm"
          >
            {parseInlineMarkdown(line)}
          </div>
        );
      }
      // Handle blockquotes
      else if (line.startsWith("> ")) {
        flushListItems();
        elements.push(
          <blockquote
            key={index}
            className="border-l-4 border-turbo-purple/50 pl-4 py-2 my-2 bg-turbo-purple/10 rounded-r-lg"
          >
            <p className="text-sm leading-relaxed italic">
              {parseInlineMarkdown(line.slice(2))}
            </p>
          </blockquote>
        );
      }
      // Handle horizontal rules
      else if (line.match(/^---+$/)) {
        flushListItems();
        elements.push(<hr key={index} className="border-white/20 my-4" />);
      }
      // Handle empty lines
      else if (line.trim() === "") {
        flushListItems();
        if (elements.length > 0) {
          elements.push(<div key={`space-${index}`} className="h-2" />);
        }
      }
      // Handle regular paragraphs
      else {
        flushListItems();
        elements.push(
          <p key={index} className="text-sm leading-relaxed my-1">
            {parseInlineMarkdown(line)}
          </p>
        );
      }
    });

    // Flush any remaining items
    flushListItems();
    flushCodeBlock();

    return <div className="space-y-1">{elements}</div>;
  };

  // Parse inline markdown (bold, italic, code, links)
  const parseInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold text **text**
      const boldMatch = remaining.match(/^(.*?)\*\*(.*?)\*\*(.*)/);
      if (boldMatch) {
        if (boldMatch[1]) parts.push(boldMatch[1]);
        parts.push(
          <strong key={key++} className="font-semibold text-white">
            {boldMatch[2]}
          </strong>
        );
        remaining = boldMatch[3];
        continue;
      }

      // Italic text *text*
      const italicMatch = remaining.match(/^(.*?)\*(.*?)\*(.*)/);
      if (italicMatch && !remaining.match(/^\*\*/)) {
        if (italicMatch[1]) parts.push(italicMatch[1]);
        parts.push(
          <em key={key++} className="italic text-white/90">
            {italicMatch[2]}
          </em>
        );
        remaining = italicMatch[3];
        continue;
      }

      // Inline code `code`
      const codeMatch = remaining.match(/^(.*?)`(.*?)`(.*)/);
      if (codeMatch) {
        if (codeMatch[1]) parts.push(codeMatch[1]);
        parts.push(
          <code
            key={key++}
            className="bg-dark-background/60 text-green-300 px-1.5 py-0.5 rounded text-xs font-mono border border-white/10 break-all"
          >
            {codeMatch[2]}
          </code>
        );
        remaining = codeMatch[3];
        continue;
      }

      // Links [text](url)
      const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)/);
      if (linkMatch) {
        if (linkMatch[1]) parts.push(linkMatch[1]);
        parts.push(
          <a
            key={key++}
            href={linkMatch[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-turbo-purple hover:text-turbo-indigo underline transition-colors"
          >
            {linkMatch[2]}
          </a>
        );
        remaining = linkMatch[4];
        continue;
      }

      // No more markdown patterns found
      parts.push(remaining);
      break;
    }

    return <>{parts}</>;
  };

  return (
    <div className={cn("prose prose-sm prose-invert max-w-none break-words overflow-wrap-anywhere", className)}>
      {parseMarkdown(content)}
    </div>
  );
};
