import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl text-center mb-3 tracking-wide lowercase">admin login</h1>
        <p className="text-center text-stone-500 text-sm mb-12 lowercase">go away if you're not shaball !</p>
        <LoginForm />
      </div>
    </div>
  )
}
