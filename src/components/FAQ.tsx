'use client'
import { useState, useEffect } from 'react'

export function FAQ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Bloquear scroll da página quando a modal está aberta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const faqs = [
    {
      pergunta: 'O que é o MostraLY?',
      resposta: 'O MostraLY é uma vitrine digital de moda onde você pode anunciar e vender roupas, acessórios e calçados de forma prática e segura. Nosso foco é conectar vendedores e compradores com curadoria de qualidade.',
    },
    {
      pergunta: 'Como publico um anúncio?',
      resposta: 'Toque em "Anunciar" no menu inferior, preencha as informações do item (fotos, título, preço, descrição, tamanho, etc.), aceite os termos e envie. Seu anúncio passará por uma curadoria antes de ser publicado.',
    },
    {
      pergunta: 'Quanto custa anunciar?',
      resposta: 'A taxa de anúncio é de R$ 30,00 por peça publicada. Essa taxa garante que seu item fique em destaque na vitrine com curadoria de qualidade. Não há comissão sobre a venda.',
    },
    {
      pergunta: 'O que é a curadoria?',
      resposta: 'Toda peça enviada passa por uma análise da nossa equipe. Verificamos qualidade das fotos, descrição, estado do item e adequação ao estilo da plataforma. Isso garante uma experiência premium para compradores e vendedores.',
    },
    {
      pergunta: 'Como funciona a venda?',
      resposta: 'Quando um comprador se interessa pelo seu item, ele entra em contato diretamente pelo seu WhatsApp. Vocês combinam forma de pagamento (PIX, dinheiro, etc.) e entrega/retirada entre si.',
    },
    {
      pergunta: 'Meu anúncio foi rejeitado. O que fazer?',
      resposta: 'Os motivos mais comuns são: fotos com baixa qualidade ou iluminação ruim, descrição incompleta, preço incompatível com o mercado ou item fora das categorias aceitas. Corrija os pontos e envie novamente!',
    },
    {
      pergunta: 'Posso enviar fotos e vídeos?',
      resposta: 'Sim! Você pode adicionar até 5 fotos e 1 vídeo de até 30 segundos. Quanto melhor a apresentação visual, maiores as chances de venda. Dica: use luz natural e fundo neutro.',
    },
    {
      pergunta: 'Quais tipos de peças são aceitas?',
      resposta: 'Aceitamos vestuário feminino e masculino (vestidos, blusas, calças, casacos, saias, conjuntos), calçados e acessórios (bolsas, bijuterias, cintos). Todas as peças devem estar em bom estado de conservação.',
    },
    {
      pergunta: 'Como recebo meu pagamento?',
      resposta: 'A negociação é feita diretamente entre vendedor e comprador via WhatsApp. Você combina a forma de pagamento que preferir (PIX, transferência, dinheiro na retirada). O MostraLY não intermedia pagamentos.',
    },
    {
      pergunta: 'Meu WhatsApp fica visível para todos?',
      resposta: 'Seu WhatsApp só aparece para compradores interessados quando eles clicam no botão de contato dentro do anúncio. Seus dados são armazenados de forma segura no nosso banco de dados.',
    },
  ]

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-cream w-full max-w-md rounded-2xl flex flex-col max-h-[75vh]">
        {/* Header fixo */}
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <h2 className="font-dm text-xl font-bold">Perguntas Frequentes</h2>
          <button
            onClick={onClose}
            className="text-2xl text-muted hover:text-ink transition"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="overflow-y-auto overscroll-contain px-6 pb-6 flex-1 min-h-0">
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group border border-gold/30 rounded-lg p-4 cursor-pointer hover:bg-warm/30 transition"
              >
                <summary className="font-dm font-medium text-ink list-none flex items-center justify-between">
                  {faq.pergunta}
                  <span className="text-gold group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="font-dm text-sm text-muted mt-3 leading-relaxed">{faq.resposta}</p>
              </details>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gold/10 rounded-lg border border-gold/30">
            <p className="font-dm text-sm text-ink">
              <strong>Ainda tem dúvidas?</strong> Envie uma mensagem pelo WhatsApp para a nossa moderadora.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FAQButton() {
  const [showFAQ, setShowFAQ] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowFAQ(true)}
        className="flex items-center justify-center w-8 h-8 text-ink hover:text-gold transition-colors"
        title="Perguntas Frequentes"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
        </svg>
      </button>
      <FAQ isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
    </>
  )
}
