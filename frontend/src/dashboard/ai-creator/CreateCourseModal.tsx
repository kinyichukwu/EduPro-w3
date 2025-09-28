import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { X, Plus, Loader2, ExternalLink, Coins } from "lucide-react";
import { useCoursePayment } from "@/shared/hooks/useCoursePayment";
import { toast } from "react-hot-toast";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCourse: (courseData: {
    title: string;
    description: string;
    price_edu_tokens: number;
    creation_tx_signature: string;
    creator_wallet: string;
  }) => void;
}

export const CreateCourseModal = ({
  isOpen,
  onClose,
  onCreateCourse,
}: CreateCourseModalProps) => {
  const [courseTitle, setCourseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceEDU, setPriceEDU] = useState("0");
  const [eduBalance, setEduBalance] = useState(0);

  const {
    paymentState,
    payCourseCreationFee,
    getEDUBalance,
    resetPayment,
    isWalletConnected,
    walletAddress,
  } = useCoursePayment();

  // Load EDU balance when wallet is connected
  useEffect(() => {
    if (isWalletConnected) {
      getEDUBalance().then(setEduBalance);
    }
  }, [isWalletConnected, getEDUBalance]);

  const handleCreateCourse = async () => {
    if (!courseTitle.trim() || !description.trim() || !isWalletConnected) {
      toast.error('Please fill all fields and connect your wallet');
      return;
    }

    if (eduBalance < 10) {
      toast.error('Insufficient EDU balance. You need at least 10 EDU tokens to create a course.');
      return;
    }

    try {
      // 1. Pay course creation fee (10 EDU tokens)
      const txSignature = await payCourseCreationFee(10);
      
      // 2. Call backend to create course with payment verification
      const courseData = {
        title: courseTitle,
        description: description,
        price_edu_tokens: Math.round(parseFloat(priceEDU || "0") * 1e9), // Convert to token units
        creation_tx_signature: txSignature,
        creator_wallet: walletAddress!,
      };

      await onCreateCourse(courseData);
      
      resetForm();
      toast.success('Course created successfully!');
    } catch (error) {
      console.error("Failed to create course:", error);
      toast.error("Failed to create course. Please try again.");
    }
  };

  const resetForm = () => {
    setCourseTitle("");
    setDescription("");
    setPriceEDU("0");
    resetPayment();
  };

  const handleClose = () => {
    if (!paymentState.isLoading) {
      resetForm();
      onClose();
    }
  };

  const getPaymentStepText = () => {
    switch (paymentState.status) {
      case 'creating': return 'Creating payment transaction...';
      case 'signing': return 'Please sign the transaction...';
      case 'confirming': return 'Confirming payment...';
      case 'confirmed': return 'Payment confirmed! Creating course...';
      default: return 'Course creation requires 10 EDU tokens';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-dark-card/95 backdrop-blur-lg rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold gradient-text">
                  Create New Course
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  {getPaymentStepText()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={paymentState.isLoading}
                className="hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Wallet Status */}
              {isWalletConnected ? (
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Coins className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm">
                          EDU Balance: {eduBalance.toFixed(2)} EDU
                        </h3>
                        <p className="text-white/60 text-xs">
                          Connected: {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/60">Creation Fee: 10 EDU</p>
                      <p className={`text-xs ${
                        eduBalance >= 10 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {eduBalance >= 10 ? '✓ Sufficient' : '✗ Insufficient'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <ExternalLink className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">
                        Connect Wallet Required
                      </h3>
                      <p className="text-white/60 text-xs">
                        Connect your Solana wallet to create courses
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Status */}
              {paymentState.status !== 'idle' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    {paymentState.isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    ) : paymentState.status === 'confirmed' ? (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✗</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {getPaymentStepText()}
                      </p>
                      {paymentState.transactionSignature && (
                        <a
                          href={`https://explorer.solana.com/tx/${paymentState.transactionSignature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center mt-1"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Transaction
                        </a>
                      )}
                      {paymentState.error && (
                        <p className="text-xs text-red-400 mt-1">{paymentState.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Course Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Course Title
                </label>
                <Input
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Enter course title"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-turbo-purple focus:ring-turbo-purple"
                  disabled={paymentState.isLoading}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your course"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-turbo-purple focus:ring-turbo-purple min-h-24 resize-none"
                  disabled={paymentState.isLoading}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Course Price (EDU Tokens)
                </label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    type="number"
                    value={priceEDU}
                    onChange={(e) => setPriceEDU(e.target.value)}
                    placeholder="0"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-turbo-purple focus:ring-turbo-purple pl-10"
                    disabled={paymentState.isLoading}
                    min="0"
                    step="0.1"
                  />
                </div>
                <p className="text-xs text-white/60">
                  Set course price in EDU tokens. Set to 0 for free course. Platform fee: 2.5%
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-white/10">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={paymentState.isLoading}
                className="text-white border-white/20 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCourse}
                disabled={
                  !courseTitle.trim() ||
                  !description.trim() ||
                  paymentState.isLoading ||
                  !isWalletConnected ||
                  eduBalance < 10
                }
                className="bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:from-turbo-purple/80 hover:to-turbo-indigo/80 disabled:opacity-50"
              >
                {paymentState.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {paymentState.status === 'creating' && 'Paying...'}
                    {paymentState.status === 'signing' && 'Sign Wallet...'}
                    {paymentState.status === 'confirming' && 'Confirming...'}
                    {paymentState.status === 'confirmed' && 'Creating...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course (10 EDU)
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};