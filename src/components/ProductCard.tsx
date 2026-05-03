import { FC, MouseEvent as ReactMouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: ReactMouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.discountedPrice ?? product.price,
      quantity: 1,
      size: product.sizes[0] ?? '',
      color: product.colors[0]?.name ?? '',
      image: product.images[0] ?? ''
    });
  };

  const handleWishlist = (e: ReactMouseEvent) => {
    e.preventDefault();
    toggle(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />

        {product.stock < 5 && product.stock > 0 && (
          <Badge className="absolute top-4 left-4 bg-brand-maroon text-brand-secondary border-none uppercase text-[10px] tracking-widest rounded-none">
            Only {product.stock} left
          </Badge>
        )}

        {product.discountedPrice && (
          <Badge className="absolute top-4 right-4 bg-brand-accent text-brand-primary border-none uppercase text-[10px] tracking-widest rounded-none">
            Sale
          </Badge>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-brand-primary/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-serif text-xl uppercase tracking-widest">Sold Out</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex justify-center space-x-2 bg-gradient-to-t from-brand-primary/60 to-transparent">
          <Button
            variant="secondary"
            size="icon"
            className={`rounded-full shadow-lg ${wishlisted ? 'bg-brand-accent text-brand-primary' : ''}`}
            onClick={handleWishlist}
          >
            <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingBag size={18} />
          </Button>
        </div>
      </Link>

      <div className="space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="font-serif text-lg tracking-tight group-hover:text-brand-accent transition-colors">
            {product.name}
          </h3>
          <div className="text-right">
            {product.discountedPrice ? (
              <div className="space-y-0.5">
                <span className="font-medium text-brand-accent">Kes {product.discountedPrice.toLocaleString()}</span>
                <span className="block text-xs line-through opacity-40">Kes {product.price.toLocaleString()}</span>
              </div>
            ) : (
              <span className="font-medium">Kes {product.price.toLocaleString()}</span>
            )}
          </div>
        </div>
        <p className="text-xs uppercase tracking-widest opacity-50">{product.category}</p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
