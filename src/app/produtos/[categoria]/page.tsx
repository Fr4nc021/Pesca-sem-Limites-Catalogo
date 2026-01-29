import { supabase } from "../../../lib/supabaseClient";

type Arma = {
  id: string;
  nome: string;
  preco: number | null;
  foto_url: string | null;
  categoria: string | null;
  // adicione outros campos se quiser exibir
};

type PageProps = {
  params: { categoria: string };
};

export default async function ProdutosPorCategoriaPage({ params }: PageProps) {
  const { categoria } = params;

  const { data: armas, error } = await supabase
    .from("armas")
    .select("*")
    .eq("categoria", categoria);

  if (error) {
    return (
      <main className="min-h-screen px-4 py-8" style={{ backgroundColor: "#030711" }}>
        <p className="text-red-400">Erro ao carregar produtos.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8" style={{ backgroundColor: "#030711" }}>
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-white">
          Produtos - {categoria}
        </h1>

        {(!armas || armas.length === 0) && (
          <p className="text-zinc-300">Nenhum produto encontrado para essa categoria.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {armas?.map((arma) => (
            <div
              key={arma.id}
              className="rounded-lg border border-zinc-700 bg-zinc-900/40 p-4 text-white"
            >
              {arma.foto_url && (
                // se quiser, troque para <Image> com next/image
                <img
                  src={arma.foto_url}
                  alt={arma.nome}
                  className="mb-3 h-40 w-full rounded object-cover"
                />
              )}

              <h2 className="text-lg font-semibold">{arma.nome}</h2>

              {arma.preco != null && (
                <p className="mt-2 font-bold text-[#E9B20E]">
                  R$ {arma.preco.toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}