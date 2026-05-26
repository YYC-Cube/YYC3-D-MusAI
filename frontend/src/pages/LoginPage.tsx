import { GlassCard } from '@/components/effects/GlassCard'
import { GlitchText } from '@/components/effects/GlitchText'
import { ParticleCanvas } from '@/components/effects/ParticleCanvas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/15 blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

      <ParticleCanvas
        config={{
          enabled: true,
          neonIntensity: 70,
          colors: ['#7c3aed', '#6d28d9', '#8b5cf6', '#a78bfa', '#c084fc'],
          connectionDistance: 130,
          maxParticles: 45,
          minParticles: 15,
          opacity: 0.5,
        }}
        enableMouseInteraction={true}
      />

      <GlassCard className="relative w-full max-w-md z-10" hoverable={false} noReveal>
        <div className="text-center pb-2 mb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl overflow-hidden shadow-lg shadow-primary/25">
            <img src="/DXJ-02.png" alt="MusAI Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold mb-1">
            <GlitchText color="#7c3aed" intensity={0.8} interval={[4000, 10000]}>
              MusAI
            </GlitchText>
          </h1>
          <p className="text-base text-muted-foreground">
            缪斯智音 · 登录您的账户
          </p>
        </div>

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
              className="h-11 rounded-xl bg-white/5 border-white/10 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
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
              className="h-11 rounded-xl bg-white/5 border-white/10 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-base font-medium musai-press bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20 transition-all"
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

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-muted-foreground">开发模式</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl text-base font-medium border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            onClick={() => navigate('/')}
          >
            👻 幽灵模式 · 免登录进入
          </Button>
        </form>
      </GlassCard>
    </div>
  )
}

export default LoginPage
