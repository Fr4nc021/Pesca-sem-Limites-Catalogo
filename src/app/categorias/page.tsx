"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../../components/Header";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

type Categoria = {
  id: number;
  nome: string;
};

// Mapeamento de nomes para ícones
const ICON_MAP: Record<string, string> = {
  "Pistolas": "/icons/pistola.png",
  "Revólveres": "/icons/revolver.png",
  "Espingarda_Semi": "/icons/espingardaSemi.png",
  "Espingarda_Rep": "/icons/espingardaRep.png",
  "Carabinas": "/icons/carabina.png",
  "Fuzil": "/icons/fuzil.png",
};

export default function CategoriasPage() {
  const router = useRouter();
  const { authLoading } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    if (authLoading) return;

    // Buscar categorias do banco
    const fetchCategorias = async () => {
      const { data } = await supabase
        .from("categorias")
        .select("id, nome")
        .order("nome");
      if (data) {
        setCategorias(data);
      }
    };

    fetchCategorias();
  }, [authLoading]);

  if (authLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#030711" }}
      >
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#030711" }}
    >
      <Header />

      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Botão Voltar */}
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 font-medium transition-colors"
            style={{ borderColor: "#E9B20E", color: "#E9B20E", backgroundColor: "transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(233, 178, 14, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar
          </button>

          {/* Título da seção */}
          <div className="mb-8 flex items-center gap-3">
            <svg
              className="h-8 w-8 shrink-0 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Categorias
            </h1>
          </div>

          {/* Grid de categorias */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="flex items-center gap-4 rounded-xl px-5 py-4 text-left transition-opacity hover:opacity-95"
                style={{ backgroundColor: "#E9B20E" }}
                onClick={() => router.push(`/produtos/${cat.id}`)}
              >
                {ICON_MAP[cat.nome] && (
                  <Image
                    src={ICON_MAP[cat.nome]}
                    alt={cat.nome}
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 object-contain"
                  />
                )}
                <span className="text-base font-medium text-zinc-900">
                  {cat.nome}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
