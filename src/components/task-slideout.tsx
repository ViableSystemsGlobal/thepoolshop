'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/toast-context';
import { TaskComments } from '@/components/task-comments';
import { TaskAttachments } from '@/components/task-attachments';
import TaskDependencies from '@/components/task-dependencies';
import { X, Calendar, User, Clock, CheckCircle, AlertCircle, XCircle, Play, Link } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string; // Legacy field
  assignmentType: 'INDIVIDUAL' | 'COLLABORATIVE';
  createdBy: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
  assignees: {
    id: string;
    userId: string;
    status: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
  dependencies: {
    id: string;
    dependsOnTask: {
      id: string;
      title: string;
      status: string;
      priority: string;
      dueDate?: string;
    };
  }[];
  dependentTasks: {
    id: string;
    task: {
      id: string;
      title: string;
      status: string;
      priority: string;
      dueDate?: string;
    };
  }[];
}

interface TaskSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function TaskSlideout({ isOpen, onClose, task }: TaskSlideoutProps) {
  const { success: showSuccess } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'OVERDUE':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'OVERDUE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!task) return null;

  return (
    <>
      {/* Slide-out Panel */}
      <div 
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-full max-w-2xl bg-white shadow-2xl z-[1] transform transition-transform duration-1000 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${!isOpen ? 'pointer-events-none' : ''}`}
        onClick={(e) => {
          // Close when clicking outside the content area
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              {getStatusIcon(task.status)}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
                <p className="text-sm text-gray-500">Task Details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{task.description}</p>
                </div>
              )}

              {/* Status, Priority, and Assignment Type */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <span className={`text-sm px-3 py-1 rounded border ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Priority</h3>
                  <span className={`text-sm px-3 py-1 rounded border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Assignment Type</h3>
                  <span className={`text-sm px-3 py-1 rounded border ${
                    task.assignmentType === 'COLLABORATIVE' 
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-green-100 text-green-800 border-green-200'
                  }`}>
                    {task.assignmentType === 'COLLABORATIVE' ? 'Team Task' : 'Individual Task'}
                  </span>
                </div>
              </div>

              {/* Assignees and Creator */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {task.assignmentType === 'COLLABORATIVE' ? 'Team Members' : 'Assignee'}
                  </h3>
                  {task.assignees.length > 0 ? (
                    <div className="space-y-2">
                      {task.assignees.map((assignee) => (
                        <div key={assignee.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <User className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{assignee.user.name}</p>
                            <p className="text-sm text-gray-500">{assignee.user.email}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(assignee.status)}`}>
                            {assignee.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : task.assignee ? (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{task.assignee.name}</p>
                        <p className="text-sm text-gray-500">{task.assignee.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-center text-gray-500">
                      No assignees
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Created By</h3>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{task.creator.name}</p>
                      <p className="text-sm text-gray-500">{task.creator.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                {task.dueDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Due Date</h3>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {task.completedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Completed At</h3>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-900">
                        {new Date(task.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Created</h3>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dependencies Section */}
              {(task.dependencies.length > 0 || task.dependentTasks.length > 0) && (
                <div className="space-y-6">
                  {/* Dependencies (tasks this task depends on) */}
                  {task.dependencies.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        Dependencies ({task.dependencies.length})
                      </h3>
                      <div className="space-y-2">
                        {task.dependencies.map((dep) => (
                          <div key={dep.id} className="p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{dep.dependsOnTask.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(dep.dependsOnTask.status)}`}>
                                    {dep.dependsOnTask.status.replace('_', ' ')}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(dep.dependsOnTask.priority)}`}>
                                    {dep.dependsOnTask.priority}
                                  </span>
                                  {dep.dependsOnTask.dueDate && (
                                    <span className="text-xs text-gray-500">
                                      Due: {new Date(dep.dependsOnTask.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dependent Tasks (tasks that depend on this task) */}
                  {task.dependentTasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        Dependent Tasks ({task.dependentTasks.length})
                      </h3>
                      <div className="space-y-2">
                        {task.dependentTasks.map((dep) => (
                          <div key={dep.id} className="p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{dep.task.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(dep.task.status)}`}>
                                    {dep.task.status.replace('_', ' ')}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(dep.task.priority)}`}>
                                    {dep.task.priority}
                                  </span>
                                  {dep.task.dueDate && (
                                    <span className="text-xs text-gray-500">
                                      Due: {new Date(dep.task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Attachments Section */}
              <div className="border-t border-gray-200 pt-6">
                <TaskAttachments taskId={task.id} />
              </div>

              {/* Comments Section */}
              <div className="border-t border-gray-200 pt-6">
                <TaskComments taskId={task.id} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
