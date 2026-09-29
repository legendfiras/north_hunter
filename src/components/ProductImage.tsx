import Image from "next/image";
import type { Product } from "@/content/products";
import { hasText } from "@/lib/text";

type ProductImageProps = {
  product: Product;
  unavailableLabel: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function ProductImage({
  product,
  unavailableLabel,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw",
}: ProductImageProps) {
  const src = product.images.find((image) => hasText(image));

  return (
    <div className={`relative overflow-hidden bg-ivory ${className}`}>
      {src ? (
        <Image src={src} alt="" fill sizes={sizes} priority={priority} unoptimized className="object-contain" />
      ) : (
        <ImageUnavailable label={unavailableLabel} />
      )}
    </div>
  );
}

export function ImageUnavailable({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ivory px-4 text-center">
      <p className="text-sm text-moss">{label}</p>
    </div>
  );
}
