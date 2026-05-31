/** Shimmer skeleton card matching the product_listing_page_1 skeleton design */
export default function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="aspect-[3/4] w-full rounded-lg skeleton" />
      <div className="space-y-2 px-1">
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-4 w-1/4 skeleton rounded" />
      </div>
    </div>
  );
}
