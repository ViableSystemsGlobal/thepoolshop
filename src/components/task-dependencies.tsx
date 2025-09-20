'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/contexts/toast-context';
import { 
  Link, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  X
} from 'lucide-react';

interface Dependency {
  id: string;
  task: {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    assignee?: {
      id: string;
      name: string;
      email: string;
    };
  };
  type: 'depends_on' | 'dependency_of';
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
}

interface TaskDependenciesProps {
  taskId: string;
  currentTaskTitle?: string;
  onDependenciesChange?: () => void;
}

export default function TaskDependencies({ 
  taskId, 
  currentTaskTitle,
  onDependenciesChange 
}: TaskDependenciesProps) {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [dependents, setDependents] = useState<Dependency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingDependency, setIsAddingDependency] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    loadDependencies();
  }, [taskId]);

  const loadDependencies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${taskId}/dependencies`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setDependencies(data.dependencies || []);
        setDependents(data.dependents || []);
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to load dependencies');
      }
    } catch (error) {
      console.error('Error loading dependencies:', error);
      showError('Failed to load dependencies');
    } finally {
      setIsLoading(false);
    }
  };

  const searchTasks = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`/api/tasks?search=${encodeURIComponent(term)}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out the current task and already dependent tasks
        const currentTaskId = taskId;
        const dependentTaskIds = dependencies.map(dep => dep.task.id);
        
        const filteredTasks = data.tasks.filter((task: Task) => 
          task.id !== currentTaskId && 
          !dependentTaskIds.includes(task.id)
        );
        
        setSearchResults(filteredTasks);
      }
    } catch (error) {
      console.error('Error searching tasks:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addDependency = async (dependentTaskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/dependencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dependentTaskId }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Dependency added successfully');
        loadDependencies();
        onDependenciesChange?.();
        setSearchTerm('');
        setSearchResults([]);
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to add dependency');
      }
    } catch (error) {
      console.error('Error adding dependency:', error);
      showError('Failed to add dependency');
    }
  };

  const removeDependency = async (dependentTaskId: string) => {
    try {
      const response = await fetch(
        `/api/tasks/${taskId}/dependencies?dependentTaskId=${dependentTaskId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        showSuccess('Dependency removed successfully');
        loadDependencies();
        onDependenciesChange?.();
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to remove dependency');
      }
    } catch (error) {
      console.error('Error removing dependency:', error);
      showError('Failed to remove dependency');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'OVERDUE':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dependencies</h3>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Dependencies</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingDependency(!isAddingDependency)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Dependency
        </Button>
      </div>

      {/* Add Dependency Section */}
      {isAddingDependency && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-blue-900">Add New Dependency</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingDependency(false);
                  setSearchTerm('');
                  setSearchResults([]);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tasks to add as dependency..."
                value={searchTerm}
                onChange={(e) => {
                  const term = e.target.value;
                  setSearchTerm(term);
                  searchTasks(term);
                }}
                className="pl-9"
              />
            </div>

            {/* Search Results */}
            {searchTerm && (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {isSearching ? (
                  <div className="text-center py-4 text-gray-500">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addDependency(task.id)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        Add
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No tasks found
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Dependencies List */}
      <div className="space-y-3">
        {/* This task depends on */}
        {dependencies.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              This task depends on ({dependencies.length})
            </h4>
            <div className="space-y-2">
              {dependencies.map((dependency) => (
                <Card key={dependency.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link className="w-4 h-4 text-blue-500" />
                      {getStatusIcon(dependency.task.status)}
                      <div>
                        <p className="font-medium text-gray-900">{dependency.task.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(dependency.task.priority)}`}>
                            {dependency.task.priority}
                          </span>
                          {dependency.task.dueDate && (
                            <span>Due: {new Date(dependency.task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDependency(dependency.task.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tasks that depend on this task */}
        {dependents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Tasks that depend on this ({dependents.length})
            </h4>
            <div className="space-y-2">
              {dependents.map((dependent) => (
                <Card key={dependent.id} className="p-3 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Link className="w-4 h-4 text-gray-500 rotate-180" />
                    {getStatusIcon(dependent.task.status)}
                    <div>
                      <p className="font-medium text-gray-900">{dependent.task.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(dependent.task.priority)}`}>
                          {dependent.task.priority}
                        </span>
                        {dependent.task.dueDate && (
                          <span>Due: {new Date(dependent.task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {dependencies.length === 0 && dependents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Link className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No dependencies configured</p>
            <p className="text-sm">Add dependencies to create task relationships</p>
          </div>
        )}
      </div>
    </div>
  );
}
