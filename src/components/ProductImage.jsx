import { productImage, productSrcSet, VIEW_LABELS } from '../data/products.js';

// Responsive product image (600/1200 px WebP renders), sized 6:5 with
// explicit dimensions so nothing shifts while it loads.
export default function ProductImage({
  product,
  colour,
  view = 'hero',
  sizes = '(max-width: 760px) 92vw, 45vw',
  alt,
  eager = false,
  className = '',
}) {
  return (
    <img
      className={className}
      src={productImage(product.id, colour.id, view, 1200)}
      srcSet={productSrcSet(product.id, colour.id, view)}
      sizes={sizes}
      alt={alt ?? `${product.name} in ${colour.name}, ${VIEW_LABELS[view]}`}
      width="1200"
      height="1000"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
    />
  );
}
