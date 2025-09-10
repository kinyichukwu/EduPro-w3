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