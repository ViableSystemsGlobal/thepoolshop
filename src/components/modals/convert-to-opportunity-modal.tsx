'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';

interface ConvertToOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (stage: string) => void;
  leadName: string;
}

const opportunityStages = [
  { key: 'NEW_OPPORTUNITY', label: 'New Opportunity', description: 'Fresh opportunity from lead conversion' },
  { key: 'QUOTE_SENT', label: 'Quote Sent', description: 'Ready to send a quote' },
  { key: 'NEGOTIATION', label: 'Negotiation', description: 'In active negotiations' },
  { key: 'CONTRACT_SIGNED', label: 'Contract Signed', description: 'Contract has been signed' },
  { key: 'WON', label: 'Won', description: 'Deal has been won' },
  { key: 'LOST', label: 'Lost', description: 'Deal has been lost' },
];

export function ConvertToOpportunityModal({
  isOpen,
  onClose,
  onConvert,
  leadName,
}: ConvertToOpportunityModalProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error } = useToast();
  const [selectedStage, setSelectedStage] = useState('NEW_OPPORTUNITY');
  const [isConverting, setIsConverting] = useState(false);

  if (!isOpen) return null;

  const handleConvert = async () => {
    try {
      setIsConverting(true);
      await onConvert(selectedStage);
      success(`Lead converted to opportunity at ${opportunityStages.find(s => s.key === selectedStage)?.label} stage!`);
      onClose();
    } catch (err) {
      error('Failed to convert lead to opportunity');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Convert Lead to Opportunity</h3>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            Convert <span className="font-medium">{leadName}</span> to an opportunity:
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <Label className="text-sm font-medium">Select Initial Stage:</Label>
          {opportunityStages.map((stage) => (
            <div
              key={stage.key}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedStage === stage.key
                  ? `border-${theme.primary} bg-${theme.primaryBg}`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedStage(stage.key)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="stage"
                  value={stage.key}
                  checked={selectedStage === stage.key}
                  onChange={() => setSelectedStage(stage.key)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">{stage.label}</div>
                  <div className="text-sm text-gray-500">{stage.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isConverting}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConvert}
            disabled={isConverting}
            className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
            style={{
              backgroundColor: theme.primary,
              color: 'white'
            }}
          >
            {isConverting ? 'Converting...' : 'Convert to Opportunity'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
