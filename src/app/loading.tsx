export default function Loading() {
  return (
    <div className="flex w-full flex-1 items-center justify-center gap-3 py-24 text-sm font-medium text-gray-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C9822B] border-t-transparent" />
      Loading...
    </div>
  );
}
