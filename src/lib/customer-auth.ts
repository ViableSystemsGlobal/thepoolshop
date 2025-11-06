import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'adpools-secret-key-2024-production-change-me';

export interface CustomerSession {
  id: string;
  email: string;
  type: 'customer';
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verify(token, JWT_SECRET) as any;
    
    if (decoded.type !== 'customer') {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      type: 'customer',
    };
  } catch (error) {
    return null;
  }
}

