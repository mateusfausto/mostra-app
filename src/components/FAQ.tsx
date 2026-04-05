'use client'
import { useState } from 'react'

export function FAQ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const faqs = [
    {
      pergunta: 'Como publico um anúncio?',
      resposta: 'Clique no ícone de dúvidas no cabeçalho, acesse "Anunciar" e preencha os dados do seu item. Sua postagem entrará em análise.',
    },
    {
      pergunta: 'Quanto custa publicar?',
      resposta: `Publicar é grátis! Cobramos apenas 30% quando seu item é vendido através da plataforma.`,
    },
    {
      pergunta: 'Como recebo o pagamento?',
      resposta: 'Após a venda, o comprador entra em contato pelo WhatsApp. Você combina a forma de pagamento (PIX, dinheiro, etc).',
    },
    {
      pergunta: 'Que tipos de peças posso vender?',
      resposta: 'Vestuário em geral: vestidos, blusas, calças, casacos, saias, conjuntos e acessórios. Todas devem estar em bom estado.',
    },
    {
      pergunta: 'Meu anúncio foi rejeitado, por quê?',
      resposta: 'Pode ser: foto de má qualidade, preço desproporcionado, descrição incompleta ou item fora de categoria. Tente novamente!',
    },
    {
      pergunta: 'Posso adicionar fotos e vídeos?',
      resposta: 'Sim! Adicione múltiplas fotos e vídeos para mostrar melhor seu item. Quanto melhor a visualização, mais rápido vende.',
    },
  ]

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-cream w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-dm text-xl font-bold">Perguntas Frequentes</h2>
          <button
            onClick={onClose}
            className="text-2xl text-muted hover:text-ink transition"
          >
            ✕
          </button>
        </div>

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

        <div className="mt-8 p-4 bg-gold/10 rounded-lg border border-gold/30">
          <p className="font-dm text-sm text-ink">
            <strong>Ainda tem dúvidas?</strong> Envie uma mensagem pelo WhatsApp para a nossa moderadora.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-ink text-cream rounded-lg font-dm font-medium hover:bg-ink/90 transition"
        >
          Fechar
        </button>
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
      {showFAQ && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowFAQ(false)}
        />
      )}
    </>
  )
}
