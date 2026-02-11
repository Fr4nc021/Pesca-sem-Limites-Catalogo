"use client";

import { useEffect, useState, useRef } from "react";
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
  const [armas, setArmas] = useState<Arma[]>([]);
  const [armasFiltradas, setArmasFiltradas] = useState<Arma[]>([]);
  const [nomeCategoria, setNomeCategoria] = useState<string>(`Categoria ${categoriaId}`);
  const [error, setError] = useState<string | null>(null);
  const [minPrecoPorArma, setMinPrecoPorArma] = useState<Map<string, number>>(new Map()); 
  const [calibresPorArma, setCalibresPorArma] = useState<Map<string, Set<string>>>(new Map()); // Mapa de arma_id -> Set de calibre_ids (das variações)

  
  // Estados para filtros
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [calibres, setCalibres] = useState<Calibre[]>([]);
  const [marcaSelecionada, setMarcaSelecionada] = useState<string | null>(null);
  const [calibreSelecionado, setCalibreSelecionado] = useState<string | null>(null);
  const [filtroNome, setFiltroNome] = useState<string>("");
  const [dropdownMarcaAberto, setDropdownMarcaAberto] = useState(false);
  const [dropdownCalibreAberto, setDropdownCalibreAberto] = useState(false);
  
  // Refs para fechar dropdowns ao clicar fora
  const marcaDropdownRef = useRef<HTMLDivElement>(null);
  const calibreDropdownRef = useRef<HTMLDivElement>(null);

  // Buscar marcas e calibres disponíveis
  useEffect(() => {
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
  }, []);

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
        // Verificar calibre da arma principal
        const calibreId = arma.calibre_id || arma.calibres_id;
        if (calibreId === calibreSelecionado) {
          return true;
        }
        
        // Verificar se alguma variação da arma tem o calibre selecionado
        const calibresVariacoes = calibresPorArma.get(arma.id);
        if (calibresVariacoes && calibresVariacoes.has(calibreSelecionado)) {
          return true;
        }
        
        return false;
      });
    }

    if (filtroNome) {
      filtradas = filtradas.filter((arma) => 
        (arma.nome || "").toLowerCase().includes(filtroNome.toLowerCase())
      );
    }

    setArmasFiltradas(filtradas);
  }, [armas, marcaSelecionada, calibreSelecionado, filtroNome, calibresPorArma]);

  useEffect(() => {
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

        // Buscar categoria e armas em paralelo
        const [categoriaResult, armasResult] = await Promise.all([
          supabase
            .from("categorias")
            .select("nome")
            .eq("id", categoriaId)
            .single(),
          supabase
            .from("armas")
            .select("*")
            .eq("categoria_id", categoriaId)
            .order("nome")
        ]);

        if (categoriaResult.error || !categoriaResult.data) {
          setError("Categoria não encontrada.");
          setLoading(false);
          return;
        }

        setNomeCategoria(categoriaResult.data.nome);

        if (armasResult.error) {
          console.error("Erro ao buscar produtos:", armasResult.error);
          setError(`Erro ao carregar produtos: ${armasResult.error.message}`);
          setLoading(false);
          return;
        }

        const armasData = armasResult.data || [];
        const armaIds = armasData.map((a: any) => a.id);
        
        if (armaIds.length === 0) {
          setArmas([]);
          setArmasFiltradas([]);
          setMinPrecoPorArma(new Map());
          setCalibresPorArma(new Map());
          setLoading(false);
          return;
        }

        // Buscar variações, fotos, marcas e calibres em paralelo
        const [variacoesResult, fotosResult] = await Promise.all([
          supabase
            .from("variacoes_armas")
            .select("arma_id, preco, calibre_id")
            .in("arma_id", armaIds),
          supabase
            .from("fotos_armas")
            .select("arma_id, foto_url, ordem")
            .in("arma_id", armaIds)
            .order("arma_id, ordem", { ascending: true })
        ]);

        // Processar variações para preço mínimo e calibres por arma
        const minMap = new Map<string, number>();
        const calibresPorArmaMap = new Map<string, Set<string>>();
        (variacoesResult.data || []).forEach((v: { arma_id: string; preco: number; calibre_id: string | null }) => {
          const preco = parseFloat(String(v.preco));
          const current = minMap.get(v.arma_id);
          if (current == null || preco < current) minMap.set(v.arma_id, preco);
          
          // Adicionar calibre da variação ao mapa de calibres por arma
          if (v.calibre_id) {
            if (!calibresPorArmaMap.has(v.arma_id)) {
              calibresPorArmaMap.set(v.arma_id, new Set());
            }
            calibresPorArmaMap.get(v.arma_id)!.add(v.calibre_id);
          }
        });
        setMinPrecoPorArma(minMap);
        setCalibresPorArma(calibresPorArmaMap);
        
        // Processar fotos - pegar apenas a primeira de cada arma
        const fotosMap = new Map<string, string>();
        (fotosResult.data || []).forEach((foto: any) => {
          if (!fotosMap.has(foto.arma_id)) {
            fotosMap.set(foto.arma_id, foto.foto_url);
          }
        });

        // Extrair IDs únicos para marcas e calibres
        const marcaIds = [...new Set(armasData.map((a: any) => a.marca_id).filter(Boolean))];
        const calibreIds = [...new Set(armasData.map((a: any) => a.calibre_id || a.calibres_id).filter(Boolean))];

        // Buscar marcas e calibres em paralelo
        const [marcasResult, calibresResult] = await Promise.all([
          marcaIds.length > 0
            ? supabase.from("marcas").select("id, nome").in("id", marcaIds)
            : Promise.resolve({ data: [], error: null }),
          calibreIds.length > 0
            ? supabase.from("calibres").select("id, nome").in("id", calibreIds)
            : Promise.resolve({ data: [], error: null }),
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
        setArmas(armasFormatadas);
        setArmasFiltradas(armasFormatadas);
      } catch (err: any) {
        console.error("Erro:", err);
        setError(err?.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoriaId]);

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
    setFiltroNome("");
  };

  if (loading) {
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
              {(marcaSelecionada || calibreSelecionado || filtroNome) && (
                <button
                  onClick={limparFiltros}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Input Nome */}
              <div>
                <label htmlFor="filtro-nome" className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Nome
                </label>
                <input
                  id="filtro-nome"
                  type="text"
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-[#E9B20E] focus:outline-none focus:ring-1 focus:ring-[#E9B20E]"
                  placeholder="Buscar por nome..."
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
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
                {marcaSelecionada || calibreSelecionado || filtroNome
                  ? "Nenhum produto encontrado com os filtros aplicados."
                  : "Nenhum produto encontrado para essa categoria."}
              </p>
              {(marcaSelecionada || calibreSelecionado || filtroNome) && (
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
                  {(() => {
                    const minVariacao = minPrecoPorArma.get(arma.id);
                    const precoExibir = minVariacao != null ? minVariacao : arma.preco;
                    if (precoExibir == null) return null;
                    const formatado = parseFloat(precoExibir.toString()).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
                    return (
                      <p className="font-bold text-[#E9B20E]">
                        {minVariacao != null ? "A partir de " : ""}R$ {formatado}
                      </p>
                    );
                  })()}
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