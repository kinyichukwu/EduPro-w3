import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Check,
  CheckCircle
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { DialogDescription } from "@/shared/components/ui/dialog";
import { DialogTitle } from "@/shared/components/ui/dialog";
import { DialogContent, DialogHeader } from "@/shared/components/ui/dialog";
import { Dialog } from "@/shared/components/ui/dialog";

const GoogleIcon = () => (
  <svg
    viewBox="0 0 488 512"
    className="mr-2"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
  </svg>
);

const DiscordIcon = () => (
  <svg
    viewBox="0 0 640 512"
    className="mr-2"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
  </svg>
);

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);

  const navigate = useNavigate();
  const { signUp, signInWithOAuth, loading} = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password, username, () => {
      setIsSignedUp(true);
    });
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    const onSuccess = () => {
      navigate('/dashboard')
    };
    
    await signInWithOAuth(provider, onSuccess);
  };

  const features = [
    "AI-powered learning assistance",
    "Interactive flashcards & quizzes",
    "Personalized study plans",
    "Progress tracking & analytics",
  ];

  const clearForm = () => {
    setEmail("");
    setUsername("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-dark-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-mesh-gradient" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-turbo-purple/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-turbo-indigo/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="space-y-6">
              <div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center gap-2 mb-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-3xl font-bold gradient-text">
                    EduPro AI
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-4xl font-bold text-white mb-4"
                >
                  Transform Your Learning Journey
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-xl text-white/70 mb-8"
                >
                  Join thousands of students using AI to accelerate their
                  academic success
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="space-y-4"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white/80">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-turbo-purple to-turbo-indigo flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">
                  EduPro AI
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Create Account
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-white/60"
              >
                Start your learning journey today
              </motion.p>
            </div>

            {/* Auth Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="glass-card rounded-2xl p-8 border border-white/10"
            >
              {/* Desktop Header */}
              <div className="hidden lg:block text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Create Account
                </h2>
                <p className="text-white/60">
                  Start your learning journey today
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  onClick={() => handleOAuthSignIn('google')}
                  variant="outline"
                  className="w-full bg-white/5 hover:bg-white/10 border-white/20 text-white hover:border-turbo-purple/50 transition-all duration-200"
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>
                <Button
                  onClick={() => handleOAuthSignIn('apple')}
                  variant="outline"
                  className="w-full bg-white/5 hover:bg-white/10 border-white/20 text-white hover:border-turbo-indigo/50 transition-all duration-200"
                >
                  <DiscordIcon />
                  Continue with Discord
                </Button>
              </div>

              <div className="flex my-8 items-center">
                <div className="h-[1px] w-full bg-white/10"></div>
                <span className="min-w-max px-2 text-white/60 text-sm leading-0">
                  Or continue with email
                </span>
                <div className="h-[1px] w-full bg-white/10"></div>
              </div>

              {/* Email Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-turbo-purple/50 focus:ring-2 focus:ring-turbo-purple/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-turbo-purple/50 focus:ring-2 focus:ring-turbo-purple/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-turbo-purple/50 focus:ring-2 focus:ring-turbo-purple/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 rounded border-white/20 bg-white/5"
                  />
                  <span className="text-white/60">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="text-turbo-purple hover:text-turbo-indigo transition-colors"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      className="text-turbo-purple hover:text-turbo-indigo transition-colors"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={loading.signUp}
                  className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white font-medium py-3 transition-all duration-200 disabled:opacity-50"
                >
                  {loading.signUp ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center text-sm">
                <span className="text-white/60">
                  Already have an account?{" "}
                </span>
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="text-turbo-purple hover:text-turbo-indigo p-0 h-auto font-medium"
                >
                  Sign in
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {isSignedUp && <SignUpForm isOpen={isSignedUp} setIsOpen={setIsSignedUp} email={email} clearForm={clearForm} />}
    </div>
  );
};

export default SignUp;

const SignUpForm = ({ isOpen, setIsOpen, email, clearForm }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void, email: string, clearForm: () => void }) => {
  const navigate = useNavigate();

  const onClose = () => {
    setIsOpen(false);
    clearForm();
  };

  const onGoToLogin = () => {
    navigate("/login");
    // clearForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-slate-800 text-white">
        <div className="absolute inset-0 bg-mesh-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-turbo-purple/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-turbo-indigo/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <DialogHeader className="space-y-4 pt-4">
          <div className="mx-auto relative">
            <div className="w-18 h-18 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-full flex items-center justify-center border border-emerald-500/30 backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
            </div>
            {/* Animated Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
          </div>
          <DialogTitle className="text-xl font-semibold">Check Your Email</DialogTitle>
          <DialogDescription className="text-white/60 text-base">
            We've sent a confirmation link to <span className="font-medium text-white">{email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-white/10 border-white/20 mt-4 flex gap-3 rounded-lg">
          <Mail className="h-4 w-4 mt-0.5 text-turbo-indigo flex-shrink-0" />
          <p className="text-white/90 text-sm">
            Please check your inbox and click the confirmation link to activate your account. Don't forget to check your
            spam folder!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 z-10">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent border-white/20 text-white/80 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Button>
          <Button onClick={onGoToLogin} className="flex-1 bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 text-white">
            Go to Login
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          Didn't receive the email? Check your spam folder or contact support.
        </p>
      </DialogContent>
    </Dialog>
  )
};