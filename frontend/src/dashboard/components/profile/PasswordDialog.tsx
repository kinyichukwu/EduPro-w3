import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { toast } from 'sonner'
import { Key, Eye, EyeOff } from 'lucide-react'
import { updatePassword, verifyCurrentPassword } from '@/dashboard/hooks/update-password'
import { useAuthStore } from '@/store/useAuthStore'

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Must be at least 6 characters'),
  newPassword: z.string()
    .min(6, 'Must be at least 6 characters')
    .refine(val => val !== '', 'New password is required'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(data => data.newPassword !== data.currentPassword, {
  message: "Must be different from current password",
  path: ["newPassword"],
});

function PasswordDialog() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      currentPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof passwordSchema>) => {
    toast.success("Password updated successfully")
    setLoading(true)
    try {
      const isPasswordVerified = await verifyCurrentPassword(user?.email ?? '', data.currentPassword)
      if (!isPasswordVerified) {
        setError('currentPassword', {
          type: 'manual',
          message: 'Current password is incorrect',
        })
        return
      }
      await updatePassword(data.newPassword)
      setIsPasswordDialogOpen(false)
      reset()
      toast.success("Password updated successfully")
      
    } catch (error: unknown) {
      console.error(error)
      toast('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-white/10 hover:border-turbo-purple/50"
        onClick={() => {
          setIsPasswordDialogOpen(true)
        }}
      >
        Change Password
      </Button>

      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          if (!open) setIsPasswordDialogOpen(false)
        }}
      >
        <DialogContent className="rounded-lg border border-white/10 bg-background-regular shadow-lg backdrop-blur-xl z-[100] w-full max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Key className="h-5 w-5" />
              Update Password
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Change your account password. Ensure your new password is at least
              6 characters long and different from your current password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
            <div className="space-y-1 relative">
              <div className='flex items-center justify-between'>
                <Label htmlFor="new-password" className="text-white">
                  Current Password
                </Label>
                {errors.currentPassword && (
                  <span className="text-[11px] text-red">
                    {errors.currentPassword.message}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="border-white/10 bg-white/5 text-white"
                  {...register('currentPassword')}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/20 h-7 w-7 rounded-full"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-1 relative">
              <div className='flex items-center justify-between'>
                <Label htmlFor="new-password" className="text-white">
                  New Password
                </Label>
                {errors.newPassword && (
                  <span className="text-[11px] text-red">
                    {errors.newPassword.message}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  className="border-white/10 bg-white/5 text-white"
                  {...register('newPassword')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/20 h-7 w-7 rounded-full"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-1 relative">
              <div className='flex items-center justify-between'>
                <Label htmlFor="new-password" className="text-white">
                  Confirm Password
                </Label>
                {errors.confirmPassword && (
                  <span className="text-[11px] text-red">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="border-white/10 bg-white/5 text-white"
                  {...register('confirmPassword')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/20 h-7 w-7 rounded-full"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={loading}
              className="border-white/20 bg-transparent text-sm text-white hover:bg-white/10 hover:text-white"
              onClick={() => setIsPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-turbo-purple to-turbo-indigo text-sm shadow-none hover:bg-gradient-to-r hover:from-turbo-purple/80 hover:to-turbo-indigo/80 active:bg-gradient-to-r active:from-turbo-purple/80 active:to-turbo-indigo/80 disabled:opacity-50"
              onClick={handleSubmit(onSubmit)}
            >
              {loading ? (
                'Updating...'
              ) : (
                'Update Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PasswordDialog