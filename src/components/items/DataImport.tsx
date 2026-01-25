import { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Table, Alert, Row, Col, Badge } from 'react-bootstrap';
import { FaFileUpload, FaCheck, FaTimes, FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import * as itemService from '../../services/itemService';
import { ItemFormData, CATEGORIES } from '../../types/Item';
import { useAlert } from '../../contexts/AlertContext';

interface ImportRow {
  name: string;
  description: string;
  productModelNumber: string;
  vendorPartNumber: string;
  vendorName: string;
  quantity: number;
  unitValue: number;
  vendorUrl: string;
  category: string;
  location: string;
  barcode: string;
  reorderPoint: number;
  valid: boolean;
  errors: string[];
}

const COLUMN_MAPPINGS: Record<string, keyof ImportRow> = {
  name: 'name',
  item: 'name',
  'item name': 'name',
  description: 'description',
  desc: 'description',
  'product model number': 'productModelNumber',
  'model number': 'productModelNumber',
  model: 'productModelNumber',
  'vendor part number': 'vendorPartNumber',
  'part number': 'vendorPartNumber',
  partnumber: 'vendorPartNumber',
  'vendor name': 'vendorName',
  vendor: 'vendorName',
  supplier: 'vendorName',
  quantity: 'quantity',
  qty: 'quantity',
  stock: 'quantity',
  'unit value': 'unitValue',
  'unit price': 'unitValue',
  price: 'unitValue',
  cost: 'unitValue',
  'vendor url': 'vendorUrl',
  url: 'vendorUrl',
  link: 'vendorUrl',
  category: 'category',
  cat: 'category',
  type: 'category',
  location: 'location',
  loc: 'location',
  bin: 'location',
  barcode: 'barcode',
  upc: 'barcode',
  sku: 'barcode',
  'reorder point': 'reorderPoint',
  reorderpoint: 'reorderPoint',
  'reorder level': 'reorderPoint',
};

export default function DataImport() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importing, setImporting] = useState(false);

  const validateRow = (row: Partial<ImportRow>): ImportRow => {
    const errors: string[] = [];

    if (!row.name || row.name.trim() === '') {
      errors.push('Name is required');
    }

    const quantity = Number(row.quantity) || 0;
    if (quantity < 0) {
      errors.push('Quantity must be >= 0');
    }

    const unitValue = Number(row.unitValue) || 0;
    if (unitValue < 0) {
      errors.push('Unit value must be >= 0');
    }

    const category = row.category || CATEGORIES[0];
    if (!CATEGORIES.includes(category as typeof CATEGORIES[number])) {
      errors.push(`Invalid category: ${category}`);
    }

    return {
      name: String(row.name || '').trim(),
      description: String(row.description || '').trim(),
      productModelNumber: String(row.productModelNumber || '').trim(),
      vendorPartNumber: String(row.vendorPartNumber || '').trim(),
      vendorName: String(row.vendorName || '').trim(),
      quantity: Math.max(0, quantity),
      unitValue: Math.max(0, unitValue),
      vendorUrl: String(row.vendorUrl || '').trim(),
      category: CATEGORIES.includes(category as typeof CATEGORIES[number])
        ? category
        : CATEGORIES[0],
      location: String(row.location || '').trim(),
      barcode: String(row.barcode || '').trim(),
      reorderPoint: Math.max(0, Number(row.reorderPoint) || 0),
      valid: errors.length === 0,
      errors,
    };
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        if (jsonData.length === 0) {
          showError('No data found in file');
          return;
        }

        const mappedData = jsonData.map((row) => {
          const mappedRow: Partial<ImportRow> = {};

          Object.entries(row).forEach(([key, value]) => {
            const normalizedKey = key.toLowerCase().trim();
            const mappedField = COLUMN_MAPPINGS[normalizedKey];
            if (mappedField) {
              (mappedRow as Record<string, unknown>)[mappedField] = value;
            }
          });

          return validateRow(mappedRow);
        });

        setImportData(mappedData);
        setFileName(file.name);
      } catch {
        showError('Failed to parse file. Please ensure it is a valid CSV or Excel file.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  const handleImport = async () => {
    const validRows = importData.filter((row) => row.valid);

    if (validRows.length === 0) {
      showError('No valid rows to import');
      return;
    }

    setImporting(true);

    try {
      let imported = 0;

      for (const row of validRows) {
        const itemData: ItemFormData = {
          name: row.name,
          description: row.description,
          productModelNumber: row.productModelNumber,
          vendorPartNumber: row.vendorPartNumber,
          vendorName: row.vendorName,
          quantity: row.quantity,
          unitValue: row.unitValue,
          picture: null,
          vendorUrl: row.vendorUrl,
          category: row.category,
          location: row.location,
          barcode: row.barcode,
          reorderPoint: row.reorderPoint,
        };

        itemService.createItem(itemData);
        imported++;
      }

      showSuccess(`Successfully imported ${imported} items`);
      navigate('/items');
    } catch {
      showError('Failed to import items');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Example Item',
        description: 'Item description',
        productModelNumber: 'MODEL-001',
        vendorPartNumber: 'VP-001',
        vendorName: 'Vendor Name',
        quantity: 10,
        unitValue: 9.99,
        vendorUrl: 'https://example.com',
        category: CATEGORIES[0],
        location: 'A1B2',
        barcode: 'RIMS-0001',
        reorderPoint: 5,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');
    XLSX.writeFile(workbook, 'rims-import-template.xlsx');
  };

  const validCount = importData.filter((row) => row.valid).length;
  const invalidCount = importData.length - validCount;

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Import Items</h4>
        <Button variant="outline-secondary" size="sm" onClick={downloadTemplate}>
          <FaDownload className="me-1" /> Download Template
        </Button>
      </Card.Header>
      <Card.Body>
        <Alert variant="info">
          <strong>Supported formats:</strong> CSV, Excel (.xlsx, .xls)
          <br />
          <small>
            Columns are auto-detected. Required: name. Optional: description, quantity,
            unitValue, vendorName, vendorPartNumber, productModelNumber, vendorUrl,
            category, location, barcode, reorderPoint.
          </small>
        </Alert>

        <Form.Group className="mb-4">
          <Form.Label>Select File</Form.Label>
          <Form.Control
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
          />
        </Form.Group>

        {importData.length > 0 && (
          <>
            <Row className="mb-3">
              <Col>
                <Alert variant={invalidCount > 0 ? 'warning' : 'success'}>
                  <strong>File:</strong> {fileName}
                  <span className="ms-3">
                    <Badge bg="success">{validCount} valid</Badge>
                    {invalidCount > 0 && (
                      <Badge bg="danger" className="ms-2">{invalidCount} invalid</Badge>
                    )}
                  </span>
                </Alert>
              </Col>
            </Row>

            <div className="table-responsive" style={{ maxHeight: '400px' }}>
              <Table striped bordered hover size="sm">
                <thead className="sticky-top bg-light">
                  <tr>
                    <th style={{ width: '50px' }}>Status</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Unit Value</th>
                    <th>Location</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {importData.map((row, index) => (
                    <tr key={index} className={row.valid ? '' : 'table-danger'}>
                      <td className="text-center">
                        {row.valid ? (
                          <FaCheck className="text-success" />
                        ) : (
                          <FaTimes className="text-danger" />
                        )}
                      </td>
                      <td>{row.name || <em className="text-muted">Missing</em>}</td>
                      <td>{row.category}</td>
                      <td>{row.quantity}</td>
                      <td>${row.unitValue.toFixed(2)}</td>
                      <td>{row.location || '-'}</td>
                      <td>
                        {row.errors.map((err, i) => (
                          <Badge key={i} bg="danger" className="me-1">
                            {err}
                          </Badge>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="mt-4">
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={importing || validCount === 0}
                className="me-2"
              >
                <FaFileUpload className="me-1" />
                {importing ? 'Importing...' : `Import ${validCount} Items`}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setImportData([]);
                  setFileName('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Clear
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
