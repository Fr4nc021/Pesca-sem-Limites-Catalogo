"use client";

export default function Footer() {
  return (
    <footer
      className="relative z-10 w-full border-t border-zinc-800 py-6"
      style={{ backgroundColor: "#030711" }} // Azul fosco/transparente
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-2 text-center">
          {/* Direitos reservados */}
          <p className="text-sm text-zinc-300">
            Todos os direitos reservados a Pesca Sem Limites
          </p>
          
          {/* Desenvolvido por */}
          <p className="text-xs text-zinc-600">
            Desenvolvido por CodeBy
            <span style={{ color: "#3B82F6" }}>Franco</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
