import { FC, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold opacity-40 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
      
      {items.map((item, index) => (
        <Fragment key={index}>
          <ChevronRight size={10} className="flex-shrink-0" />
          {item.href ? (
            <Link to={item.href} className="hover:text-brand-accent transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-brand-primary opacity-100">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
