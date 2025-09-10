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
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  TabsContent,
} from "@/shared/components/ui/tabs";
// import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { useGetOnboardingStatus } from "@/dashboard/hooks/useOnboarding";
import { useAuthStore } from "@/store/useAuthStore";
import PasswordDialog from "./PasswordDialog";

export const SettingsTab = () => {
  const [isEditing, setIsEditing] = useState(false);
  const user = useAuthStore((s) => s.user);
  const { data: onboardingData } = useGetOnboardingStatus();
  
  // Helper function to extract data from flexible academic_details
  const getAcademicInfo = (field: string) => {
    const academicDetails = onboardingData?.onboarding_data?.academic_details;
    if (!academicDetails) return "N/A";
    
    // Try to get from top level first
    if (academicDetails[field]) return academicDetails[field];
    
    // Try role-specific details
    const roleDetails = academicDetails.university_details || 
                       academicDetails.jamb_details || 
                       academicDetails.lecturer_details || 
                       academicDetails.custom_details;
    
    if (roleDetails && roleDetails[field]) return roleDetails[field];
    
    // Try common field mappings
    if (field === 'course') {
      return roleDetails?.current_course || 
             roleDetails?.preferred_course || 
             roleDetails?.department || "N/A";
    }
    
    if (field === 'university') {
      return roleDetails?.current_university || 
             roleDetails?.preferred_university || 
             roleDetails?.institution || "N/A";
    }
    
    return "N/A";
  };
  // const [notifications, setNotifications] = useState({
  //   productUpdates: true,
  //   promotionalOffers: false,
  //   weeklyDigest: true,
  // });

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
      {/* Personal Info */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Personal Information
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="hover:bg-turbo-purple/20"
            >
              {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                  {user?.full_name ?? "N/A"}
                </p>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                  {user?.email}
                </p>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                  N/A
                </p>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5 capitalize">
                  {onboardingData?.onboarding_data?.role || "N/A"}
                </p>
              </div>
              <div>
                <Label htmlFor="school">School/Institution</Label>
                <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                  {getAcademicInfo('university')}
                </p>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="course">Course/Department</Label>
                <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                  {getAcademicInfo('course')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Onboarding Information */}
      {onboardingData?.onboarding_data && (
        <motion.div variants={itemVariants}>
          <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Academic Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role-specific information */}
                {onboardingData.onboarding_data.role === 'jamb' && onboardingData.onboarding_data.academic_details?.jamb_details && (
                  <>
                    <div>
                      <Label>Target Score</Label>
                      <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                        {onboardingData.onboarding_data.academic_details.jamb_details.target_score || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label>JAMB Year</Label>
                      <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                        {onboardingData.onboarding_data.academic_details.jamb_details.jamb_year || "N/A"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <Label>JAMB Subjects</Label>
                      <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                        {onboardingData.onboarding_data.academic_details.jamb_details.jamb_subjects?.join(', ') || "N/A"}
                      </p>
                    </div>
                  </>
                )}
                
                {(onboardingData.onboarding_data.role === 'undergraduate' || 
                  onboardingData.onboarding_data.role === 'university' || 
                  onboardingData.onboarding_data.role === 'masters') && 
                  onboardingData.onboarding_data.academic_details?.university_details && (
                  <>
                    <div>
                      <Label>Current Level</Label>
                      <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                        {onboardingData.onboarding_data.academic_details.university_details.current_level || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label>Matric Number</Label>
                      <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                        {onboardingData.onboarding_data.academic_details.university_details.matric_number || "N/A"}
                      </p>
                    </div>
                  </>
                )}
                
                {onboardingData.onboarding_data.role === 'lecturer' && onboardingData.onboarding_data.academic_details?.lecturer_details && (
                  <>
                    <div>
                      <Label>Experience</Label>
                      <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                        {onboardingData.onboarding_data.academic_details.lecturer_details.experience || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label>Academic Title</Label>
                      <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                        {onboardingData.onboarding_data.academic_details.lecturer_details.academic_title || "N/A"}
                      </p>
                    </div>
                  </>
                )}
                
                {onboardingData.onboarding_data.role === 'custom' && (
                  <>
                    <div className="md:col-span-2">
                      <Label>Learning Goal</Label>
                      <p className="mt-1 min-h-[3rem] flex items-start px-3 py-2 bg-dark-accent/20 rounded-lg border border-white/5">
                        {onboardingData.onboarding_data.custom_learning_goal || "N/A"}
                      </p>
                    </div>
                    {onboardingData.onboarding_data.academic_details?.custom_details && (
                      <>
                        <div>
                          <Label>Education Level</Label>
                          <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                            {onboardingData.onboarding_data.academic_details.custom_details.education_level || "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label>Experience Level</Label>
                          <p className="mt-1 h-12.5 flex items-center px-3 bg-dark-accent/20 rounded-lg border border-white/5">
                            {onboardingData.onboarding_data.academic_details.custom_details.experience_level || "N/A"}
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
        <Card className="border-white/5 bg-dark-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-accent/10 rounded-xl border border-white/5">
              <div>
                <div className="font-medium">Password</div>
                <div className="text-sm text-dark-muted">
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

      {/* Danger Zone */}
      {/* <motion.div variants={itemVariants}>
        <Card className="border-red/30 bg-red/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red">
              <AlertTriangle size={20} />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex max-md:flex-col md:items-center justify-between gap-4 p-4 bg-red/10 rounded-xl border border-red/20">
              <div>
                <div className="font-medium text-red">
                  Delete Account
                </div>
                <div className="text-sm text-red/70">
                  Permanently delete your account and all data
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red text-red hover:bg-red hover:text-white"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div> */}
    </TabsContent>
  )
}