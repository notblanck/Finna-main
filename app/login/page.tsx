import { Auth1 } from "@/components/auth/auth-1"

export const metadata = {
  title: "Login | FINNA - Financial Intelligence for Gig Workers",
  description: "Sign in with passwordless email OTP to access your financial dashboard, income predictions, and account aggregation."
}

export default function LoginPage() {
  return <Auth1 redirectTo="/dashboard" />
}
