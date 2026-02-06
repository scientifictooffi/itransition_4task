import Alert from "react-bootstrap/Alert";

function StatusAlert({ variant = "info", message, onClose }) {
  if (!message) return null;

  return (
    <Alert
      variant={variant}
      dismissible
      onClose={onClose}
      className="mb-3"
    >
      {message}
    </Alert>
  );
}

export default StatusAlert;
