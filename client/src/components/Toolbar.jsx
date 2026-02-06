import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

function Toolbar({
  filter,
  onFilterChange,
  disableSelectionActions,
  onBlock,
  onUnblock,
  onDelete,
  onDeleteUnverified,
}) {
  return (
    <div className="d-flex align-items-center justify-content-between mb-3">
      <ButtonGroup>
        <Button
          variant="outline-primary"
          disabled={disableSelectionActions}
          onClick={onBlock}
        >
          Block
        </Button>

        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>Unblock selected users</Tooltip>}
        >
          <span className="d-inline-block">
            <Button
              variant="outline-secondary"
              disabled={disableSelectionActions}
              onClick={onUnblock}
            >
              <i className="bi bi-unlock" />
            </Button>
          </span>
        </OverlayTrigger>

        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>Delete selected users</Tooltip>}
        >
          <span className="d-inline-block">
            <Button
              variant="outline-danger"
              disabled={disableSelectionActions}
              onClick={onDelete}
            >
              <i className="bi bi-trash" />
            </Button>
          </span>
        </OverlayTrigger>

        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>Delete all unverified users</Tooltip>}
        >
          <span className="d-inline-block">
            <Button variant="outline-danger" onClick={onDeleteUnverified}>
              <i className="bi bi-person-x" />
            </Button>
          </span>
        </OverlayTrigger>
      </ButtonGroup>

      <div className="d-flex align-items-center">
        <input
          className="form-control"
          placeholder="Filter"
          type="text"
          style={{ width: 240 }}
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
        />
      </div>
    </div>
  );
}

export default Toolbar;
