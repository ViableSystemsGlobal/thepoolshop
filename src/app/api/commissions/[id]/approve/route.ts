import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CommissionService } from '@/lib/commission-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: commissionId } = await params;
    const body = await request.json();
    const { reason } = body;

    const updated = await CommissionService.approveCommission(
      commissionId,
      session.user.id,
      reason
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error approving commission:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to approve commission' },
      { status: 500 }
    );
  }
}

