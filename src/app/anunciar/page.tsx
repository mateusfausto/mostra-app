'use client'
import { useState, useRef } from 'react'
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

const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY ?? 'seu@email.com'
const MEU_WHATSAPP = process.env.NEXT_PUBLIC_MEU_WHATSAPP ?? '5511999999999'
const TAXA = process.env.NEXT_PUBLIC_TAXA_ANUNCIO ?? '30'

export default function AnunciarPage() {
  const [step, setStep] = useState<'form' | 'moderacao'>('form')
  const [loading, setLoading] = useState(false)
  const [anuncioId, setAnuncioId] = useState('')
  const [toast, setToast] = useState({ visible: false, msg: '' })
  const [previews, setPreviews] = useState<string[]>([])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [regrasAceitas, setRegrasAceitas] = useState(false)
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    titulo: '', descricao: '', preco: '', categoria: '',
    vendedor_whatsapp: '',
  })

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleTamanho(tamanho: string) {
    setTamanhosSelecionados(prev =>
      prev.includes(tamanho)
        ? prev.filter(t => t !== tamanho)
        : [...prev, tamanho]
    )
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

  async function handleSubmit() {
    if (!form.titulo || !form.preco || !form.categoria || !form.vendedor_whatsapp) {
      showToast('⚠️ Preencha os campos obrigatórios')
      return
    }

    if (!regrasAceitas) {
      showToast('⚠️ Você deve aceitar as regras para anunciar')
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
        preco: parseFloat(form.preco),
        fotos: fotoUrls,
        tamanho: tamanhosSelecionados,
        regras_aceitas: regrasAceitas,
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
      showToast('❌ ' + msg)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ titulo:'', descricao:'', preco:'', categoria:'',
      vendedor_whatsapp:'' })
    setPreviews([])
    setPhotoFiles([])
    setAnuncioId('')
    setRegrasAceitas(false)
    setTamanhosSelecionados([])
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

            <div className="text-left space-y-2 mb-6">
              <p className="font-dm text-xs text-muted">
                ✓ Fotos verificadas
              </p>
              <p className="font-dm text-xs text-muted">
                ✓ Informações validadas
              </p>
              <p className="font-dm text-xs text-muted">
                ⏳ Aguardando confirmação de pagamento
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
      <main className="max-w-[480px] mx-auto px-4 pt-6 pb-28">
        {/* Head */}
        <div className="mb-7">
          <p className="font-dm text-[10px] tracking-[0.3em] uppercase text-gold mb-2">✦ Anuncie sua peça</p>
          <h1 className="font-cormorant text-[28px] font-light leading-tight">Junte-se à<br />vitrine da MOSTRALY!</h1>
          <p className="font-dm text-[13px] text-muted mt-2.5 leading-relaxed">
            Taxa única de publicação: <strong className="text-ink">R$ {TAXA},00</strong> por anúncio.<br />
            Sua peça fica ativa por <strong className="text-ink">30 dias</strong> pagando apenas <strong className="text-ink">R$ 1,00</strong> por dia!
          </p>
        </div>

        <div className="bg-gold/10 border border-gold/30 rounded-[2px] p-3.5 mb-5">
          <p className="font-dm text-[12px] text-muted leading-relaxed">
            <strong className="text-ink">Como funciona:</strong> Preencha e envie o formulário, pague com PIX e aguarde aprovação em até 24h.
          </p>
        </div>

        {/* Photos */}
        <div className="mb-4">
          <label className="block font-dm text-[10px] font-medium tracking-widest uppercase text-muted mb-1.5">
            Fotos da peça *
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
              <strong className="text-ink">Toque para adicionar fotos</strong><br />
              Até 6 imagens • JPG, PNG
            </p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
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
          <Input label="Preço (R$) *" type="number" value={form.preco}
            onChange={e => set('preco', e.target.value)} placeholder="0,00" min="0" step="0.01" />
          <Select label="Categoria *" value={form.categoria}
            onChange={e => set('categoria', e.target.value)} options={CATEGORIAS} />
        </div>

        {/* Descrição */}
        <div className="mb-4">
          <Textarea label="Descrição" value={form.descricao}
            onChange={e => set('descricao', e.target.value)}
            placeholder="Conte sobre a peça: tecido, estado, ocasião…" />
        </div>

        {/* Tamanho */}
        <div className="mb-6">
          <p className="font-cormorant text-[18px] font-light text-ink mb-3">Tamanho</p>
          <div className="grid grid-cols-2 gap-3">
            {['P', 'M', 'G', 'GG'].map(tam => (
              <label key={tam} className="flex items-center gap-2 p-3 border border-gold/30 rounded-[2px] cursor-pointer hover:bg-gold/5 transition-colors">
                <input
                  type="radio"
                  name="tamanho"
                  checked={tamanhosSelecionados.includes(tam)}
                  onChange={() => toggleTamanho(tam)}
                  className="w-4 h-4 cursor-pointer accent-gold"
                />
                <span className="font-dm text-[13px] font-medium text-ink">{tam}</span>
              </label>
            ))}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="mb-6">
          <Input label="Seu WhatsApp *" type="tel" value={form.vendedor_whatsapp}
            onChange={e => set('vendedor_whatsapp', e.target.value)} placeholder="(11) 99999-9999" />
        </div>

        {/* Regras e Termos */}
        <div className="mb-6">
          <div className="bg-gold/10 border border-gold/30 rounded-[2px] p-4 mb-4">
            <p className="font-cormorant text-[18px] font-light text-ink mb-3">
              Termos e Condições
            </p>
            <div className="space-y-2 mb-3">
              <p className="font-dm text-[13px] text-muted leading-relaxed">
                ✓ As peças devem estar em bom estado de conservação
              </p>
              <p className="font-dm text-[13px] text-muted leading-relaxed">
                ✓ Fotos devem ser claras e mostrar a peça corretamente
              </p>
              <p className="font-dm text-[13px] text-muted leading-relaxed">
                ✓ Descrição deve ser honesta e precisa
              </p>
              <p className="font-dm text-[13px] text-muted leading-relaxed">
                ✓ Respeitar as políticas de moderação da plataforma
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gold/5 rounded-[2px] transition-colors border border-gold/20">
            <input
              type="checkbox"
              checked={regrasAceitas}
              onChange={e => setRegrasAceitas(e.target.checked)}
              className="w-5 h-5 mt-0.5 flex-shrink-0 cursor-pointer accent-gold"
            />
            <span className="font-dm text-[13px] text-muted leading-relaxed">
              Confirmo que li e aceito os termos acima. Meu anúncio está de acordo com as políticas da plataforma.
            </span>
          </label>
        </div>

        <Button variant="dark" fullWidth className="py-4 text-[13px]"
          onClick={handleSubmit} disabled={loading || !regrasAceitas}>
          {loading ? 'Enviando…' : !regrasAceitas ? 'Aceite os termos para anunciar' : 'Enviar anúncio'}
        </Button>
      </main>
      <BottomNav />
      <Toast message={toast.msg} visible={toast.visible} />
    </>
  )
}
