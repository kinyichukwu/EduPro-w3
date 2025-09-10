import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-background text-white">
      {/* Left side - Image/Illustration */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-turbo-purple via-turbo-indigo to-turbo-blue relative overflow-hidden hidden md:flex items-center justify-center">
        <div className="absolute inset-0 bg-dark-glow opacity-70"></div>
        <div className="relative z-10 p-8 max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/" className="inline-block">
              <h2 className="text-3xl font-bold">Brand Logo</h2>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold">Welcome to our Learning Platform</h1>
            <p className="text-xl text-white/80">
              Unlock your potential with personalized learning experiences designed for your educational journey.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex space-x-2 items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-sm font-bold">
                    {["JD", "MK", "AR"][i-1]}
                  </div>
                ))}
              </div>
              <p className="text-white/80">Join thousands of students already learning with us</p>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full filter blur-2xl"></div>
      </div>
      
      {/* Right side - Auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md bg-dark-card rounded-xl shadow-xl border border-white/5 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;