import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "@shared/schemas/auth.js";
import { toast } from "sonner";
import PasswordInput from "../components/PasswordInput";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && user) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">Boomerang</h1>
          <p className="mt-1.5 text-sm text-muted">Your campus Lost & Found community</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-card">
          <h2 className="mb-6 text-xl font-bold text-dark">Welcome back</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-dark">Email</label>
              <input
                type="email"
                name="email"
                autoFocus
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="your@email.com"
              />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-dark">Password</label>
              <PasswordInput name="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
              {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-xl bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
