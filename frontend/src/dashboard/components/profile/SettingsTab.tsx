import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  // Download,
  // Trash2,
  // Bell,
  Shield,
  // FileText,
  Edit3,
  Save,
  // AlertTriangle,
  Wallet,
  LogOut,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { TabsContent } from "@/shared/components/ui/tabs";
// import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { useGetOnboardingStatus } from "@/dashboard/hooks/useOnboarding";
import { useAuthStore } from "@/store/useAuthStore";
import PasswordDialog from "./PasswordDialog";
import { WalletSection } from "./WalletSection";

export const SettingsTab = () => {
  const [isEditing, setIsEditing] = useState(false);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const loading = useAuthStore((s) => s.loading);
  const { data: onboardingData } = useGetOnboardingStatus();

  // Helper function to extract data from flexible academic_details
  const getAcademicInfo = (field: string) => {
    const academicDetails = onboardingData?.onboarding_data?.academic_details;
    if (!academicDetails) return "N/A";

    // Try to get from top level first
    if (academicDetails[field]) return academicDetails[field];

    // Try role-specific details
    const roleDetails =
      academicDetails.university_details ||
      academicDetails.jamb_details ||
      academicDetails.lecturer_details ||
      academicDetails.custom_details;

    if (roleDetails && roleDetails[field]) return roleDetails[field];

    // Try common field mappings
    if (field === "course") {
      return (
        roleDetails?.current_course ||
        roleDetails?.preferred_course ||
        roleDetails?.department ||
        "N/A"
      );
    }

    if (field === "university") {
      return (
        roleDetails?.current_university ||
        roleDetails?.preferred_university ||
        roleDetails?.institution ||
        "N/A"
      );
    }

    return "N/A";
  };
  // const [notifications, setNotifications] = useState({
  //   productUpdates: true,
  //   promotionalOffers: false,
  //   weeklyDigest: true,
  // });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <TabsContent value="settings" className="space-y-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Personal Info */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <User size={20} className="text-blue-400" />
                Personal Information
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="hover:bg-turbo-purple/20 text-purple-400 hover:text-purple-300"
              >
                {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                <span className="ml-2 hidden sm:inline">
                  {isEditing ? "Save" : "Edit"}
                </span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <div className="relative">
                    <div className="flex h-10 w-full items-center rounded-lg border border-white/10 bg-dark-accent/20 px-3 py-2 text-sm text-white">
                      {user?.full_name ?? "N/A"}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
                  <div className="relative">
                    <div className="flex h-10 w-full items-center rounded-lg border border-white/10 bg-dark-accent/20 px-3 py-2 text-sm text-white">
                      {user?.email}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <div className="relative">
                    <div className="flex h-10 w-full items-center rounded-lg border border-white/10 bg-dark-accent/20 px-3 py-2 text-sm text-muted-foreground">
                      Not provided
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-muted-foreground">Role</Label>
                  <div className="relative">
                    <div className="flex h-10 w-full items-center rounded-lg border border-white/10 bg-dark-accent/20 px-3 py-2 text-sm text-white capitalize">
                      {onboardingData?.onboarding_data?.role || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school" className="text-sm font-medium text-muted-foreground">School/Institution</Label>
                  <div className="relative">
                    <div className="flex h-10 w-full items-center rounded-lg border border-white/10 bg-dark-accent/20 px-3 py-2 text-sm text-white">
                      {getAcademicInfo("university")}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course" className="text-sm font-medium text-muted-foreground">Course/Department</Label>
                  <div className="relative">
                    <div className="flex h-10 w-full items-center rounded-lg border border-white/10 bg-dark-accent/20 px-3 py-2 text-sm text-white">
                      {getAcademicInfo("course")}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Academic Profile */}
        {onboardingData?.onboarding_data && (
          <motion.div variants={itemVariants}>
            <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User size={20} className="text-green-400" />
                  Academic Profile
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role-specific information */}
                {onboardingData.onboarding_data.role === "jamb" &&
                  onboardingData.onboarding_data.academic_details
                    ?.jamb_details && (
                    <>
                      <div>
                        <Label>Target Score</Label>
                        <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                          {onboardingData.onboarding_data.academic_details
                            .jamb_details.target_score || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label>JAMB Year</Label>
                        <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                          {onboardingData.onboarding_data.academic_details
                            .jamb_details.jamb_year || "N/A"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <Label>JAMB Subjects</Label>
                        <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                          {onboardingData.onboarding_data.academic_details.jamb_details.jamb_subjects?.join(
                            ", "
                          ) || "N/A"}
                        </p>
                      </div>
                    </>
                  )}

                {(onboardingData.onboarding_data.role === "undergraduate" ||
                  onboardingData.onboarding_data.role === "university" ||
                  onboardingData.onboarding_data.role === "masters") &&
                  onboardingData.onboarding_data.academic_details
                    ?.university_details && (
                    <>
                      <div>
                        <Label>Current Level</Label>
                        <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                          {onboardingData.onboarding_data.academic_details
                            .university_details.current_level || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label>Matric Number</Label>
                        <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                          {onboardingData.onboarding_data.academic_details
                            .university_details.matric_number || "N/A"}
                        </p>
                      </div>
                    </>
                  )}

                {onboardingData.onboarding_data.role === "lecturer" &&
                  onboardingData.onboarding_data.academic_details
                    ?.lecturer_details && (
                    <>
                      <div>
                        <Label>Experience</Label>
                        <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                          {onboardingData.onboarding_data.academic_details
                            .lecturer_details.experience || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label>Academic Title</Label>
                        <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                          {onboardingData.onboarding_data.academic_details
                            .lecturer_details.academic_title || "N/A"}
                        </p>
                      </div>
                    </>
                  )}

                {onboardingData.onboarding_data.role === "custom" && (
                  <>
                    <div className="md:col-span-2">
                      <Label>Learning Goal</Label>
                      <p className="mt-1 min-h-[3rem] flex items-start px-3 py-2 bg-dark-accent/20 rounded-lg border border-white/5">
                        {onboardingData.onboarding_data.custom_learning_goal ||
                          "N/A"}
                      </p>
                    </div>
                    {onboardingData.onboarding_data.academic_details
                      ?.custom_details && (
                      <>
                        <div>
                          <Label>Education Level</Label>
                          <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                            {onboardingData.onboarding_data.academic_details
                              .custom_details.education_level || "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label>Experience Level</Label>
                          <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                            {onboardingData.onboarding_data.academic_details
                              .custom_details.experience_level || "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

        {/* Security */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield size={20} className="text-orange-400" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-dark-accent/20 rounded-xl border border-white/10 hover:bg-dark-accent/30 transition-colors">
                <div className="space-y-1">
                  <div className="font-medium text-white">Password</div>
                  <div className="text-sm text-muted-foreground">
                    Last changed 30 days ago
                  </div>
                </div>
                <PasswordDialog />
              </div>
            {/* <div className="flex items-center justify-between p-4 bg-dark-accent/10 rounded-xl border border-white/5">
              <div>
                <div className="font-medium">
                  Two-Factor Authentication
                </div>
                <div className="text-sm text-dark-muted">
                  Add an extra layer of security
                </div>
              </div>
              <Switch />
            </div> */}
          </CardContent>
        </Card>
      </motion.div>

        {/* Wallet Connection */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet size={20} className="text-purple-400" />
                Wallet Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Connect your Solana wallet to access payment features, earn
                  rewards, and manage your digital assets.
                </div>
                <WalletSection />
              </div>
            </CardContent>
          </Card>
        </motion.div>

      {/* Notifications */}
      {/* <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-accent/10 rounded-xl border border-white/5">
              <div>
                <div className="font-medium">Product Updates</div>
                <div className="text-sm text-dark-muted">
                  Get notified about new features
                </div>
              </div>
              <Switch
                checked={notifications.productUpdates}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    productUpdates: checked,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-dark-accent/10 rounded-xl border border-white/5">
              <div>
                <div className="font-medium">Promotional Offers</div>
                <div className="text-sm text-dark-muted">
                  Receive special deals and discounts
                </div>
              </div>
              <Switch
                checked={notifications.promotionalOffers}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    promotionalOffers: checked,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-dark-accent/10 rounded-xl border border-white/5">
              <div>
                <div className="font-medium">Weekly Digest</div>
                <div className="text-sm text-dark-muted">
                  Summary of your activity
                </div>
              </div>
              <Switch
                checked={notifications.weeklyDigest}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({
                    ...prev,
                    weeklyDigest: checked,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div> */}

      {/* Data & Privacy */}
      {/* <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Data & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-accent/10 rounded-xl border border-white/5 hover:bg-dark-accent/20 transition-colors">
              <div>
                <div className="font-medium">Download My Data</div>
                <div className="text-sm text-dark-muted">
                  Export your data in JSON/CSV format
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 hover:border-turbo-purple/50"
              >
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div> */}

        {/* Account Actions */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-dark-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <LogOut size={20} className="text-red-400" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex max-md:flex-col md:items-center justify-between gap-4 p-4 bg-dark-accent/20 rounded-xl border border-white/10 hover:bg-dark-accent/30 transition-colors">
                <div className="space-y-1">
                  <div className="font-medium text-white">Sign Out</div>
                  <div className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  disabled={loading.signOut}
                  className="border-red-500/20 bg-red-500/10 text-red-400 hover:border-red-500/50 hover:text-red-300 hover:bg-red-500/20"
                >
                  <LogOut size={16} className="mr-2" />
                  {loading.signOut ? "Signing out..." : "Sign Out"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </TabsContent>
  );
};
