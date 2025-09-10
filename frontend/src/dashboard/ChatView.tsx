import React from "react";

export const ChatView = () => {
  return (
    <div className="px-4 md:px-6">
      <h1 className="text-2xl font-semibold mb-6 gradient-text">
        Chat with AI
      </h1>
      <div className="glass-card rounded-xl p-6 border border-turbo-purple/40">
        <p className="text-white">This is the Chat page of the dashboard.</p>
        <p className="text-dark-muted mt-2">
          Here you'll be able to ask questions and get AI-powered answers to
          help with your studies.
        </p>
      </div>
    </div>
  );
};
