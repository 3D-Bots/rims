import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import { FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import * as bomService from '../../services/bomService';
import { BOM } from '../../types/BOM';
import { useAlert } from '../../contexts/AlertContext';
import ConfirmModal from '../common/ConfirmModal';

export default function BOMList() {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<BOM | null>(null);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    loadBOMs();
  }, []);

  const loadBOMs = () => {
    setBoms(bomService.getAllBOMs());
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    const success = bomService.deleteBOM(deleteTarget.id);
    if (success) {
      showSuccess(`BOM "${deleteTarget.name}" deleted.`);
      loadBOMs();
    } else {
      showError('Failed to delete BOM.');
    }
    setDeleteTarget(null);
  };

  const getBOMCost = (bom: BOM): string => {
    const breakdown = bomService.calculateBOMCost(bom.id);
    return breakdown ? `$${breakdown.totalCost.toFixed(2)}` : 'N/A';
  };

  const getCanBuildBadge = (bom: BOM) => {
    const availability = bomService.checkAvailability(bom.id);
    if (availability.canBuild) {
      return <Badge bg="success">Can Build</Badge>;
    }
    return <Badge bg="warning">Missing Parts</Badge>;
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Bill of Materials</h4>
        <Link to="/bom/new" className="btn btn-primary">
          <FaPlus className="me-1" /> New BOM
        </Link>
      </Card.Header>
      <Card.Body>
        {boms.length === 0 ? (
          <p className="text-muted text-center py-4">
            No BOMs created yet. Create your first BOM to group items into projects.
          </p>
        ) : (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Items</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {boms.map((bom) => (
                <tr key={bom.id}>
                  <td>
                    <Link to={`/bom/${bom.id}`}>{bom.name}</Link>
                  </td>
                  <td>{bom.items.length}</td>
                  <td>{getBOMCost(bom)}</td>
                  <td>{getCanBuildBadge(bom)}</td>
                  <td>{new Date(bom.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link to={`/bom/${bom.id}`} className="btn btn-sm btn-outline-primary">
                        <FaEye />
                      </Link>
                      <Link to={`/bom/${bom.id}/edit`} className="btn btn-sm btn-outline-secondary">
                        <FaEdit />
                      </Link>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setDeleteTarget(bom)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete BOM"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Card>
  );
}
