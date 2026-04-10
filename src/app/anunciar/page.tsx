'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { Button, Input, Textarea, Select, Toast } from '@/components/ui'

const CATEGORIAS = [
  { value: '', label: 'Selecione' },
  { value: 'vestido', label: 'Vestido' },
  { value: 'blusa', label: 'Blusa' },
  { value: 'calca', label: 'Calça' },
  { value: 'casaco', label: 'Casaco' },
  { value: 'saia', label: 'Saia' },
  { value: 'conjunto', label: 'Conjunto' },
  { value: 'acessorio', label: 'Acessório' },
]

const TAXA = process.env.NEXT_PUBLIC_TAXA_ANUNCIO ?? '30'

export default function AnunciarPage() {
  const [step, setStep] = useState<'form' | 'moderacao'>('form')
  const [loading, setLoading] = useState(false)
  const [anuncioId, setAnuncioId] = useState('')
  const [toast, setToast] = useState({ visible: false, msg: '' })
  const [previews, setPreviews] = useState<string[]>([])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [regrasAceitas, setRegrasAceitas] = useState(false)
  const [showTermos, setShowTermos] = useState(false)
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    titulo: '', descricao: '', preco: '', categoria: '',
    vendedor_nome: '', vendedor_sobrenome: '',
    vendedor_whatsapp: '', cidade: '', estado: '',
  })

  function set(key: string, value: string | string[]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handlePreco(raw: string) {
    // Remove tudo que não é dígito
    const digits = raw.replace(/\D/g, '')
    if (!digits) { set('preco', ''); return }
    // Converte centavos → reais
    const num = parseInt(digits, 10)
    const formatted = (num / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    set('preco', formatted)
  }

  function handleWhatsapp(raw: string) {
    // Mantém só dígitos
    let digits = raw.replace(/\D/g, '')
    // Limita a 11 dígitos (DDD + 9 dígitos)
    digits = digits.slice(0, 11)
    // Aplica máscara (XX) XXXXX-XXXX
    let masked = ''
    if (digits.length > 0) masked += '(' + digits.slice(0, 2)
    if (digits.length >= 2) masked += ') '
    if (digits.length > 2) masked += digits.slice(2, 7)
    if (digits.length > 7) masked += '-' + digits.slice(7, 11)
    set('vendedor_whatsapp', masked)
  }



  function showToast(msg: string) {
    setToast({ visible: true, msg })
    setTimeout(() => setToast({ visible: false, msg: '' }), 3000)
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    const arr = Array.from(files).slice(0, 6 - photoFiles.length) // Permitir adicionar mais até 6
    setPhotoFiles(prev => [...prev, ...arr])
    const urls = arr.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...urls])
  }

  function removePhoto(index: number) {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  function removeAllPhotos() {
    previews.forEach(url => URL.revokeObjectURL(url))
    setPhotoFiles([])
    setPreviews([])
  }

  async function handleSubmit(skipTermosCheck = false) {
    if (!form.titulo || !form.preco || !form.categoria || !form.vendedor_whatsapp || !form.cidade || !form.estado || !form.vendedor_nome.trim() || !form.vendedor_sobrenome.trim()) {
      showToast('Preencha os campos obrigatórios')
      return
    }

    if (photoFiles.length < 4) {
      showToast('Adicione ao menos 4 fotos ou vídeos')
      return
    }

    if (!skipTermosCheck && !regrasAceitas) {
      showToast('Você deve aceitar as regras para anunciar')
      return
    }

    setLoading(true)
    try {
      // 1. Upload fotos
      let fotoUrls: string[] = []
      if (photoFiles.length) {
        const fd = new FormData()
        photoFiles.forEach(f => fd.append('files', f))
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!upRes.ok) {
          const upErr = await upRes.json()
          throw new Error(`Erro ao fazer upload: ${upErr.error}`)
        }
        const upData = await upRes.json()
        fotoUrls = upData.urls ?? []
      }

      // 2. Create anuncio
      const payload = {
        ...form,
        preco: parseFloat(form.preco.replace(/\./g, '').replace(',', '.')),
        fotos: fotoUrls,
        tamanho: tamanhoSelecionado,
        regras_aceitas: skipTermosCheck || regrasAceitas,
      }

      console.log('[ANUNCIO SUBMIT] Enviando:', payload)

      const res = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setAnuncioId(data.id)
      setStep('moderacao')
      window.scrollTo(0, 0)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao enviar anúncio'
      console.error('[ANUNCIO ERROR]', msg, e)
      showToast(msg)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ titulo:'', descricao:'', preco:'', categoria:'',
      vendedor_nome:'', vendedor_sobrenome:'',
      vendedor_whatsapp:'', cidade:'', estado:'' })
    setPreviews([])
    setPhotoFiles([])
    setAnuncioId('')
    setRegrasAceitas(false)
    setTamanhoSelecionado('')
    setStep('form')
  }

  if (step === 'moderacao') {
    return (
      <>
        <Header />
        <main className="max-w-[480px] mx-auto px-4 pt-8 pb-28">
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="font-cormorant text-2xl font-light mb-2">Anúncio recebido!</h2>
            <p className="font-dm text-sm text-muted mb-6">
              ID do anúncio: <strong className="text-ink">#{anuncioId.slice(-6).toUpperCase()}</strong>
            </p>

            <div className="bg-gold/10 border border-gold/30 rounded-[2px] p-4 mb-6 text-left">
              <p className="font-dm text-[13px] text-ink leading-relaxed mb-0">
                Seu anúncio será analisado pela nossa equipe de moderação. 
              </p>
              <p className="font-dm text-[12px] text-muted mt-2 mb-0">
                Em breve entraremos em contato com você via WhatsApp para confirmar o pagamento e ativar sua peça na vitrine!
              </p>
            </div>           

            <Button variant="dark" fullWidth onClick={resetForm}>
              Fazer outro anúncio
            </Button>
          </div>
        </main>
        <BottomNav />
        <Toast message={toast.msg} visible={toast.visible} />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pb-28">
        {/* Hero Section */}
        <section className="bg-ink relative overflow-hidden px-4 pt-12 pb-9">
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(201,169,110,0.15) 0%, transparent 70%)' }}
          />
          <div className="max-w-[480px] mx-auto relative">
            <p className="font-dm text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
              ✦ Crie seu anúncio
            </p>
            <h1 className="font-cormorant text-5xl font-light leading-[1.08] text-cream">
              Sua peça<br />encontrará o{' '}
              <em className="italic text-gold-light">lar ideal</em>
            </h1>
            <p className="mt-4 font-dm text-[13px] font-light leading-relaxed text-cream/60 max-w-[280px]">
              Taxa única de publicação de <strong className="text-gold">R$ {TAXA},00</strong> e sua peça fica ativa por <strong className="text-gold">30 dias</strong>. <br />
              Na prática é sua peça em nossa vitrine por <strong className="text-gold">R$ 1,00</strong> ao dia!
            </p>
          </div>
        </section>

        {/* Form Container */}
        <div className="max-w-[480px] mx-auto px-4">
          {/* Info Box */}
          <div className="bg-gold/10 border border-gold/30 rounded-[2px] p-3.5 mb-5 mt-6">
            <p className="font-dm text-[12px] text-muted leading-relaxed">
              <strong className="text-ink">Como funciona:</strong> Preencha todos os dados, coloque fotos e pelo menos 1 vídeo da peça, envie o anúncio e aguarde. Entraremos em contato o mais rápido possível.
            </p>
          </div>

        {/* Photos & Videos */}
        <div className="mb-4">
          <label className="block font-dm text-[10px] font-medium tracking-widest uppercase text-muted mb-1.5">
            Fotos e vídeos da peça *
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gold/40 rounded-[2px] p-8 text-center
              cursor-pointer hover:border-gold hover:bg-gold/5 transition-all bg-gold/[0.03]"
            >
            <svg className="text-gold mx-auto mb-2.5" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <p className="font-dm text-[13px] text-muted leading-relaxed">
              <strong className="text-ink">Toque para adicionar fotos e vídeos</strong><br />
              Mínimo 4, máximo 6 arquivos • JPG, PNG, MP4, MOV
            </p>
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden"
            onChange={e => handleFiles(e.target.files)} />
          {previews.length > 0 && (
            <div>
              <div className="flex gap-2 flex-wrap mt-2.5">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-[72px] h-[72px] rounded-[2px] overflow-visible border border-black/10">
                    <Image src={src} alt={`foto ${i+1}`} fill className="object-cover rounded-[2px]" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-sm font-bold
                        rounded-full shadow-lg transition-all hover:scale-110 border border-red-600"
                      title="Remover foto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={removeAllPhotos}
                className="mt-2 text-xs font-dm text-red-500 hover:text-red-600 underline"
              >
                Excluir todas as fotos
              </button>
            </div>
          )}
        </div>

        {/* Título */}
        <div className="mb-4">
          <Input label="Título *" value={form.titulo} onChange={e => set('titulo', e.target.value)}
            placeholder="Ex: Vestido floral midi azul" maxLength={80} />
        </div>

        {/* Preço + Categoria */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Input label="Preço (R$) *" type="text" inputMode="numeric" value={form.preco}
            onChange={e => handlePreco(e.target.value)} placeholder="0,00" />
          <Select label="Categoria *" value={form.categoria}
            onChange={e => set('categoria', e.target.value)} options={CATEGORIAS} />
        </div>

        {/* Cidade + Estado */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Input label="Cidade *" value={form.cidade}
            onChange={e => set('cidade', e.target.value)} placeholder="Digite sua cidade" />
          <Input label="Estado *" value={form.estado}
            onChange={e => set('estado', e.target.value)} placeholder="Digite seu estado" maxLength={2} />
        </div>

        {/* Descrição */}
        <div className="mb-4">
          <Textarea label="Descrição" value={form.descricao}
            onChange={e => set('descricao', e.target.value)}
            placeholder="Conte sobre a peça: tecido, estado, ocasião…" />
        </div>

        {/* Tamanho */}
        <div className="mb-6">
          <p className="font-dm text-[10px] font-medium tracking-widest uppercase text-muted mb-3">Tamanho</p>
          <div className="grid grid-cols-3 gap-2">
            {['PP', 'P', 'M', 'G', 'GG', 'XG', '36', '38', '40', '42', '44', '46'].map(tam => (
              <label key={tam} className={`flex items-center justify-center p-3 border rounded-[2px] cursor-pointer transition-all ${
                tamanhoSelecionado === tam
                  ? 'border-dark bg-gold/40 text-dark font-medium'
                  : 'border-gold/30 hover:bg-gold/5 text-ink'
              }`}>
                <input
                  type="radio"
                  name="tamanho"
                  checked={tamanhoSelecionado === tam}
                  onChange={() => setTamanhoSelecionado(tam)}
                  className="hidden"
                />
                <span className="font-dm text-[13px] font-medium">{tam}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nome e Sobrenome */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Input label="Nome *" value={form.vendedor_nome}
            onChange={e => set('vendedor_nome', e.target.value)} placeholder="Seu nome" maxLength={50} />
          <Input label="Sobrenome *" value={form.vendedor_sobrenome}
            onChange={e => set('vendedor_sobrenome', e.target.value)} placeholder="Seu sobrenome" maxLength={50} />
        </div>

        {/* WhatsApp */}
        <div className="mb-4">
          <Input label="Seu WhatsApp *" type="tel" value={form.vendedor_whatsapp}
            onChange={e => handleWhatsapp(e.target.value)} placeholder="(21) 99999-9999" maxLength={15} />
        </div>

        {/* Termos e Envio */}
        <div className="mb-6">
          {regrasAceitas ? (
            loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-ink mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-dm text-[13px] text-muted">Enviando seu anúncio...</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-[2px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-600 flex-shrink-0">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span className="font-dm text-[13px] text-green-700">Termos aceitos</span>
                <button onClick={() => { setRegrasAceitas(false); setShowTermos(true) }}
                  className="ml-auto font-dm text-[11px] text-green-600 underline">Rever termos</button>
              </div>
            )
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!form.titulo || !form.preco || !form.categoria || !form.vendedor_whatsapp || !form.cidade || !form.estado || !form.vendedor_nome.trim() || !form.vendedor_sobrenome.trim()) {
                  showToast('Preencha os campos obrigatórios antes de prosseguir')
                  return
                }
                if (photoFiles.length < 4) {
                  showToast('Adicione ao menos 4 fotos ou vídeos')
                  return
                }
                setShowTermos(true)
              }}
              className="w-full py-4 bg-ink text-cream rounded-[2px]
                font-dm text-[13px] font-medium tracking-wider uppercase
                hover:bg-ink/90 transition-colors"
            >
              Ler termos e enviar anúncio
            </button>
          )}
        </div>

        </div>
      </main>

      {/* Modal de Termos e Condições */}
      {showTermos && <TermosModal
        regrasAceitas={regrasAceitas}
        onAccept={() => { setRegrasAceitas(true); setShowTermos(false) }}
        onClose={() => setShowTermos(false)}
        onSubmit={() => { setRegrasAceitas(true); setShowTermos(false); setTimeout(() => handleSubmit(true), 100) }}
        loading={loading}
      />}

      <BottomNav />
      <Toast message={toast.msg} visible={toast.visible} />
    </>
  )
}

