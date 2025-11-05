// Force dynamic rendering - DRM pages require authentication
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

