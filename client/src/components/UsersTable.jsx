import { useEffect, useMemo, useRef } from "react";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";

function formatDate(value) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

function statusVariant(status) {
  if (status === "blocked") return "danger";
  if (status === "active") return "success";
  return "secondary";
}

function UsersTable({ users, selectedIds, onToggleAll, onToggleOne }) {
  const selectAllRef = useRef(null);

  const selection = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    const allSelected = users.length > 0 && users.every((u) => selectedSet.has(u.id));
    const someSelected = users.some((u) => selectedSet.has(u.id));
    return { allSelected, someSelected };
  }, [users, selectedIds]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selection.someSelected && !selection.allSelected;
    }
  }, [selection]);

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th scope="col" style={{ width: 48 }}>
              <Form.Check
                ref={selectAllRef}
                type="checkbox"
                checked={selection.allSelected}
                onChange={(event) => onToggleAll(event.target.checked)}
                aria-label="Select all"
              />
            </th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Status</th>
            <th scope="col">Last login</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const checked = selectedIds.includes(user.id);
            return (
              <tr key={user.id}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={checked}
                    onChange={(event) =>
                      onToggleOne(user.id, event.target.checked)
                    }
                    aria-label={`Select ${user.email}`}
                  />
                </td>
                <td>
                  <div className="fw-semibold">{user.name}</div>
                </td>
                <td className="text-muted">{user.email}</td>
                <td>
                  <Badge bg={statusVariant(user.status)}>{user.status}</Badge>
                </td>
                <td>{formatDate(user.last_login_at)}</td>
              </tr>
            );
          })}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted py-4">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;
