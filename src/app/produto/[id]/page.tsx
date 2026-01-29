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
  espec_carregadores: string | null;
  espec_comprimento_cano: string | null;
  caracteristica_acabamento: string | null;
  marca: { nome: string } | null;
  calibre: { nome: string } | null;
  funcionamento: { nome: string } | null;
  categoria: { nome: string } | null;
};

export default function ProdutoPage() {
  const router = useRouter();
  const params = useParams();
  const produtoId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [produto, setProduto] = useState<Arma | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showParcelamento, setShowParcelamento] = useState(false);

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
    if (authLoading || !produtoId) return;

    const fetchProduto = async () => {
      try {
        // Buscar o produto com relacionamentos
        const { data: produtoData, error: produtoError } = await supabase
          .from("armas")
          .select("*")
          .eq("id", produtoId)
          .single();

        if (produtoError || !produtoData) {
          setError("Produto não encontrado.");
          setLoading(false);
          return;
        }

        // Buscar dados relacionados
        const [marcaResult, calibreResult, funcionamentoResult, categoriaResult] = await Promise.all([
          produtoData.marca_id
            ? supabase.from("marcas").select("nome").eq("id", produtoData.marca_id).single()
            : { data: null, error: null },
          produtoData.calibre_id || produtoData.calibres_id
            ? supabase
                .from("calibres")
                .select("nome")
                .eq("id", produtoData.calibre_id || produtoData.calibres_id)
                .single()
            : { data: null, error: null },
          produtoData.funcionamento_id
            ? supabase
                .from("funcionamento")
                .select("nome")
                .eq("id", produtoData.funcionamento_id)
                .single()
            : { data: null, error: null },
          produtoData.categoria_id
            ? supabase
                .from("categorias")
                .select("nome")
                .eq("id", produtoData.categoria_id)
                .single()
            : { data: null, error: null },
        ]);

        const produtoFormatado: Arma = {
          ...produtoData,
          marca: marcaResult.data ? { nome: marcaResult.data.nome } : null,
          calibre: calibreResult.data ? { nome: calibreResult.data.nome } : null,
          funcionamento: funcionamentoResult.data ? { nome: funcionamentoResult.data.nome } : null,
          categoria: categoriaResult.data ? { nome: categoriaResult.data.nome } : null,
        };

        setProduto(produtoFormatado);
      } catch (err: any) {
        console.error("Erro:", err);
        setError(err?.message || "Erro ao carregar produto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [authLoading, produtoId]);

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

  if (error || !produto) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: "#030711" }}
      >
        <Header />
        <main className="flex-1 px-4 py-8" style={{ backgroundColor: "#030711" }}>
          <div className="mx-auto max-w-4xl">
            <p className="text-red-400">{error || "Produto não encontrado"}</p>
          </div>
        </main>
      </div>
    );
  }

  const formatPrice = (price: number | null) => {
    if (price == null) return "N/A";
    return parseFloat(price.toString()).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calcularParcelamento = () => {
    if (!produto || produto.preco == null) return [];

    const preco = parseFloat(produto.preco.toString());
    const parcelas = [];

    // 1x a 4x sem juros
    for (let i = 1; i <= 4; i++) {
      parcelas.push({
        vezes: i,
        valorParcela: preco / i,
        valorTotal: preco,
        comJuros: false,
      });
    }

    // 5x a 10x com 8% de juros
    for (let i = 5; i <= 10; i++) {
      const valorComJuros = preco * 1.08; // Acréscimo de 8%
      parcelas.push({
        vezes: i,
        valorParcela: valorComJuros / i,
        valorTotal: valorComJuros,
        comJuros: true,
      });
    }

    return parcelas;
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#030711" }}
    >
      <Header />
      <main className="flex-1 px-4 py-8" style={{ backgroundColor: "#030711" }}>
        <div className="mx-auto max-w-7xl">
          {/* Seção Principal: Imagem e Detalhes */}
          <div className="mb-8 grid gap-8 md:grid-cols-2">
            {/* Imagem do Produto */}
            <div className="relative">
              {produto.foto_url ? (
                <div className="relative overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/40">
                  <img
                    src={produto.foto_url}
                    alt={produto.nome}
                    className="h-full w-full object-cover"
                  />
                  {/* Badge Destaque (opcional) */}
                  <div className="absolute left-4 top-4 rounded-full bg-[#E9B20E] px-3 py-1">
                    <span className="text-xs font-bold text-zinc-900">Destaque</span>
                  </div>
                </div>
              ) : (
                <div className="flex h-96 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/40">
                  <p className="text-zinc-500">Sem imagem</p>
                </div>
              )}
            </div>

            {/* Detalhes do Produto */}
            <div className="flex flex-col justify-center">
              {/* Marca */}
              {produto.marca && (
                <p className="mb-2 text-sm text-zinc-400">{produto.marca.nome}</p>
              )}

              {/* Nome do Produto */}
              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                {produto.nome}
              </h1>

              {/* Preço */}
              <div className="mb-6">
                <p className="mb-1 text-sm text-zinc-400">Valor à vista</p>
                <p className="text-5xl font-bold" style={{ color: "#E9B20E" }}>
                  R$ {formatPrice(produto.preco)}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  ou em até 4x sem juros ou até 10x com juros
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                <button
                  className="flex items-center justify-center gap-2 rounded-lg border-2 px-6 py-3 transition-colors"
                  style={{ borderColor: "#E9B20E", backgroundColor: "transparent" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(233, 178, 14, 0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  onClick={() => setShowParcelamento(true)}
                >
                  <svg
                    className="h-5 w-5"
                    style={{ color: "#E9B20E" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-bold" style={{ color: "#E9B20E" }}>
                    Ver Parcelamento
                  </span>
                </button>
              </div>

              {/* Garantias/Features */}
              <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>Garantia de fábrica</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span>Produto original</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Especificações */}
          <div className="rounded-lg border border-[#E9B20E] bg-zinc-900/40 p-6">
            <h2 className="mb-6 text-2xl font-bold text-white">Especificações</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {produto.marca && (
                <div>
                  <p className="text-sm text-zinc-400">Marca</p>
                  <p className="text-lg font-semibold text-white">{produto.marca.nome}</p>
                </div>
              )}
              {produto.calibre && (
                <div>
                  <p className="text-sm text-zinc-400">Calibre</p>
                  <p className="text-lg font-semibold text-white">{produto.calibre.nome}</p>
                </div>
              )}
              {produto.funcionamento && (
                <div>
                  <p className="text-sm text-zinc-400">Funcionamento</p>
                  <p className="text-lg font-semibold text-white">
                    {produto.funcionamento.nome}
                  </p>
                </div>
              )}
              {produto.espec_capacidade_tiros && (
                <div>
                  <p className="text-sm text-zinc-400">Capacidade de Tiros</p>
                  <p className="text-lg font-semibold text-white">
                    {produto.espec_capacidade_tiros}
                  </p>
                </div>
              )}
              {produto.espec_carregadores && (
                <div>
                  <p className="text-sm text-zinc-400">Carregadores</p>
                  <p className="text-lg font-semibold text-white">
                    {produto.espec_carregadores}
                  </p>
                </div>
              )}
              {produto.espec_comprimento_cano && (
                <div>
                  <p className="text-sm text-zinc-400">Comprimento do Cano</p>
                  <p className="text-lg font-semibold text-white">
                    {produto.espec_comprimento_cano}
                  </p>
                </div>
              )}
              {produto.caracteristica_acabamento && (
                <div>
                  <p className="text-sm text-zinc-400">Acabamento</p>
                  <p className="text-lg font-semibold text-white">
                    {produto.caracteristica_acabamento}
                  </p>
                </div>
              )}
              {produto.categoria && (
                <div>
                  <p className="text-sm text-zinc-400">Categoria</p>
                  <p className="text-lg font-semibold text-white">{produto.categoria.nome}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Parcelamento */}
      {showParcelamento && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowParcelamento(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
            style={{ backgroundColor: "#18181b" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Opções de Parcelamento</h2>
              <button
                onClick={() => setShowParcelamento(false)}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Valor Total */}
            {produto && produto.preco != null && (
              <div className="mb-6 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                <p className="text-sm text-zinc-400">Valor total do produto</p>
                <p className="text-3xl font-bold" style={{ color: "#E9B20E" }}>
                  R$ {formatPrice(produto.preco)}
                </p>
              </div>
            )}

            {/* Lista de Parcelas */}
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {calcularParcelamento().map((parcela, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/30 p-4 transition-colors hover:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg font-bold"
                      style={{
                        backgroundColor: parcela.comJuros
                          ? "rgba(233, 178, 14, 0.2)"
                          : "rgba(34, 197, 94, 0.2)",
                        color: parcela.comJuros ? "#E9B20E" : "#22c55e",
                      }}
                    >
                      {parcela.vezes}x
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {parcela.vezes}x de R$ {formatPrice(parcela.valorParcela)}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {parcela.comJuros ? (
                          <span>
                            Total: R$ {formatPrice(parcela.valorTotal)} (com juros de 8%)
                          </span>
                        ) : (
                          <span>Sem juros</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {!parcela.comJuros && (
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: "rgba(34, 197, 94, 0.2)",
                        color: "#22c55e",
                      }}
                    >
                      Sem juros
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowParcelamento(false)}
                className="rounded-lg px-6 py-2 font-bold text-zinc-900 transition-colors"
                style={{ backgroundColor: "#E9B20E" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#D4A00D")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#E9B20E")
                }
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}