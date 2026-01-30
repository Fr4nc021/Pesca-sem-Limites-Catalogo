"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { supabase } from "../../../src/lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

type ArmaDestaque = {
  id: string;
  nome: string;
  preco: number | null;
  foto_url: string | null;
  categoria_id: number | null;
  marca_id: string | null;
  calibres_id: string | null;
  espec_capacidade_tiros: string | null;
  marca?: { nome: string } | null;
  calibre?: { nome: string } | null;
  primeiraFoto?: string | null;
};

export default function Dashboard() {
  const router = useRouter();
  const { authLoading } = useAuth();
  const [armasDestaque, setArmasDestaque] = useState<ArmaDestaque[]>([]);
  const [loadingDestaques, setLoadingDestaques] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const fetchDestaques = async () => {
      try {
        setLoadingDestaques(true);
        // Buscar armas em destaque
        const { data: armasData, error: armasError } = await supabase
          .from("armas")
          .select("*")
          .eq("em_destaque", true)
          .limit(8); // Limitar a 8 produtos em destaque

        if (armasError) {
          console.error("Erro ao buscar destaques:", armasError);
          return;
        }

        if (!armasData || armasData.length === 0) {
          setArmasDestaque([]);
          setLoadingDestaques(false);
          return;
        }

        // Buscar IDs das armas
        const armaIds = armasData.map((a: any) => a.id);
        
        // Buscar primeira foto de cada arma
        let fotosMap = new Map<string, string>();
        if (armaIds.length > 0) {
          const { data: fotosData } = await supabase
            .from("fotos_armas")
            .select("arma_id, foto_url, ordem")
            .in("arma_id", armaIds)
            .order("ordem", { ascending: true });

          if (fotosData) {
            fotosData.forEach((foto: any) => {
              if (!fotosMap.has(foto.arma_id)) {
                fotosMap.set(foto.arma_id, foto.foto_url);
              }
            });
          }
        }

        // Buscar marcas e calibres
        const marcaIds = [...new Set(armasData.map((a: any) => a.marca_id).filter(Boolean))];
        const calibreIds = [...new Set(armasData.map((a: any) => a.calibre_id || a.calibres_id).filter(Boolean))];

        const [marcasResult, calibresResult] = await Promise.all([
          marcaIds.length > 0
            ? supabase.from("marcas").select("id, nome").in("id", marcaIds)
            : { data: [], error: null },
          calibreIds.length > 0
            ? supabase.from("calibres").select("id, nome").in("id", calibreIds)
            : { data: [], error: null },
        ]);

        const marcasMap = new Map((marcasResult.data || []).map((m: any) => [m.id, m.nome]));
        const calibresMap = new Map((calibresResult.data || []).map((c: any) => [c.id, c.nome]));

        const armasFormatadas = armasData.map((arma: any) => {
          const calibreId = arma.calibre_id || arma.calibres_id;
          return {
            ...arma,
            marca: arma.marca_id && marcasMap.has(arma.marca_id) ? { nome: marcasMap.get(arma.marca_id) } : null,
            calibre: calibreId && calibresMap.has(calibreId) ? { nome: calibresMap.get(calibreId) } : null,
            primeiraFoto: fotosMap.get(arma.id) || arma.foto_url || null,
          };
        });

        setArmasDestaque(armasFormatadas);
      } catch (err: any) {
        console.error("Erro ao buscar destaques:", err);
      } finally {
        setLoadingDestaques(false);
      }
    };

    fetchDestaques();
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
    <div className="relative flex min-h-screen flex-col">
      {/* Background Image with Dark Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/fundo/desktop.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(3, 7, 17, 0.85)", // Overlay escuro sobre a imagem
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-8 text-center">
        {/* Premium Badge */}
        <div
          className="flex items-center gap-2 rounded-full border bg-zinc-800/50 px-4 py-2"
          style={{ borderColor: "rgba(233, 178, 14, 0.5)" }}
        >
          <svg
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            style={{ color: "#E9B20E" }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium" style={{ color: "#E9B20E" }}>
            Catalogo 2026
          </span>
        </div>

        {/* Main Headline */}
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            Excelência em
          </h1>
          <h1
            className="text-5xl font-bold leading-tight md:text-6xl lg:text-7xl"
            style={{ color: "#E9B20E" }}
          >
            Armamento de alta
          </h1>
          <h1 className="text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
          qualidade
          </h1>
        </div>

        {/* Descriptive Paragraph */}
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-300 md:text-xl">
          Descubra nossa coleção exclusiva de armas de fogo com a mais alta
          qualidade, precisão incomparável e design sofisticado.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => router.push("/categorias")}
            className="flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-base font-bold text-black transition-colors"
            style={{ backgroundColor: "#E9B20E" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#D4A00D")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#E9B20E")
            }
          >
            Explorar Catálogo
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        </div>
        </div>

        {/* Modelos em Destaque Section */}
        {armasDestaque.length > 0 && (
          <section className="w-full px-4 py-16">
          <div className="container mx-auto flex flex-col items-center gap-6 text-center mb-12">
            {/* Destaques Badge */}
            <div
              className="flex items-center justify-center rounded-full border px-4 py-2"
              style={{
                borderColor: "rgba(233, 178, 14, 0.5)",
                backgroundColor: "rgba(15, 23, 42, 0.5)",
              }}
            >
              <span className="text-sm font-medium" style={{ color: "#E9B20E" }}>Destaques</span>
            </div>

            {/* Main Title */}
            <h2 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Modelos em Destaque
            </h2>

            {/* Subtitle */}
            <p className="max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
              Conheça os modelos mais procurados da nossa coleção premium
            </p>
          </div>

          {/* Grid de Produtos em Destaque */}
          <div className="container mx-auto">
            {loadingDestaques ? (
              <div className="text-center text-white py-12">Carregando destaques...</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {armasDestaque.map((arma) => (
                  <div
                    key={arma.id}
                    className="group cursor-pointer rounded-lg border border-zinc-700 bg-zinc-900/40 p-4 text-white transition-all hover:border-zinc-600"
                    onClick={() => router.push(`/produto/${arma.id}`)}
                  >
                    {(arma.primeiraFoto || arma.foto_url) && (
                      <div className="mb-3 h-48 w-full overflow-hidden rounded">
                        <img
                          src={arma.primeiraFoto || arma.foto_url || ""}
                          alt={arma.nome}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}

                    {arma.marca && (
                      <p className="mb-1 text-sm text-zinc-400">{arma.marca.nome}</p>
                    )}

                    <h2 className="mb-2 text-lg font-semibold text-white">{arma.nome}</h2>

                    {/* Especificações */}
                    <div className="mb-3 flex flex-wrap gap-1 text-sm text-zinc-400">
                      {arma.calibre && <span>{arma.calibre.nome}</span>}
                      {arma.calibre && arma.espec_capacidade_tiros && <span>•</span>}
                      {arma.espec_capacidade_tiros && (
                        <span>{arma.espec_capacidade_tiros} tiros</span>
                      )}
                    </div>

                    {/* Preço com seta */}
                    <div className="flex items-center justify-between">
                      {arma.preco != null && (
                        <p className="font-bold text-[#E9B20E]">
                          R$ {parseFloat(arma.preco.toString()).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      )}
                      <svg
                        className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        )}
        
        {/* Footer - Logo abaixo dos Modelos em Destaque */}
        <Footer />
      </div>
    </div>
  );
}

