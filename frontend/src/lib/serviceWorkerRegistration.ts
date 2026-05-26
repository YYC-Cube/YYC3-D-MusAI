const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
)

export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`

    if (isLocalhost) {
      // 本地开发环境 - 检查Service Worker是否有效
      checkValidServiceWorker(swUrl)
    } else {
      // 生产环境 - 直接注册
      registerValidSW(swUrl)
    }
  }
}

function registerValidSW(swUrl: string): void {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service Worker 注册成功:', registration.scope)

      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        
        if (installingWorker == null) return

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('新内容可用，请刷新页面')
              
              // 可以在这里显示更新提示
              onNewContentAvailable()
            } else {
              console.log('内容已缓存供离线使用')
            }
          }
        }
      }
    })
    .catch((error) => {
      console.error('Service Worker 注册失败:', error)
    })
}

function checkValidServiceWorker(swUrl: string): void {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type')
      
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Service Worker未找到，可能首次加载
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload()
          })
        })
      } else {
        registerValidSW(swUrl)
      }
    })
    .catch(() => {
      console.log('没有网络连接，应用运行在离线模式')
    })
}

function onNewContentAvailable(): void {
  // 创建自定义事件
  const event = new CustomEvent('swUpdateAvailable', {
    detail: { message: '新版本可用' },
  })
  
  window.dispatchEvent(event)

  // 可选：显示通知
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('D-Music 更新', {
      body: '新版本可用，点击刷新页面',
      icon: '/icons/icon-192x192.png',
    })
  }
}

export function unregisterServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        console.error(error.message)
      })
  }
}
