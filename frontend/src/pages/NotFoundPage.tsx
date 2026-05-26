import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Music, Home, Search } from 'lucide-react'

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-musai-fade-in">
      <div className="relative mb-8">
        <div className="text-[120px] sm:text-[160px] font-bold leading-none musai-gradient-text opacity-20 select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Music className="h-16 w-16 text-primary animate-musai-pulse-glow rounded-full p-3 bg-primary/10" />
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-3">页面未找到</h1>
      <p className="text-muted-foreground text-base max-w-md mb-8">
        抱歉，您访问的页面不存在或已被移除。让我们带您回到音乐的海洋吧。
      </p>

      <div className="flex gap-3">
        <Button asChild className="musai-press rounded-xl bg-gradient-to-r from-primary to-primary/80">
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            返回首页
          </Link>
        </Button>
        <Button asChild variant="outline" className="musai-press rounded-xl">
          <Link to="/discover">
            <Search className="h-4 w-4 mr-2" />
            发现音乐
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