// ==================== Modal de Termos e Condições ====================

function TermosModal({ regrasAceitas, onAccept, onClose, onSubmit, loading }: {
  regrasAceitas: boolean
  onAccept: () => void
  onClose: () => void
  onSubmit: () => void
  loading: boolean
}) {
  const [aceito, setAceito] = useState(regrasAceitas)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const MostraLY = () => (
    <span className="font-cormorant tracking-[0.18em] uppercase">MostraLY<span className="text-gold">!</span></span>
  )

  const termos = [
    {
      titulo: 'Natureza da plataforma',
      texto: <>Declaro que compreendo que a <MostraLY /> é uma vitrine de classificados e não uma loja, marketplace ou intermediadora de vendas. A <MostraLY /> não compra, vende, guarda, envia ou garante nenhuma peça anunciada.</>,
    },
    {
      titulo: 'Taxa de publicação, não comissão',
      texto: 'Declaro que o valor pago (R\u00a0$\u00a030,00) é uma taxa de publicação pelo serviço de exibição do anúncio por 30 dias, e não uma comissão sobre venda. O pagamento não garante que a peça será vendida.',
    },
    {
      titulo: 'Responsabilidade pelo conteúdo',
      texto: 'Declaro que sou o legítimo proprietário da peça anunciada e que todas as informações fornecidas — fotos, descrição, preço, medidas e tamanho — são verdadeiras. Assumo total responsabilidade civil e criminal pelo conteúdo publicado.',
    },
    {
      titulo: 'Negociação direta',
      texto: <>Declaro que entendo que toda negociação, combinação de pagamento, entrega e troca ocorre exclusivamente entre mim e o comprador, via WhatsApp ou outro canal de minha escolha, sem qualquer participação ou responsabilidade da <MostraLY />.</>,
    },
    {
      titulo: 'Proibição de conteúdo ilícito',
      texto: <>Declaro que não estou anunciando produtos falsificados, roubados, furtados, ou que violem direitos autorais, marcas registradas ou qualquer legislação vigente. Estou ciente de que a <MostraLY /> pode remover o anúncio a qualquer momento em caso de suspeita de irregularidade, sem devolução da taxa paga.</>,
    },
    {
      titulo: 'Identificação',
      texto: <>Declaro que meu nome, sobrenome e o número de WhatsApp informados são reais, e podem ser usados para identificação em caso de necessidade legal. Estou ciente de que a <MostraLY /> poderá fornecer meus dados às autoridades competentes mediante ordem judicial.</>,
    },
    {
      titulo: 'LGPD — Dados pessoais',
      texto: <>Declaro que li e aceito a Política de Privacidade da <MostraLY />. Autorizo o armazenamento do meu número de WhatsApp e das fotos enviadas exclusivamente para fins de publicação do anúncio. Sei que posso solicitar a exclusão dos meus dados a qualquer momento pelo canal de contato da plataforma, nos termos da Lei nº 13.709/2018 (LGPD).</>,
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-cream w-full max-w-md rounded-2xl flex flex-col max-h-[80vh]">
        {/* Header fixo */}
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0 border-b border-gold/20">
          <h2 className="font-cormorant text-xl font-light text-ink">Termos e Condições</h2>
          <button onClick={onClose} className="text-2xl text-muted hover:text-ink transition">✕</button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="overflow-y-auto overscroll-contain px-6 py-5 flex-1 min-h-0">
          <div className="space-y-5">
            {termos.map((t, i) => (
              <div key={i}>
                <h3 className="font-dm text-[13px] font-semibold text-ink mb-1.5">{t.titulo}</h3>
                <p className="font-dm text-[12px] text-muted leading-relaxed">{t.texto}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer fixo: checkbox + botão */}
        <div className="p-6 pt-4 flex-shrink-0 border-t border-gold/20">
          <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gold/5 rounded-[2px] transition-colors border border-gold/20 mb-4">
            <input
              type="checkbox"
              checked={aceito}
              onChange={e => setAceito(e.target.checked)}
              className="w-5 h-5 mt-0.5 flex-shrink-0 cursor-pointer accent-gold"
            />
            <span className="font-dm text-[12px] text-muted leading-relaxed">
              Declaro que li, compreendi e aceito integralmente todos os termos acima.
            </span>
          </label>

          <button
            onClick={() => { if (aceito) onSubmit() }}
            disabled={!aceito || loading}
            className={`w-full py-4 rounded-[2px] font-dm text-[13px] font-medium tracking-wider uppercase transition-colors ${
              aceito && !loading
                ? 'bg-ink text-cream hover:bg-ink/90'
                : 'bg-ink/30 text-cream/50 cursor-not-allowed'
            }`}
          >
            {loading ? 'Enviando…' : 'Aceitar termos e condições'}
          </button>
        </div>
      </div>
    </div>
  )
}
