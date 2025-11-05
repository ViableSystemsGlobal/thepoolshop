// Force dynamic rendering - products page requires authentication
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

