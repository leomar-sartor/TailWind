type Props = {
  src: string
}

export function AuthImage({ src }: Props) {
  return (
    <div
      className="relative w-full h-screen overflow-hidden"
    >
      {/* IMAGEM */}
      <img
        src={src}
        className="absolute inset-0 w-[110%] h-[110%] object-cover transition-transform duration-200"
      />

      {/* OVERLAY ESCURO */}
      <div className="absolute inset-0 bg-black/8" />

      {/* GRADIENTE */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

      {/* TEXTO */}
      <div className="absolute bottom-16 left-16 max-w-md text-white">
        <h2 className="text-3xl font-semibold mb-4">
          Gestão e controle inteligente para seu negócio
        </h2>

        <p className="text-white/80">
          Centralize dados, reduza riscos e acompanhe suas operações com
          precisão.
        </p>
      </div>
    </div>
  )
}