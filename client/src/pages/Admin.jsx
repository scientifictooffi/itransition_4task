import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";

import { api } from "../api";
import Toolbar from "../components/Toolbar";
import UsersTable from "../components/UsersTable";
import StatusAlert from "../components/StatusAlert";

function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const filteredUsers = useMemo(() => {
    if (!filter.trim()) return users;
    const search = filter.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
    );
  }, [users, filter]);

  const handleAuthError = (err) => {
    if (err?.redirect || err?.status === 401 || err?.status === 403) {
      navigate("/login");
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get("/api/users");
      setUsers(response.users);
    } catch (err) {
      setError(err.message);
      handleAuthError(err);
    }
  };

  useEffect(() => {
    api
      .get("/api/me")
      .then(loadUsers)
      .catch((err) => {
        handleAuthError(err);
      });
  }, []);

  const setSelection = (ids) => {
    setSelectedIds(ids);
  };

  const toggleAll = (checked) => {
    if (checked) {
      setSelection(filteredUsers.map((user) => user.id));
    } else {
      setSelection([]);
    }
  };

  const toggleOne = (id, checked) => {
    setSelection((prev) => {
      if (checked) return [...new Set([...prev, id])];
      return prev.filter((value) => value !== id);
    });
  };

  const runAction = async (action, payload) => {
    setError(null);
    setStatus(null);
    try {
      const response = await api.post(`/api/users/${action}`, payload);
      setStatus(response.message);
      await loadUsers();
      setSelection([]);
    } catch (err) {
      setError(err.message);
      handleAuthError(err);
    }
  };

  const onLogout = async () => {
    try {
      await api.post("/api/logout");
    } finally {
      navigate("/login");
    }
  };

  return (
    <>
      <Navbar bg="white" className="border-bottom shadow-sm">
        <Container>
          <Navbar.Brand className="fw-semibold">User Management</Navbar.Brand>
          <Button variant="outline-secondary" onClick={onLogout}>
            Logout
          </Button>
        </Container>
      </Navbar>

      <Container className="py-4">
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

        <Toolbar
          filter={filter}
          onFilterChange={setFilter}
          disableSelectionActions={selectedIds.length === 0}
          onBlock={() => runAction("block", { ids: selectedIds })}
          onUnblock={() => runAction("unblock", { ids: selectedIds })}
          onDelete={() => runAction("delete", { ids: selectedIds })}
          onDeleteUnverified={() =>
            runAction("delete-unverified", selectedIds.length ? { ids: selectedIds } : {})
          }
        />

        <UsersTable
          users={filteredUsers}
          selectedIds={selectedIds}
          onToggleAll={toggleAll}
          onToggleOne={toggleOne}
        />
      </Container>
    </>
  );
}

export default AdminPage;
