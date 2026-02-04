"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/supabaseClient";
import type { CSSProperties } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ao carregar a página de login, se houver um erro de token guardado, 
    // tentamos limpar a sessão para evitar erros de refresh token.
    const clearStaleSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          await supabase.auth.signOut();
        } else if (session) {
          // Usar replace para evitar histórico de navegação indevido
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Erro ao verificar sessão:", err);
      }
    };
    clearStaleSession();
  }, [router]);

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

    // Usar replace para evitar histórico de navegação indevido
    router.replace("/dashboard");
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .login-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-image: url('/fundo/mobile.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
        }
        .login-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 0;
        }
        @media (min-width: 768px) {
          .login-container {
            background-image: url('/fundo/desktop.png');
          }
        }
        .login-card {
          position: relative;
          z-index: 1;
          background: rgba(31, 41, 55, 0.17);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .login-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .login-logo {
          max-width: 200px;
          height: auto;
        }
      `}} />
      <div className="login-container" style={{ position: "relative" }}>
      <div className="login-content">
        <img src="/logo.png" alt="Logo" className="login-logo" />
        <div style={styles.card} className="login-card">
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
      
      {/* Desenvolvido por */}
      <div style={styles.developedBy}>
        <p style={styles.developedByText}>
          Desenvolvido por CodeByFranco
        </p>
      </div>
      </div>
    </>
  );
}

const styles: { [key: string]: CSSProperties } = {
  card: {
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
  developedBy: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 1,
    textAlign: "center",
  },
  developedByText: {
    fontSize: 12,
    color: "#fff",
    margin: 0,
  },
}
