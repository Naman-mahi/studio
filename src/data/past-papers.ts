export type Question = {
  id: string;
  text: string;
  answer: string;
  explanation?: string;
};

export type PastPaper = {
  id: string;
  year: number;
  title: string;
  description: string;
  questions: Question[];
};

export const pastPapersData: PastPaper[] = [
  {
    id: "ntpc-2022-set1",
    year: 2022,
    title: "RRB NTPC 2022 - Set 1 (CBT Stage 1)",
    description: "General Awareness, Mathematics, and General Intelligence & Reasoning.",
    questions: [
      { id: "q1", text: "What is the capital of France?", answer: "Paris" },
      { id: "q2", text: "Solve for x: 2x + 5 = 15", answer: "x = 5", explanation: "Subtract 5 from both sides: 2x = 10. Divide by 2: x = 5." },
      { id: "q3", text: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci" },
    ],
  },
  {
    id: "ntpc-2021-set2",
    year: 2021,
    title: "RRB NTPC 2021 - Set 2 (CBT Stage 1)",
    description: "Covering topics from the official RRB NTPC syllabus.",
    questions: [
      { id: "q1", text: "What is the largest planet in our solar system?", answer: "Jupiter" },
      { id: "q2", text: "If a train travels 120 km in 2 hours, what is its speed?", answer: "60 km/h", explanation: "Speed = Distance / Time. Speed = 120km / 2h = 60 km/h." },
    ],
  },
  {
    id: "ntpc-2020-set1-cbt2",
    year: 2020,
    title: "RRB NTPC 2020 - Set 1 (CBT Stage 2)",
    description: "Advanced questions for CBT Stage 2.",
    questions: [
      { id: "q1", text: "What is H2O commonly known as?", answer: "Water" },
      { id: "q2", text: "Find the area of a rectangle with length 10cm and width 5cm.", answer: "50 cm²", explanation: "Area = length × width. Area = 10cm × 5cm = 50 cm²." },
      { id: "q3", text: "Which gas is most abundant in Earth's atmosphere?", answer: "Nitrogen" },
      { id: "q4", text: "What is the square root of 144?", answer: "12" },
    ],
  },
];
