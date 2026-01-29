"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../../components/Header";
import { supabase } from "../../../lib/supabaseClient";

type Arma = {
  id: string;
  nome: string;
  preco: number | null;
  foto_url: string | null;
  categoria_id: number | null;
  espec_capacidade_tiros: string | null;
  marca: { nome: string } | null;
  calibre: { nome: string } | null;
};

export default function ProdutosPorCategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const categoria = params.categoria as string;
  const categoriaId = parseInt(categoria);

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [armas, setArmas] = useState<Arma[]>([]);
  const [nomeCategoria, setNomeCategoria] = useState<string>(`Categoria ${categoriaId}`);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        setAuthLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (authLoading) return;

    // Validação: verificar se o ID é um número válido
    if (isNaN(categoriaId)) {
      setError("Categoria inválida.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Buscar o nome da categoria primeiro
        const { data: categoriaData } = await supabase
          .from("categorias")
          .select("nome")
          .eq("id", categoriaId)
          .single();

        if (categoriaData) {
          setNomeCategoria(categoriaData.nome);
        }

        // Buscar produtos filtrados por categoria_id
        const { data: armasData, error: armasError } = await supabase
          .from("armas")
          .select("*")
          .eq("categoria_id", categoriaId);

        if (armasError) {
          console.error("Erro ao buscar produtos:", armasError);
          setError(`Erro ao carregar produtos: ${armasError.message}`);
        } else {
          // Buscar marcas e calibres em batch para melhor performance
          const marcaIds = [...new Set((armasData || []).map((a: any) => a.marca_id).filter(Boolean))];
          const calibreIds = [...new Set((armasData || []).map((a: any) => a.calibre_id || a.calibres_id).filter(Boolean))];

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

          const armasFormatadas = (armasData || []).map((arma: any) => {
            const calibreId = arma.calibre_id || arma.calibres_id;
            return {
              ...arma,
              marca: arma.marca_id && marcasMap.has(arma.marca_id) ? { nome: marcasMap.get(arma.marca_id) } : null,
              calibre: calibreId && calibresMap.has(calibreId) ? { nome: calibresMap.get(calibreId) } : null,
            };
          });
          setArmas(armasFormatadas);
        }
      } catch (err: any) {
        console.error("Erro:", err);
        setError(err?.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, categoriaId]);

  if (authLoading || loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#030711" }}
      >
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: "#030711" }}
      >
        <Header />
        <main className="flex-1 px-4 py-8" style={{ backgroundColor: "#030711" }}>
          <div className="mx-auto max-w-4xl">
            <p className="text-red-400">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#030711" }}
    >
      <Header />
      <main className="flex-1 px-4 py-8" style={{ backgroundColor: "#030711" }}>
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 text-3xl font-bold text-white">
            Produtos - {nomeCategoria}
          </h1>

          {/* Seção de Filtros */}
          <div className="mb-6">
            <p className="mb-3 text-sm text-white">Filtros</p>
            <div className="flex gap-3">
              <button
                className="flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
                style={{ backgroundColor: "#E9B20E" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D4A00D")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E9B20E")}
              >
                <span className="text-sm font-bold text-zinc-900">Marca</span>
                <svg
                  className="h-4 w-4 text-zinc-900"
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
              </button>
              <button
                className="flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
                style={{ backgroundColor: "#E9B20E" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D4A00D")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E9B20E")}
              >
                <span className="text-sm font-bold text-zinc-900">Calibre</span>
                <svg
                  className="h-4 w-4 text-zinc-900"
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
              </button>
            </div>
          </div>

          {(!armas || armas.length === 0) && (
            <p className="text-zinc-300">Nenhum produto encontrado para essa categoria.</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {armas?.map((arma) => (
              <div
                key={arma.id}
                className="group cursor-pointer rounded-lg border border-zinc-700 bg-zinc-900/40 p-4 text-white transition-all hover:border-zinc-600"
                onClick={() => router.push(`/produto/${arma.id}`)}
              >
                {arma.foto_url && (
                  <div className="mb-3 h-48 w-full overflow-hidden rounded">
                    <img
                      src={arma.foto_url}
                      alt={arma.nome}
                      className="h-full w-full object-cover"
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
        </div>
      </main>
    </div>
  );
}