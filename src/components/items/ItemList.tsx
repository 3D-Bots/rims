import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Button } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import * as itemService from '../../services/itemService';
import { Item } from '../../types/Item';
import { useAlert } from '../../contexts/AlertContext';
import Pagination from '../common/Pagination';
import ConfirmModal from '../common/ConfirmModal';

type SortField = 'name' | 'productModelNumber' | 'quantity' | 'unitValue' | 'value' | 'vendorName' | 'location' | 'category';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 25;

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deleteModalItem, setDeleteModalItem] = useState<Item | null>(null);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    const allItems = itemService.getAllItems();
    setItems(allItems);
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortField, sortDirection]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedItems, currentPage]);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const totalQuantity = itemService.getTotalQuantity();
  const totalValue = itemService.getTotalValue();

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = () => {
    if (!deleteModalItem) return;

    const success = itemService.deleteItem(deleteModalItem.id);
    if (success) {
      showSuccess('Item was successfully destroyed.');
      loadItems();
    } else {
      showError('Failed to delete item.');
    }
    setDeleteModalItem(null);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(field)}
      style={{ cursor: 'pointer' }}
      className="text-center"
    >
      {children}
      {sortField === field && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
    </th>
  );

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Inventory Items</h4>
          <Link to="/items/new" className="btn btn-primary">
            New Item
          </Link>
        </div>
      </Card.Header>
      <Card.Body>
        <Table hover responsive>
          <thead>
            <tr>
              <SortHeader field="name">Item Name</SortHeader>
              <SortHeader field="productModelNumber">Model #</SortHeader>
              <SortHeader field="quantity">Quantity</SortHeader>
              <SortHeader field="unitValue">Unit Value</SortHeader>
              <SortHeader field="value">Total Value</SortHeader>
              <SortHeader field="vendorName">Vendor</SortHeader>
              <SortHeader field="location">Location</SortHeader>
              <SortHeader field="category">Category</SortHeader>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link to={`/items/${item.id}`}>{item.name}</Link>
                </td>
                <td className="text-center">{item.productModelNumber}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-center">{formatCurrency(item.unitValue)}</td>
                <td className="text-center">{formatCurrency(item.value)}</td>
                <td className="text-center">{item.vendorName}</td>
                <td className="text-center">{item.location}</td>
                <td className="text-center">{item.category}</td>
                <td className="text-center">
                  <Link to={`/items/${item.id}/edit`} className="btn btn-sm btn-outline-primary me-1">
                    <FaEdit />
                  </Link>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setDeleteModalItem(item)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="table-secondary">
              <td colSpan={2}><strong>Totals</strong></td>
              <td className="text-center"><strong>{totalQuantity}</strong></td>
              <td className="text-center"></td>
              <td className="text-center"><strong>{formatCurrency(totalValue)}</strong></td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </Table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={items.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </Card.Body>

      <ConfirmModal
        show={!!deleteModalItem}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteModalItem?.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalItem(null)}
      />
    </Card>
  );
}
