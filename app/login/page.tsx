import { Auth } from "@/components/ui/auth-form-1"

export const metadata = {
  title: "Login | FINNA - Financial Intelligence for Gig Workers",
  description: "Sign in or create your FINNA account to access your financial dashboard, income predictions, and account aggregation."
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; next?: string; error?: string }>
}) {
  const params = await searchParams
  const redirectTo = params?.redirectTo || params?.next || "/dashboard"
  const error = params?.error || null

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 bg-background selection:bg-primary/20">
      <div className="w-full max-w-md my-8">
        <Auth redirectTo={redirectTo} initialError={error} />
      </div>
    </div>
  )
}
