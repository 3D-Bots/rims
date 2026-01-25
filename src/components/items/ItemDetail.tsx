import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import * as itemService from '../../services/itemService';
import { Item } from '../../types/Item';
import { useAlert } from '../../contexts/AlertContext';
import ConfirmModal from '../common/ConfirmModal';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [item, setItem] = useState<Item | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      const foundItem = itemService.getItemById(parseInt(id));
      if (foundItem) {
        setItem(foundItem);
      } else {
        showError('Item not found.');
        navigate('/items');
      }
    }
  }, [id, navigate, showError]);

  const handleDelete = () => {
    if (!item) return;

    const success = itemService.deleteItem(item.id);
    if (success) {
      showSuccess('Item was successfully destroyed.');
      navigate('/items');
    } else {
      showError('Failed to delete item.');
    }
    setShowDeleteModal(false);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  if (!item) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <Card.Header>
        <h4 className="mb-0">{item.name}</h4>
      </Card.Header>
      <Card.Body>
        {item.picture && (
          <Row className="mb-4">
            <Col md={12}>
              <img
                src={item.picture}
                alt={item.name}
                style={{ maxWidth: '65%' }}
                className="img-fluid"
              />
            </Col>
          </Row>
        )}

        <Row className="mb-2">
          <Col md={3} className="text-muted">Description</Col>
          <Col md={9}>
            <p style={{ whiteSpace: 'pre-wrap' }}>{item.description}</p>
          </Col>
        </Row>

        <Row className="mb-2">
          <Col md={3} className="text-muted">Product Model Number</Col>
          <Col md={9}>{item.productModelNumber}</Col>
        </Row>

        <Row className="mb-2">
          <Col md={3} className="text-muted">Vendor Name</Col>
          <Col md={9}>{item.vendorName}</Col>
        </Row>

        <Row className="mb-2">
          <Col md={3} className="text-muted">Vendor Part Number</Col>
          <Col md={9}>{item.vendorPartNumber}</Col>
        </Row>

        <Row className="mb-2">
          <Col md={3} className="text-muted">Vendor URL</Col>
          <Col md={9}>
            {item.vendorUrl && (
              <a href={item.vendorUrl} target="_blank" rel="noopener noreferrer">
                {item.vendorUrl}
              </a>
            )}
          </Col>
        </Row>

        <Row className="mb-2">
          <Col md={3} className="text-muted">Quantity</Col>
          <Col md={9}>{item.quantity}</Col>
        </Row>

        <Row className="mb-2">
          <Col md={3} className="text-muted">Unit Value</Col>
          <Col md={9}>{formatCurrency(item.unitValue)}</Col>
        </Row>

        <Row className="mb-2">
          <Col md={3} className="text-muted">Total Value</Col>
          <Col md={9}>{formatCurrency(item.value)}</Col>
        </Row>

        <Row className="mb-2">
          <Col md={3} className="text-muted">Location</Col>
          <Col md={9}>{item.location}</Col>
        </Row>

        <Row className="mb-2">
          <Col md={3} className="text-muted">Category</Col>
          <Col md={9}>{item.category}</Col>
        </Row>

        <hr />

        <ButtonGroup>
          <Link to={`/items/${item.id}/edit`} className="btn btn-primary">
            Edit
          </Link>
          <Button variant="warning" onClick={() => setShowDeleteModal(true)}>
            Delete
          </Button>
          <Button variant="danger" onClick={() => navigate('/items')}>
            Cancel
          </Button>
        </ButtonGroup>
      </Card.Body>

      <ConfirmModal
        show={showDeleteModal}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </Card>
  );
}
