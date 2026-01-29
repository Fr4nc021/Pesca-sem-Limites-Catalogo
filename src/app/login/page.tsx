"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Email ou senha inválidos");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.welcomeTitle}>Bem-vindo de volta</h2>
        <p style={styles.welcomeSubtitle}>
          Entre na sua conta para acessar o catálogo
        </p>

        {/* EMAIL */}
        <div style={styles.inputWrapper}>
          <label style={styles.label}>Email</label>
          <input
            placeholder="seu@email.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* SENHA */}
        <div style={styles.inputWrapper}>
          <label style={styles.label}>Senha</label>
          <div style={{ position: "relative" }}>
            <input
              placeholder="Senha"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              👁
            </button>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          onClick={handleLogin}
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}

/* === STYLES (mantive simples aqui, pode colar os seus se quiser) === */
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#030711",
  },
  card: {
    background: "#1F2937",
    padding: 40,
    borderRadius: 16,
    width: 420,
    color: "#fff",
  },
  welcomeTitle: { fontSize: 24, fontWeight: 700 },
  welcomeSubtitle: { color: "#9CA3AF", marginBottom: 24 },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 14 },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "none",
    background: "#374151",
    color: "#fff",
  },
  eyeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  error: { color: "#EF4444", marginBottom: 12 },
  button: {
    width: "100%",
    padding: 12,
    background: "#E9B20E",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
  },
}
