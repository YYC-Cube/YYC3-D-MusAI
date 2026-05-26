const CACHE_NAME = 'd-music-v1'
const STATIC_CACHE = 'd-music-static-v1'
const DYNAMIC_CACHE = 'd-music-dynamic-v1'

// 需要预缓存的静态资源
const PRECACHE_URLS = [
  '/',
  '/login',
  '/register',
  '/manifest.json',
  '/DXJ-02.png',
]

// 安装事件 - 预缓存关键资源
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] 安装')

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] 预缓存应用资源')
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => self.skipWaiting())
  )
})

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] 激活')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) =>
              name !== STATIC_CACHE && name !== DYNAMIC_CACHE
            )
            .map((name) => caches.delete(name))
        )
      })
      .then(() => self.clients.claim())
  )
})

// 拦截请求 - 缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 只处理GET请求
  if (request.method !== 'GET') return

  // Range请求(音频seek) - 直接走网络，不缓存(206 Partial Response不支持Cache API)
  if (request.headers.has('range')) return

  // 音频文件 - 网络优先，不缓存(避免206 Partial Response错误)
  if (url.pathname.match(/\.(mp3|wav|ogg|flac|aac|m4a|weba)$/i)) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    )
    return
  }

  // API请求 - 网络优先策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 成功响应缓存到动态缓存
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone))
          }
          return response
        })
        .catch(() => {
          // 网络失败时尝试从缓存返回
          return caches.match(request)
        })
    )
    return
  }

  // 静态资源 - 缓存优先策略
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|webp)$/i)
  ) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // 后台更新缓存
            fetch(request).then((response) => {
              if (response.ok) {
                caches.open(STATIC_CACHE).then((cache) => cache.put(request, response))
              }
            })
            return cachedResponse
          }

          return fetch(request).then((response) => {
            if (response.ok) {
              const responseClone = response.clone()
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone))
            }
            return response
          })
        })
    )
    return
  }

  // HTML页面 - 网络优先，缓存回退
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone))
        }
        return response
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match('/')
        })
      })
  )
})

// 消息处理 - 接收来自主线程的消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
