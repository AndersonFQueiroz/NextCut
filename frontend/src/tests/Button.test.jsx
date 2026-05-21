// src/tests/Button.test.jsx
// Testes unitários do componente Button
//
// Bibliotecas usadas:
//   @testing-library/react  — renderiza componentes React no jsdom
//   @testing-library/user-event — simula interações do usuário
//   vitest                  — test runner (globals: describe, it, expect)

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../components/Button'

// describe() agrupa testes relacionados
describe('Button', () => {

  // ─── Renderização ──────────────────────────────────────────────────────────

  it('renderiza o texto passado como children', () => {
    render(<Button>Entrar na Fila</Button>)

    // getByRole encontra o botão pelo papel semântico HTML
    const button = screen.getByRole('button', { name: /entrar na fila/i })
    expect(button).toBeInTheDocument()
  })

  it('renderiza com type="button" por padrão', () => {
    render(<Button>Clique</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('renderiza com type="submit" quando informado', () => {
    render(<Button type="submit">Enviar</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  // ─── Variantes ─────────────────────────────────────────────────────────────

  it('aplica classes da variante primary por padrão', () => {
    render(<Button variant="primary">Primário</Button>)
    const button = screen.getByRole('button')

    // Verifica que a classe âmbar está presente (variante primary)
    expect(button.className).toContain('bg-amber-400')
  })

  it('aplica classes da variante secondary quando informado', () => {
    render(<Button variant="secondary">Secundário</Button>)
    const button = screen.getByRole('button')

    // Variante secondary tem bg-transparent + borda escura do painel admin
    expect(button.className).toContain('bg-transparent')
    expect(button.className).toContain('border-[#333]')
  })

  // ─── Estado disabled ───────────────────────────────────────────────────────

  it('está desabilitado quando a prop disabled é true', () => {
    render(<Button disabled>Aguarde</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('não está desabilitado por padrão', () => {
    render(<Button>Ativo</Button>)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  // ─── fullWidth ─────────────────────────────────────────────────────────────

  it('adiciona classe w-full quando fullWidth é true', () => {
    render(<Button fullWidth>Largo</Button>)
    expect(screen.getByRole('button').className).toContain('w-full')
  })

  // ─── onClick ───────────────────────────────────────────────────────────────

  it('chama onClick ao ser clicado', async () => {
    // vi.fn() cria uma função mock que registra suas chamadas
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Clique</Button>)

    // userEvent.setup() simula interação real do usuário
    await userEvent.setup().click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('não chama onClick quando está desabilitado', async () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Bloqueado</Button>)

    await userEvent.setup().click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
  })
})
