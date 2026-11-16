import { resolveAsset, assetSrc, assetSrcSet, cutoutSrc } from '../data/assets.js';

// Responsive product image resolved from the central asset registry.
// 4:5 frame (or 16:10 for wide assets) with explicit dimensions, so nothing
// shifts while it loads.
export function AssetImage({ asset, sizes = '(max-width: 760px) 92vw, 40vw', alt, eager = false, className = '', cutout = false }) {
  return (
    <img
      className={className}
      src={cutout ? cutoutSrc(asset) : assetSrc(asset)}
      srcSet={cutout ? `${cutoutSrc(asset, 'small')} ${asset.small}w, ${cutoutSrc(asset)} ${asset.w}w` : assetSrcSet(asset)}
      sizes={sizes}
      alt={alt ?? asset.alt}
      width={asset.w}
      height={asset.h}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      draggable="false"
    />
  );
}

export default function ProductImage({ product, colour, imageKey, ...rest }) {
  const asset = resolveAsset(product, colour, imageKey ?? colour.images[0]);
  return <AssetImage asset={asset} {...rest} />;
}
