import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { motion } from "framer-motion";
import StudentsImage from "@/assets/login.png";
import Onboarding from "../onboarding/Onboarding";

const GoogleIcon = () => (
  <svg
    viewBox="0 0 488 512"
    className="mr-2 text-white"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path
      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      fill="currentColor"
    />
  </svg>
);

const DiscordIcon = () => (
  <svg
    viewBox="0 0 640 512"
    className="mr-2 text-white"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path
      d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"
      fill="currentColor"
    />
  </svg>
);

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isOnboarding, setIsOnboarding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOnboarding(true);
    // login("email", email, password);
  };

  const navigate = useNavigate();

  return (
    <>
      {isOnboarding ? (
        <Onboarding />
      ) : (
        <div className="min-h-screen flex flex-col-reverse md:flex-row bg-gray-950">
          {/* Left Side - Illustration */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-12 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-md"
            >
              <img
                src={StudentsImage}
                alt="Students"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
              <div className="mt-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Learning Platform for Students
                </h2>
                <p className="text-gray-400">
                  Connect with other students, access learning resources, and
                  track your academic progress.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 bg-gray-900">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border border-gray-800 bg-gray-800/50 backdrop-blur-sm rounded-xl w-full max-w-md p-6 sm:p-8 shadow-xl"
            >
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                  Create Account
                </h1>
                <p className="text-gray-400">
                  Sign up to get started with our platform
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-4 mb-6">
                <Button
                  onClick={() => setIsOnboarding(true)}
                  variant="outline"
                  className="w-full bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-gray-200"
                >
                  <GoogleIcon />
                  Sign up with Google
                </Button>
                <Button
                  onClick={() => setIsOnboarding(true)}
                  variant="outline"
                  className="w-full bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-gray-200"
                >
                  <DiscordIcon />
                  Sign up with Discord
                </Button>
              </div>

              <div className="relative my-6 flex items-center">
                <div className="h-[1px] w-full bg-gray-700"></div>
                <span className="px-2 text-gray-400 shrink-0">
                  Or continue with
                </span>
                <div className="h-[1px] w-full bg-gray-700"></div>
              </div>

              {/* Email Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-gray-200 focus:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-gray-200 focus:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-700 text-gray-200 focus:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
                >
                  Sign Up
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-gray-400">Already have an account?</span>
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="text-purple-400 ml-1 px-0 hover:text-purple-300 font-medium"
                >
                  Sign In
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignUp;
