import { Music2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [navigate, user]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(form);
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
            <h1 className="text-xl font-semibold text-white">Create account</h1>
            <p className="text-sm text-neutral-400">Spotify</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-300">Username</span>
            <input className="field" value={form.username} onChange={(event) => updateField("username", event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-300">Email</span>
            <input
              className="field"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-300">Password</span>
            <input
              className="field"
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              required

            />
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-neutral-300">Account type</span>
            <div className="grid  grid-cols-2 gap-2 rounded-md border border-ink-700 bg-ink-950 p-1">
              {[
                { label: "Listener", value: "user" },
                { label: "Artist", value: "artist" },
              ].map((role) => (
                <button
                  key={role.value}
                  className={`h-10 rounded-md text-sm font-semibold transition ${
                    form.role === role.value ? "bg-accent text-black" : "text-neutral-400 hover:bg-ink-800 hover:text-white"
                  }`}
                  type="button"
                  onClick={() => updateField("role", role.value)}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
          <button className="btn-primary w-full" type="submit" disabled={submitting}>
            {submitting ? "Creating account" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link className="font-semibold text-accent hover:text-white" to="/login">
            Sign in 
          </Link>
        </p>
      </section>
    </main>
  );
}
