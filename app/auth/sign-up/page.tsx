import { Suspense } from 'react'

import { SignUpForm } from '@/components/auth/sign-up-form'
import { Spinner } from '@/components/ui/spinner'

function SignUpFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-gray-400">
      <Spinner className="size-8 text-emerald-400" />
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpFallback />}>
      <SignUpForm />
    </Suspense>
  )
}
