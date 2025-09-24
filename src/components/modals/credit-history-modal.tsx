'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  X, 
  History, 
  TrendingUp, 
  TrendingDown, 
  User, 
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';

interface CreditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributorId: string;
  distributorName: string;
}

interface CreditHistoryEntry {
  id: string;
  action: string;
  previousLimit?: number;
  newLimit?: number;
  previousUsed?: number;
  newUsed?: number;
  amount?: number;
  reason?: string;
  notes?: string;
  performedAt: string;
  performedByUser: {
    name: string;
    email: string;
  };
}

export default function CreditHistoryModal({
  isOpen,
  onClose,
  distributorId,
  distributorName
}: CreditHistoryModalProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [creditHistory, setCreditHistory] = useState<CreditHistoryEntry[]>([]);

  // Load credit history
  const loadCreditHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/drm/distributors/${distributorId}/credit`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCreditHistory(data.data || []);
      } else {
        console.error('Failed to load credit history');
      }
    } catch (error) {
      console.error('Error loading credit history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && distributorId) {
      loadCreditHistory();
    }
  }, [isOpen, distributorId]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREDIT_LIMIT_INCREASED':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'CREDIT_LIMIT_DECREASED':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'CREDIT_LIMIT_SET':
        return <DollarSign className="w-4 h-4 text-blue-600" />;
      case 'CREDIT_USED':
        return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case 'PAYMENT_RECEIVED':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'CREDIT_REVIEWED':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <History className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREDIT_LIMIT_INCREASED':
        return 'Credit Limit Increased';
      case 'CREDIT_LIMIT_DECREASED':
        return 'Credit Limit Decreased';
      case 'CREDIT_LIMIT_SET':
        return 'Credit Limit Set';
      case 'CREDIT_USED':
        return 'Credit Used';
      case 'PAYMENT_RECEIVED':
        return 'Payment Received';
      case 'CREDIT_REVIEWED':
        return 'Credit Reviewed';
      default:
        return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Credit History</h2>
                <p className="text-sm text-gray-600">{distributorName}</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Credit History List */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading credit history...</p>
              </div>
            </div>
          ) : creditHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit History</h3>
              <p className="text-gray-600">No credit activities have been recorded for this distributor yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {creditHistory.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        {getActionIcon(entry.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{getActionLabel(entry.action)}</h4>
                          {entry.amount && (
                            <span className="text-sm font-medium text-gray-600">
                              GHS {entry.amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {/* Credit Limit Changes */}
                        {(entry.previousLimit !== undefined || entry.newLimit !== undefined) && (
                          <div className="text-sm text-gray-600 mb-2">
                            {entry.previousLimit !== undefined && entry.newLimit !== undefined ? (
                              <span>
                                Credit limit changed from <span className="font-medium">GHS {entry.previousLimit.toLocaleString()}</span> to{' '}
                                <span className="font-medium">GHS {entry.newLimit.toLocaleString()}</span>
                              </span>
                            ) : entry.newLimit !== undefined ? (
                              <span>
                                Credit limit set to <span className="font-medium">GHS {entry.newLimit.toLocaleString()}</span>
                              </span>
                            ) : null}
                          </div>
                        )}

                        {/* Credit Used Changes */}
                        {(entry.previousUsed !== undefined || entry.newUsed !== undefined) && (
                          <div className="text-sm text-gray-600 mb-2">
                            {entry.previousUsed !== undefined && entry.newUsed !== undefined ? (
                              <span>
                                Credit used changed from <span className="font-medium">GHS {entry.previousUsed.toLocaleString()}</span> to{' '}
                                <span className="font-medium">GHS {entry.newUsed.toLocaleString()}</span>
                              </span>
                            ) : entry.newUsed !== undefined ? (
                              <span>
                                Credit used set to <span className="font-medium">GHS {entry.newUsed.toLocaleString()}</span>
                              </span>
                            ) : null}
                          </div>
                        )}

                        {/* Reason */}
                        {entry.reason && (
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Reason:</span> {entry.reason}
                          </div>
                        )}

                        {/* Notes */}
                        {entry.notes && (
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Notes:</span> {entry.notes}
                          </div>
                        )}

                        {/* Performed by and date */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{entry.performedByUser.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(entry.performedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-6 border-t mt-6">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
