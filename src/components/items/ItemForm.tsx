import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Form, Button, Row, Col, ButtonGroup } from 'react-bootstrap';
import * as itemService from '../../services/itemService';
import { ItemFormData, CATEGORIES } from '../../types/Item';
import { useAlert } from '../../contexts/AlertContext';

export default function ItemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useAlert();
  const isEditing = !!id;

  // Get barcode from URL query param (from barcode scanner)
  const initialBarcode = searchParams.get('barcode') || '';

  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    productModelNumber: '',
    vendorPartNumber: '',
    vendorName: '',
    quantity: 0,
    unitValue: 0,
    picture: null,
    vendorUrl: '',
    category: CATEGORIES[0],
    location: '',
    barcode: initialBarcode,
    reorderPoint: 0,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const item = itemService.getItemById(parseInt(id));
      if (item) {
        setFormData({
          name: item.name,
          description: item.description,
          productModelNumber: item.productModelNumber,
          vendorPartNumber: item.vendorPartNumber,
          vendorName: item.vendorName,
          quantity: item.quantity,
          unitValue: item.unitValue,
          picture: item.picture,
          vendorUrl: item.vendorUrl,
          category: item.category,
          location: item.location,
          barcode: item.barcode,
          reorderPoint: item.reorderPoint,
        });
        if (item.picture) {
          setPreviewImage(item.picture);
        }
      } else {
        showError('Item not found.');
        navigate('/items');
      }
    }
  }, [id, navigate, showError]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData((prev) => ({ ...prev, picture: base64 }));
        setPreviewImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, picture: null }));
    setPreviewImage(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        const updatedItem = itemService.updateItem(parseInt(id!), formData);
        if (updatedItem) {
          showSuccess('Item was successfully updated.');
          navigate(`/items/${updatedItem.id}`);
        } else {
          showError('Failed to update item.');
        }
      } else {
        const newItem = itemService.createItem(formData);
        showSuccess('Item was successfully created.');
        navigate(`/items/${newItem.id}`);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Operation failed.');
    }
  };

  return (
    <Card>
      <Card.Header>
        <h4 className="mb-0">{isEditing ? 'Edit Item' : 'New Item'}</h4>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Label column sm={3}>Name</Form.Label>
            <Col sm={5}>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Form.Label column sm={3}>Description</Form.Label>
            <Col sm={5}>
              <Form.Control
                as="textarea"
                rows={10}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Form.Label column sm={3}>Product Model Number</Form.Label>
            <Col sm={5}>
              <Form.Control
                type="text"
                name="productModelNumber"
                value={formData.productModelNumber}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Form.Label column sm={3}>Vendor Name</Form.Label>
            <Col sm={5}>
              <Form.Control
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Form.Label column sm={3}>Vendor Part Number</Form.Label>
            <Col sm={5}>
              <Form.Control
                type="text"
                name="vendorPartNumber"
                value={formData.vendorPartNumber}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Form.Label column sm={3}>Quantity</Form.Label>
            <Col sm={5}>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min={0}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Form.Label column sm={3}>Vendor URL</Form.Label>
            <Col sm={5}>
              <Form.Control
                type="url"
                name="vendorUrl"
                value={formData.vendorUrl}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Form.Label column sm={3}>Location</Form.Label>
            <Col sm={5}>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Form.Label column sm={3}>Barcode</Form.Label>
            <Col sm={5}>
              <Form.Control
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="e.g., RIMS-0001 or UPC"
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Form.Label column sm={3}>Reorder Point</Form.Label>
            <Col sm={5}>
              <Form.Control
                type="number"
                name="reorderPoint"
                value={formData.reorderPoint}
                onChange={handleChange}
                min={0}
              />
              <Form.Text className="text-muted">
                Alert when quantity falls to or below this level
              </Form.Text>
            </Col>
          </Row>

          <Row className="mb-3">
            <Form.Label column sm={3}>Unit Value ($)</Form.Label>
            <Col sm={5}>
              <Form.Control
                type="number"
                name="unitValue"
                value={formData.unitValue}
                onChange={handleChange}
                min={0}
                step={0.01}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Form.Label column sm={3}>Category</Form.Label>
            <Col sm={5}>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Form.Label column sm={3}>Picture</Form.Label>
            <Col sm={5}>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewImage && (
                <div className="mt-2">
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{ maxWidth: '250px', maxHeight: '200px' }}
                    className="img-thumbnail"
                  />
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-2"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Col>
          </Row>

          <Row>
            <Col sm={{ span: 5, offset: 3 }}>
              <ButtonGroup>
                <Button variant="primary" type="submit">
                  {isEditing ? 'Update Item' : 'Create Item'}
                </Button>
                <Button variant="danger" onClick={() => navigate('/items')}>
                  Cancel
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}
