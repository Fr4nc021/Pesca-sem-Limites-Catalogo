import { supabase } from "../../lib/supabaseClient";

type Produto = {
  id: string;
  nome: string;
  preco: number;
  descricao_breve: string;
};

export default async function ProdutosPage() {
  const { data: produtos, error } = await supabase
    .from("produtos")
    .select("*");

  if (error) {
    return <p>Erro ao carregar produtos</p>;
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Catálogo de Armas</h1>

      <div style={{ display: "grid", gap: "1rem" }}>
        {produtos?.map((produto) => (
          <div
            key={produto.id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            <h2>{produto.nome}</h2>
            <p>{produto.descricao_breve}</p>
            <strong>R$ {produto.preco}</strong>
          </div>
        ))}
      </div>
    </main>
  );
}
