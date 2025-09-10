// import { motion } from "framer-motion";
import {
  // User,
  // Copy,
  // CheckCircle,
  // Gift,
  // Mail,
  // QrCode,
  Clock,
} from "lucide-react";
// import { Button } from "@/shared/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/shared/components/ui/card";
import { TabsContent } from "@/shared/components/ui/tabs";
// import { useState } from "react";
// import { mockUserData, referralList } from "@/dashboard/constants/profile";

export const ReferralTab = () => {
  // const [copied, setCopied] = useState(false);

  // const itemVariants = {
  //   hidden: { y: 20, opacity: 0 },
  //   visible: {
  //     y: 0,
  //     opacity: 1,
  //     transition: { type: "spring", stiffness: 100 },
  //   },
  // };

  // const handleCopyReferralLink = () => {
  //   navigator.clipboard.writeText(
  //     `https://edu.pro/r/${mockUserData.referralCode}`
  //   );
  //   setCopied(true);
  //   setTimeout(() => setCopied(false), 2000);
  // };


  return (
    <TabsContent value="referral" className="space-y-6">
      <div className="h-max text-center glass-card p-10 rounded-md">
        <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-turbo-purple" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Coming Soon</h2>
        <p className="text-white/50 text-lg mb-6 max-w-md mx-auto">
          We're working hard to bring you amazing new features. Stay tuned for updates!
        </p>
      </div>
      {/* Referral Banner */}
      {/* <motion.div variants={itemVariants}>
        <Card className="border-green/20 bg-gradient-to-r from-green/10 to-teal/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green to-teal rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  Invite friends, earn prompts! 🎉
                </h3>
                <p className="text-dark-muted">
                  Share your link and get +10 prompts for each friend
                  who joins
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 p-4 bg-dark-card/30 rounded-xl border border-white/5 max-w-md mx-auto backdrop-blur-sm">
                <span className="text-sm font-mono">
                  https://edu.pro/r/{mockUserData.referralCode}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyReferralLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div> */}

      {/* Referral Progress */}
      {/* <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-dark-accent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={351.86}
                      strokeDashoffset={
                        351.86 -
                        (351.86 * mockUserData.referrals.completed) / 5
                      }
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {mockUserData.referrals.completed}
                      </div>
                      <div className="text-xs text-dark-muted">
                        of 5
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-dark-muted">
                  Refer {5 - mockUserData.referrals.completed} more
                  friends to earn +50 prompts!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div> */}

      {/* Referral Status */}
      {/* <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Referral Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referralList.map((referral, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-dark-accent/10 rounded-xl border border-white/5 hover:bg-dark-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-turbo-purple to-turbo-indigo rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{referral.name}</div>
                      <div className="text-sm text-dark-muted">
                        {referral.joined ? "Joined" : "Pending"} •{" "}
                        {referral.subscribed ? "Subscribed" : "Free"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-500">
                      +{referral.credits} prompts
                    </div>
                    <div className="text-xs text-dark-muted">
                      earned
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div> */}

      {/* Social Share */}
      {/* <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Share Your Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-white/10 hover:border-turbo-purple/50 hover:bg-turbo-purple/10"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.594z" />
                </svg>
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-white/10 hover:border-turbo-purple/50 hover:bg-turbo-purple/10"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-white/10 hover:border-turbo-purple/50 hover:bg-turbo-purple/10"
              >
                <Mail size={16} />
                Email
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-white/10 hover:border-turbo-purple/50 hover:bg-turbo-purple/10"
              >
                <QrCode size={16} />
                QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div> */}
    </TabsContent>
  )
}