"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../../components/Header";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../hooks/useAuth";

type Arma = {
  id: string;
  nome: string;
  preco: number | null;
  foto_url: string | null;
  categoria_id: number | null;
  espec_capacidade_tiros: string | null;
  marca_id: string | null;
  calibre_id: string | null;
  calibres_id: string | null;
  marca: { nome: string } | null;
  calibre: { nome: string } | null;
  primeiraFoto?: string | null; // Primeira foto da tabela fotos_armas
};

type Marca = {
  id: string;
  nome: string;
};

type Calibre = {
  id: string;
  nome: string;
};

export default function ProdutosPorCategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const categoria = params.categoria as string;
  const categoriaId = parseInt(categoria);

  const [loading, setLoading] = useState(true);
  const { authLoading } = useAuth();
  const [armas, setArmas] = useState<Arma[]>([]);
  const [armasFiltradas, setArmasFiltradas] = useState<Arma[]>([]);
  const [nomeCategoria, setNomeCategoria] = useState<string>(`Categoria ${categoriaId}`);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [calibres, setCalibres] = useState<Calibre[]>([]);
  const [marcaSelecionada, setMarcaSelecionada] = useState<string | null>(null);
  const [calibreSelecionado, setCalibreSelecionado] = useState<string | null>(null);
  const [dropdownMarcaAberto, setDropdownMarcaAberto] = useState(false);
  const [dropdownCalibreAberto, setDropdownCalibreAberto] = useState(false);
  
  // Refs para fechar dropdowns ao clicar fora
  const marcaDropdownRef = useRef<HTMLDivElement>(null);
  const calibreDropdownRef = useRef<HTMLDivElement>(null);

  // Buscar marcas e calibres disponíveis
  useEffect(() => {
    if (authLoading) return;

    const fetchMarcas = async () => {
      const { data } = await supabase
        .from("marcas")
        .select("id, nome")
        .order("nome");
      if (data) setMarcas(data);
    };

    const fetchCalibres = async () => {
      const { data } = await supabase
        .from("calibres")
        .select("id, nome")
        .order("nome");
      if (data) setCalibres(data);
    };

    fetchMarcas();
    fetchCalibres();
  }, [authLoading]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (marcaDropdownRef.current && !marcaDropdownRef.current.contains(event.target as Node)) {
        setDropdownMarcaAberto(false);
      }
      if (calibreDropdownRef.current && !calibreDropdownRef.current.contains(event.target as Node)) {
        setDropdownCalibreAberto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    let filtradas = [...armas];

    if (marcaSelecionada) {
      filtradas = filtradas.filter((arma) => arma.marca_id === marcaSelecionada);
    }

    if (calibreSelecionado) {
      filtradas = filtradas.filter((arma) => {
        const calibreId = arma.calibre_id || arma.calibres_id;
        return calibreId === calibreSelecionado;
      });
    }

    setArmasFiltradas(filtradas);
  }, [armas, marcaSelecionada, calibreSelecionado]);

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
        setLoading(true);
        setError(null);

        // Buscar o nome da categoria primeiro
        const { data: categoriaData, error: categoriaError } = await supabase
          .from("categorias")
          .select("nome")
          .eq("id", categoriaId)
          .single();

        if (categoriaError || !categoriaData) {
          setError("Categoria não encontrada.");
          setLoading(false);
          return;
        }

        setNomeCategoria(categoriaData.nome);

        // Buscar produtos filtrados por categoria_id
        const { data: armasData, error: armasError } = await supabase
          .from("armas")
          .select("*")
          .eq("categoria_id", categoriaId)
          .order("nome");

        if (armasError) {
          console.error("Erro ao buscar produtos:", armasError);
          setError(`Erro ao carregar produtos: ${armasError.message}`);
        } else {
          // Buscar IDs das armas
          const armaIds = (armasData || []).map((a: any) => a.id);
          
          // Buscar primeira foto de cada arma (ordem 0 ou menor ordem disponível)
          let fotosMap = new Map<string, string>();
          if (armaIds.length > 0) {
            const { data: fotosData } = await supabase
              .from("fotos_armas")
              .select("arma_id, foto_url, ordem")
              .in("arma_id", armaIds)
              .order("ordem", { ascending: true });

            if (fotosData) {
              fotosData.forEach((foto: any) => {
                // Pegar apenas a primeira foto (menor ordem) de cada arma
                if (!fotosMap.has(foto.arma_id)) {
                  fotosMap.set(foto.arma_id, foto.foto_url);
                }
              });
            }
          }

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
              primeiraFoto: fotosMap.get(arma.id) || arma.foto_url || null, // Usar primeira foto da tabela fotos_armas, ou fallback para foto_url
            };
          });
          setArmas(armasFormatadas);
          setArmasFiltradas(armasFormatadas);
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

  const handleMarcaSelecionada = (marcaId: string | null) => {
    setMarcaSelecionada(marcaId);
    setDropdownMarcaAberto(false);
  };

  const handleCalibreSelecionado = (calibreId: string | null) => {
    setCalibreSelecionado(calibreId);
    setDropdownCalibreAberto(false);
  };

  const limparFiltros = () => {
    setMarcaSelecionada(null);
    setCalibreSelecionado(null);
  };

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

  const marcaSelecionadaNome = marcaSelecionada 
    ? marcas.find(m => m.id === marcaSelecionada)?.nome || "Marca"
    : "Marca";
  
  const calibreSelecionadoNome = calibreSelecionado
    ? calibres.find(c => c.id === calibreSelecionado)?.nome || "Calibre"
    : "Calibre";

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
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-white">Filtros</p>
              {(marcaSelecionada || calibreSelecionado) && (
                <button
                  onClick={limparFiltros}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
            <div className="flex gap-3">
              {/* Dropdown Marca */}
              <div className="relative" ref={marcaDropdownRef}>
                <button
                  className="flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
                  style={{ backgroundColor: "#E9B20E" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D4A00D")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E9B20E")}
                  onClick={() => {
                    setDropdownMarcaAberto(!dropdownMarcaAberto);
                    setDropdownCalibreAberto(false);
                  }}
                >
                  <span className="text-sm font-bold text-zinc-900">{marcaSelecionadaNome}</span>
                  <svg
                    className={`h-4 w-4 text-zinc-900 transition-transform ${dropdownMarcaAberto ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {dropdownMarcaAberto && (
                  <div className="absolute top-full left-0 mt-1 z-50 w-48 rounded-lg border border-zinc-700 bg-zinc-900 shadow-lg max-h-60 overflow-y-auto">
                    <button
                      onClick={() => handleMarcaSelecionada(null)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        marcaSelecionada === null
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      Todas as marcas
                    </button>
                    {marcas.map((marca) => (
                      <button
                        key={marca.id}
                        onClick={() => handleMarcaSelecionada(marca.id)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          marcaSelecionada === marca.id
                            ? "bg-zinc-800 text-white"
                            : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        {marca.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown Calibre */}
              <div className="relative" ref={calibreDropdownRef}>
                <button
                  className="flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
                  style={{ backgroundColor: "#E9B20E" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D4A00D")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E9B20E")}
                  onClick={() => {
                    setDropdownCalibreAberto(!dropdownCalibreAberto);
                    setDropdownMarcaAberto(false);
                  }}
                >
                  <span className="text-sm font-bold text-zinc-900">{calibreSelecionadoNome}</span>
                  <svg
                    className={`h-4 w-4 text-zinc-900 transition-transform ${dropdownCalibreAberto ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {dropdownCalibreAberto && (
                  <div className="absolute top-full left-0 mt-1 z-50 w-48 rounded-lg border border-zinc-700 bg-zinc-900 shadow-lg max-h-60 overflow-y-auto">
                    <button
                      onClick={() => handleCalibreSelecionado(null)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        calibreSelecionado === null
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      Todos os calibres
                    </button>
                    {calibres.map((calibre) => (
                      <button
                        key={calibre.id}
                        onClick={() => handleCalibreSelecionado(calibre.id)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          calibreSelecionado === calibre.id
                            ? "bg-zinc-800 text-white"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        {calibre.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {(!armasFiltradas || armasFiltradas.length === 0) && (
            <div className="rounded-lg border border-zinc-700/50 bg-zinc-900/30 p-8 text-center">
              <p className="text-zinc-300 mb-2">
                {marcaSelecionada || calibreSelecionado
                  ? "Nenhum produto encontrado com os filtros aplicados."
                  : "Nenhum produto encontrado para essa categoria."}
              </p>
              {(marcaSelecionada || calibreSelecionado) && (
                <button
                  onClick={limparFiltros}
                  className="mt-4 text-[#E9B20E] hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {armasFiltradas?.map((arma) => (
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