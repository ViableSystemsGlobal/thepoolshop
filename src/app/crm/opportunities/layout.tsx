// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function OpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

