import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'

// Demonstração dos componentes base (issue #2)
export default function ComponentsShowcase() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Button</h2>
        <p className="mt-1 text-sm text-slate-600">Variantes primary e secondary.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="primary" disabled>
            Primary desabilitado
          </Button>
          <Button variant="secondary" fullWidth className="max-w-xs">
            Secondary full width
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Input</h2>
        <p className="mt-1 text-sm text-slate-600">Label e mensagem de erro.</p>
        <div className="mt-4 grid max-w-md gap-6">
          <Input label="Nome" name="demo-name" placeholder="Digite seu nome" />
          <Input
            label="Telefone"
            name="demo-phone"
            placeholder="(00) 00000-0000"
            error="Este campo é obrigatório."
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Card</h2>
        <p className="mt-1 text-sm text-slate-600">Container genérico.</p>
        <div className="mt-4 max-w-md">
          <Card>
            <p className="text-sm text-slate-700">
              Conteúdo dentro do <code className="rounded bg-slate-100 px-1">Card</code>.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
