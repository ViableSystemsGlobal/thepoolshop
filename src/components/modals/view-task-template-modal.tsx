'use client';

import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { 
  FileText,
  Clock,
  Tag,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface TaskTemplateItem {
  id: string;
  title: string;
  description?: string;
  order: number;
  isRequired: boolean;
}

interface TaskCategory {
  id: string;
  name: string;
  color: string;
}

interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedDuration?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: TaskTemplateItem[];
  creator: {
    id: string;
    name: string;
    email: string;
  };
  category?: TaskCategory;
}

interface ViewTaskTemplateModalProps {
  template: TaskTemplate;
  onClose: () => void;
}

export default function ViewTaskTemplateModal({ template, onClose }: ViewTaskTemplateModalProps) {
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-blue-600 bg-blue-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Not set';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} hours ${remainingMinutes} minutes` : `${hours} hours`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {template.name}
          </DialogTitle>
          <DialogDescription>
            Task template details and checklist items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Information */}
          <div className="space-y-4">
            {template.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{template.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(template.priority)}`}>
                  {template.priority}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Estimated Duration</h3>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  {formatDuration(template.estimatedDuration)}
                </div>
              </div>
            </div>

            {template.category && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
                <span 
                  className="inline-flex px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: template.category.color }}
                >
                  {template.category.name}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Created By</h3>
                <div className="flex items-center gap-1 text-gray-600">
                  <User className="w-4 h-4" />
                  {template.creator.name}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Created</h3>
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {formatDate(template.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Template Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Checklist Items ({template.items.length})
              </h3>
            </div>

            <div className="space-y-3">
              {template.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No checklist items defined</p>
                </div>
              ) : (
                template.items
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {item.isRequired ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            {item.isRequired && (
                              <span className="text-xs text-red-600 font-medium">
                                Required
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={onClose}
            className={`bg-${theme.primary} hover:bg-${theme.primaryDark} text-white`}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
