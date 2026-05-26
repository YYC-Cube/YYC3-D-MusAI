import { GlassCard } from '@/components/effects/GlassCard'
import { GlitchText } from '@/components/effects/GlitchText'
import { ParticleCanvas } from '@/components/effects/ParticleCanvas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const { actions: authActions, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    try {
      await authActions.register(formData.email, formData.username, formData.password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-purple-900/10" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/15 blur-[100px]" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

      <ParticleCanvas
        config={{
          enabled: true,
          neonIntensity: 60,
          colors: ['#7c3aed', '#6d28d9', '#8b5cf6', '#a78bfa', '#c084fc'],
          connectionDistance: 120,
          maxParticles: 40,
          minParticles: 12,
          opacity: 0.4,
        }}
        enableMouseInteraction={true}
      />

      <GlassCard className="relative w-full max-w-md z-10" hoverable={false} noReveal>
        <div className="text-center pb-2 mb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl overflow-hidden shadow-lg shadow-primary/25">
            <img src="/DXJ-02.png" alt="MusAI Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold mb-1">
            <GlitchText color="#7c3aed" intensity={0.8} interval={[5000, 12000]}>
              MusAI
            </GlitchText>
          </h1>
          <p className="text-base text-muted-foreground">注册您的缪斯智音账户</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive animate-musai-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">邮箱地址</label>
            <Input
              id="email" name="email" type="email" placeholder="your@email.com"
              value={formData.email} onChange={handleChange} required disabled={isLoading}
              className="h-11 rounded-xl bg-white/5 border-white/10 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">用户名</label>
            <Input
              id="username" name="username" type="text" placeholder="您的昵称"
              value={formData.username} onChange={handleChange} minLength={2} maxLength={50} required disabled={isLoading}
              className="h-11 rounded-xl bg-white/5 border-white/10 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">密码</label>
            <Input
              id="password" name="password" type="password" placeholder="至少6个字符"
              value={formData.password} onChange={handleChange} minLength={6} required disabled={isLoading}
              className="h-11 rounded-xl bg-white/5 border-white/10 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">确认密码</label>
            <Input
              id="confirmPassword" name="confirmPassword" type="password" placeholder="再次输入密码"
              value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading}
              className="h-11 rounded-xl bg-white/5 border-white/10 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-base font-medium musai-press bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20 transition-all"
            disabled={isLoading}
          >
            {isLoading ? '注册中...' : '注册'}
          </Button>

          <p className="text-center text-sm text-muted-foreground pt-2">
            已有账户？{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4 transition-all">
              立即登录
            </Link>
          </p>
        </form>
      </GlassCard>
    </div>
  )
}

export default RegisterPage
