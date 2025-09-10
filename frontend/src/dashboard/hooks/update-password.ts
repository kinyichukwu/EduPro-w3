import { supabase } from "@/lib/supabaseClient";

export const updatePassword = async (password: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({ password })

    if (error) {
      throw new Error(error.message)
    }

    return { data, error }
  } catch (error: unknown) {
    throw new Error((error as Error).message ?? 'Failed to update password')
  }
}

export const verifyCurrentPassword = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: password
    })
    return !error
  } catch (error: unknown) {
    throw new Error((error as Error).message ?? 'Failed to verify current password')
  }
}