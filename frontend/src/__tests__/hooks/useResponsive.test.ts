import { useResponsive } from '@/hooks/useResponsive'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('useResponsive', () => {
  beforeEach(() => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200)
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return desktop values for large screen', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200)
    const { result } = renderHook(() => useResponsive())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(true)
    expect(result.current.albumSize).toBe(260)
  })

  it('should return tablet values for medium screen', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(800)
    const { result } = renderHook(() => useResponsive())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(true)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.albumSize).toBe(220)
  })

  it('should return mobile values for small screen', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(375)
    const { result } = renderHook(() => useResponsive())

    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.albumSize).toBe(180)
  })

  it('should update on window resize', () => {
    const { result } = renderHook(() => useResponsive())

    expect(result.current.isDesktop).toBe(true)

    act(() => {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(500)
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.isMobile).toBe(true)
    expect(result.current.isDesktop).toBe(false)
  })

  it('should calculate mobile album size correctly', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(300)
    const { result } = renderHook(() => useResponsive())

    expect(result.current.albumSize).toBe(180)
  })

  it('should cleanup event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useResponsive())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
