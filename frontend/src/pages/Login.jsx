import { Music2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [navigate, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = identity.includes("@")
        ? { email: identity.trim(), password }
        : { username: identity.trim(), password };
      await login(payload);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{ backgroundImage: "linear-gradient(rgba(3,5,5,0.82), rgba(3,5,5,0.86)), url('/login-background.svg')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(30,215,96,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(154,232,182,0.08),_transparent_28%)]" />
      <section className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-ink-900/85 p-6 shadow-panel backdrop-blur-md sm:p-7">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-black shadow-[0_0_24px_rgba(30,215,96,0.22)]">
            <Music2 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Sign in</h1>
            <p className="text-sm text-neutral-400">soundSphere</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-300">Username or email</span>
            <input className="field" value={identity} onChange={(event) => setIdentity(event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-300">Password</span>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
          <button className="btn-primary w-full" type="submit" disabled={submitting}>
            {submitting ? "Signing in" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          New here?{" "}
          <Link className="font-semibold text-accent hover:text-white" to="/register">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
