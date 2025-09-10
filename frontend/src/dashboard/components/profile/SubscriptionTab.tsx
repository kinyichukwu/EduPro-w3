// import { motion } from "framer-motion";
import {
  // CheckCircle,
  // FileText,
  // ExternalLink,
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
// import { Badge } from "@/shared/components/ui/badge";
// import { Switch } from "@/shared/components/ui/switch";
// import { cn } from "@/shared/lib/utils";
// import { paymentHistory, plans } from "@/dashboard/constants/profile";
// import { useState } from "react";

export const SubscriptionTab = () => {
  // const [isAnnual, setIsAnnual] = useState(false);

  // const itemVariants = {
  //   hidden: { y: 20, opacity: 0 },
  //   visible: {
  //     y: 0,
  //     opacity: 1,
  //     transition: { type: "spring", stiffness: 100 },
  //   },
  // };

  return (
    <TabsContent value="subscription" className="space-y-6">
      <div className="h-max text-center glass-card p-10 rounded-md">
        <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-turbo-purple" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Coming Soon</h2>
        <p className="text-white/50 text-lg mb-6 max-w-md mx-auto">
          We're working hard to bring you amazing new features. Stay tuned for updates!
        </p>
      </div>
      {/* Plan Comparison Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            <Card
              className={cn(
                "border transition-all duration-300 hover:shadow-xl hover:shadow-turbo-purple/10",
                plan.current
                  ? "border-turbo-indigo/50 ring-2 ring-turbo-indigo/20 bg-gradient-to-br from-turbo-indigo/5 to-turbo-purple/5"
                  : "border-white/5 bg-dark-card/40",
                plan.popular &&
                  "border-turbo-purple/50 ring-2 ring-turbo-purple/20 bg-gradient-to-br from-turbo-purple/5 to-turbo-indigo/5"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-turbo-purple to-turbo-indigo">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  {plan.name}
                  {plan.current && (
                    <CheckCircle size={20} className="text-green-500" />
                  )}
                </CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    {isAnnual && plan.yearlyPrice ? (
                      <div>
                        <span>{plan.yearlyPrice}</span>
                        <span className="text-lg text-dark-muted ml-1">
                          /year
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span>{plan.price}</span>
                        <span className="text-lg text-dark-muted ml-1">
                          /{plan.period}
                        </span>
                      </div>
                    )}
                  </div>
                  {isAnnual && plan.yearlyPrice && (
                    <Badge
                      variant="outline"
                      className="text-green-500 border-green-500/20"
                    >
                      Save 17%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle
                        size={16}
                        className="text-green-500 flex-shrink-0"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <Button className="w-full bg-gradient-to-r from-turbo-purple to-turbo-indigo hover:shadow-lg">
                    Upgrade to {plan.name}
                  </Button>
                )}
                {plan.current && (
                  <Button variant="outline" className="w-full">
                    Current Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div> */}

      {/* Billing Toggle */}
      {/* <motion.div
        variants={itemVariants}
        className="flex justify-center"
      >
        <div className="flex items-center gap-4 p-4 bg-dark-accent/20 rounded-xl border border-white/5 backdrop-blur-sm">
          <span className={cn("text-sm", !isAnnual && "text-white")}>
            Monthly
          </span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={cn("text-sm", isAnnual && "text-white")}>
            Annual
          </span>
          <Badge variant="outline" className="text-green-500">
            Save 17%
          </Badge>
        </div>
      </motion.div> */}

      {/* Payment History */}
      {/* <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentHistory.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-dark-accent/10 rounded-xl border border-white/5 hover:bg-dark-accent/20 transition-colors"
                >
                  <div>
                    <div className="font-medium">{payment.plan}</div>
                    <div className="text-sm text-dark-muted">
                      {payment.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{payment.amount}</div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-green-500"
                      >
                        {payment.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ExternalLink size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div> */}
    </TabsContent>
  )
}