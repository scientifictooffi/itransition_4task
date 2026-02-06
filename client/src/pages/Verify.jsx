import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import StatusAlert from "../components/StatusAlert";
import { api } from "../api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function VerifyPage() {
  const query = useQuery();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = query.get("token");
    if (!token) {
      setError("Missing verification token.");
      return;
    }

    api
      .get(`/api/verify?token=${token}`)
      .then((response) => setStatus(response.message))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5">
          <h3 className="mb-4">Email verification</h3>
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
          <p className="text-muted">
            Return to <Link to="/login">sign in</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyPage;
