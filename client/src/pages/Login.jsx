import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import StatusAlert from "../components/StatusAlert";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      await api.post("/api/login", form);
      setStatus("Login successful.");
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-4">
          <h3 className="mb-4">Sign in</h3>
          <StatusAlert
            variant="success"
            message={status}
            onClose={() => setStatus(null)}
          />
          <StatusAlert
            variant="danger"
            message={error}
            onClose={() => setError(null)}
          />
          <form onSubmit={onSubmit} className="card card-body shadow-sm">
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                required
              />
            </div>
            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="mt-3 text-muted">
            No account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
