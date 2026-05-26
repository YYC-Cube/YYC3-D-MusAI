import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { Music, Sparkles } from 'lucide-react'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { actions: authActions, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await authActions.login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />

      <Card className="relative w-full max-w-md border-0 shadow-2xl shadow-primary/5 animate-musai-scale-in">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 animate-musai-pulse-glow">
            <Music className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            <span className="musai-gradient-text">MusAI</span>
          </CardTitle>
          <CardDescription className="text-base mt-1">
            缪斯智音 · 登录您的账户
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive animate-musai-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                邮箱地址
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 rounded-xl transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 rounded-xl transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-base font-medium musai-press bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  登录中...
                </span>
              ) : (
                '登录'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              还没有账户？{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline underline-offset-4 transition-all">
                立即注册
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
