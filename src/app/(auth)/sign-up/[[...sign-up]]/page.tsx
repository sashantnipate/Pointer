import { SignUp, SignUpButton } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className='flex flex-col flex-1 items-center justify-center'>
        <SignUp />
    </div>
  )
}