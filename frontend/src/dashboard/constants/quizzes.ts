interface Question {
  id: number;
  type: "MCQ" | "True/False" | "Essay" | "Oral";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  diagram?: string;
}

export const mockQuestions: Question[] = [
  {
    id: 1,
    type: "MCQ",
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
    correctAnswer: 1,
    explanation:
      "Mitochondria are known as the powerhouse of the cell because they produce ATP through cellular respiration.",
  },
  {
    id: 2,
    type: "True/False",
    question: "DNA replication is a semi-conservative process.",
    correctAnswer: "True",
    explanation:
      "DNA replication is semi-conservative because each new DNA molecule contains one original strand and one newly synthesized strand.",
  },
  {
    id: 3,
    type: "Essay",
    question:
      "Explain the process of photosynthesis and its importance in the ecosystem.",
    correctAnswer:
      "Photosynthesis is the process by which plants convert light energy into chemical energy (glucose) using carbon dioxide and water. This process is crucial for life on Earth as it produces oxygen and serves as the foundation of most food chains.",
    explanation:
      "A complete answer should include the light-dependent and light-independent reactions, the role of chlorophyll, and the ecological significance.",
  },
  {
    id: 4,
    type: "Oral",
    question:
      "Describe the structure of an atom and explain how electrons are arranged.",
    correctAnswer:
      "An atom consists of a nucleus containing protons and neutrons, surrounded by electrons in energy levels or shells. Electrons occupy orbitals within these shells according to specific rules.",
    explanation:
      "Students should mention the nucleus, electron shells, and basic principles of electron configuration.",
  },
];