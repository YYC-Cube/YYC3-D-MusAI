import { Slider } from '@/components/ui/slider'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('Slider Component', () => {
  it('should render slider with default value', () => {
    render(<Slider defaultValue={[50]} />)
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('should call onValueChange when value changes', () => {
    const handleChange = vi.fn()
    render(<Slider defaultValue={[0]} onValueChange={handleChange} />)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '75' } })

    expect(handleChange).toHaveBeenCalledWith([75])
  })

  it('should render with custom className', () => {
    const { container } = render(<Slider className="custom-slider" />)
    expect(container.firstChild).toHaveClass('custom-slider')
  })

  it('should support controlled value', () => {
    const { rerender } = render(<Slider value={[30]} />)
    expect(screen.getByRole('slider')).toHaveValue('30')

    rerender(<Slider value={[60]} />)
    expect(screen.getByRole('slider')).toHaveValue('60')
  })
})
