export const mockUserData = {
  name: "Isaac Odeyemi",
  email: "isaac@university.edu",
  phone: "+234 813 456 7890",
  school: "University of Lagos",
  department: "Computer Science",
  avatar: "https://ui.shadcn.com/avatars/01.png",
  plan: "Free",
  prompts: { used: 8, total: 20 },
  uploads: { used: 3, total: 5 },
  nextRenewal: "2024-02-15",
  referralCode: "ISAAC-123",
  referrals: {
    total: 2,
    completed: 1,
    pending: 1,
    earnings: 10,
  },
  eduproCoins: 1250,
};

export const plans = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    features: ["20 prompts/month", "5 uploads/month", "Basic support"],
    current: true,
  },
  {
    name: "Student Pro",
    price: "₦2,500",
    period: "month",
    yearlyPrice: "₦25,000",
    features: [
      "500 prompts/month",
      "50 uploads/month",
      "Priority support",
      "Past questions access",
    ],
    popular: true,
  },
  {
    name: "Unlimited",
    price: "₦5,000",
    period: "month",
    yearlyPrice: "₦50,000",
    features: [
      "Unlimited prompts",
      "Unlimited uploads",
      "Premium support",
      "All features",
    ],
  },
];

export const paymentHistory = [
  {
    date: "2024-01-15",
    plan: "Student Pro",
    amount: "₦2,500",
    status: "Paid",
    invoice: "#INV-001",
  },
  {
    date: "2023-12-15",
    plan: "Student Pro",
    amount: "₦2,500",
    status: "Paid",
    invoice: "#INV-002",
  },
];

export const referralList = [
  { name: "John Doe", joined: true, subscribed: false, credits: 5 },
  { name: "Jane Smith", joined: true, subscribed: true, credits: 10 },
];

export interface Transaction {
  id: string
  type: "earned" | "spent"
  title: string
  description: string
  amount: number
  date: Date
  status: "completed" | "pending" | "failed"
  category: "quiz" | "purchase" | "referral" | "tutoring" | "streak" | "access" | "welcome"
}

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "earned",
    title: "Quiz completion reward",
    description: "Completed Advanced Mathematics Quiz",
    amount: 100,
    date: new Date("2024-01-20T11:30:00"),
    status: "completed",
    category: "quiz",
  },
  {
    id: "2",
    type: "spent",
    title: "Premium flashcard deck",
    description: "Physics Fundamentals - 500 cards",
    amount: -50,
    date: new Date("2024-01-19T15:15:00"),
    status: "completed",
    category: "purchase",
  },
  {
    id: "3",
    type: "earned",
    title: "Referral bonus",
    description: "Friend joined using your referral code",
    amount: 200,
    date: new Date("2024-01-18T10:45:00"),
    status: "completed",
    category: "referral",
  },
  {
    id: "4",
    type: "spent",
    title: "AI tutoring session",
    description: "30-minute Chemistry help session",
    amount: -75,
    date: new Date("2024-01-17T17:20:00"),
    status: "completed",
    category: "tutoring",
  },
  {
    id: "5",
    type: "earned",
    title: "Study streak bonus",
    description: "7-day consecutive study streak",
    amount: 150,
    date: new Date("2024-01-16T09:00:00"),
    status: "completed",
    category: "streak",
  },
  {
    id: "6",
    type: "spent",
    title: "Past question access",
    description: "Unlock 2023 exam questions",
    amount: -25,
    date: new Date("2024-01-15T13:30:00"),
    status: "completed",
    category: "access",
  },
  {
    id: "7",
    type: "earned",
    title: "Welcome bonus",
    description: "Account creation reward",
    amount: 300,
    date: new Date("2024-01-14T01:00:00"),
    status: "completed",
    category: "welcome",
  },
]