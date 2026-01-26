import { Link } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import { FaHome } from 'react-icons/fa';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Breadcrumb className="mb-3">
      <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
        <FaHome className="me-1" aria-hidden="true" />
        <span className="visually-hidden">Home</span>
      </Breadcrumb.Item>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Breadcrumb.Item
            key={index}
            active={isLast}
            linkAs={!isLast && item.path ? Link : undefined}
            linkProps={!isLast && item.path ? { to: item.path } : undefined}
          >
            {item.label}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
}
