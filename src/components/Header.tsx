import Link from 'next/link';

export default function Header() {
  return (
    <header className="
      sticky top-0 z-40
      bg-cream
      border-b border-gold/30
      px-4
    ">
      <div className="max-w-[480px] mx-auto flex items-center justify-between h-14">
        <Link href="/"
          className="font-cormorant text-xl font-light tracking-[0.18em] uppercase text-ink">
          MostraLY <span className="text-gold">!</span>
        </Link>
        <div className="flex items-center gap-3">
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_MEU_WHATSAPP || '5511999999999'}`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-center w-8 h-8 text-[#25D366] hover:text-[#20bd5a] transition-colors"
  title="Contato com a moderadora"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.527 5.84L0 24l6.335-1.652A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.84 0-3.57-.475-5.076-1.31l-.364-.215-3.762.981.999-3.648-.237-.378A9.976 9.976 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
  </svg>
</a>
          <Link href="/anunciar"
            className="
              flex items-center gap-1.5
              font-dm text-[11px] font-medium tracking-widest uppercase
              text-muted hover:text-ink transition-colors
            ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Anunciar
          </Link>
        </div>
      </div>
    </header>
  )
}
