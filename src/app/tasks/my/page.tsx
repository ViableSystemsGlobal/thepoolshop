'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu } from '@/components/ui/dropdown-menu-custom';
import { useToast } from '@/contexts/toast-context';
import { useTheme } from '@/contexts/theme-context';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock,
  Link, 
  AlertCircle, 
  Play,
  Calendar,
  User,
  Plus,
  Grid3X3,
  List,
  Target,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { AIRecommendationCard } from '@/components/ai-recommendation-card';
import SimpleCreateTaskModal from '@/components/modals/simple-create-task-modal';
import EditTaskModal from '@/components/modals/edit-task-modal';
import TaskSlideout from '@/components/task-slideout';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string;
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
  createdAt: string;
  updatedAt: string;
}

interface TaskStats {
  PENDING?: number;
  IN_PROGRESS?: number;
  COMPLETED?: number;
  CANCELLED?: number;
  OVERDUE?: number;
}

export default function MyTasksPage() {
  const { data: session } = useSession();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { success: showSuccess, error: showError } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [recurringFilter, setRecurringFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const itemsPerPage = 10;
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  useEffect(() => {
    loadTasks();
    setCurrentPage(1);
    setSelectedTasks([]);
  }, [statusFilter, priorityFilter, recurringFilter]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (recurringFilter !== 'all') params.append('recurring', recurringFilter);

      console.log('Loading my tasks from:', `/api/tasks/my?${params}`);
      
      const response = await fetch(`/api/tasks/my?${params}`, {
        credentials: 'include',
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Tasks data received:', data);
        setTasks(data.tasks || []);
        setStats(data.stats || {});
      } else {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          if (errorData && (errorData.error || errorData.message)) {
            errorMessage = errorData.error || errorData.message;
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        showError(`Failed to load tasks: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      showError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsSlideoutOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showSuccess('Task deleted successfully!');
        loadTasks();
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showError('Failed to delete task');
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        showSuccess(`Task "${task.title}" marked as completed!`);
        loadTasks();
      } else {
        const error = await response.json();
        
        // Handle dependency completion errors with more detail
        if (error.incompleteDependencies && error.incompleteDependencies.length > 0) {
          const dependencyNames = error.incompleteDependencies
            .map((dep: any) => dep.title)
            .join(', ');
          showError(
            `Cannot complete task. Complete these dependencies first: ${dependencyNames}`
          );
        } else {
          showError(error.error || 'Failed to complete task');
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
      showError('Failed to complete task');
    }
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === paginatedTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(paginatedTasks.map(task => task.id));
    }
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleBulkComplete = async () => {
    try {
      const promises = selectedTasks.map(taskId => 
        fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
          }),
        })
      );

      const responses = await Promise.all(promises);
      const successCount = responses.filter(response => response.ok).length;
      const failedCount = responses.length - successCount;

      if (successCount === selectedTasks.length) {
        showSuccess(`Successfully completed ${successCount} tasks!`);
      } else {
        if (failedCount > 0) {
          showError(
            `Completed ${successCount} of ${selectedTasks.length} tasks. Some tasks have incomplete dependencies.`
          );
        } else {
          showError(`Completed ${successCount} of ${selectedTasks.length} tasks`);
        }
      }

      setSelectedTasks([]);
      loadTasks();
    } catch (error) {
      console.error('Error completing tasks:', error);
      showError('Failed to complete tasks');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
      return;
    }

    try {
      const promises = selectedTasks.map(taskId => 
        fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        })
      );

      const responses = await Promise.all(promises);
      const successCount = responses.filter(response => response.ok).length;

      if (successCount === selectedTasks.length) {
        showSuccess(`Successfully deleted ${successCount} tasks!`);
      } else {
        showError(`Deleted ${successCount} of ${selectedTasks.length} tasks`);
      }

      setSelectedTasks([]);
      loadTasks();
    } catch (error) {
      console.error('Error deleting tasks:', error);
      showError('Failed to delete tasks');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      case 'CANCELLED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'IN_PROGRESS':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'OVERDUE':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === 'COMPLETED' && { completedAt: new Date().toISOString() }),
        }),
      });

      if (response.ok) {
        showSuccess('Task status updated successfully!');
        loadTasks();
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      showError('Failed to update task status');
    }
  };

  // Helper function to check if task has incomplete dependencies
  const hasIncompleteDependencies = (task: Task) => {
    return task.dependencies.some(dep => dep.dependsOnTask.status !== 'COMPLETED');
  };

  // Helper function to get dependency status text
  const getDependencyStatusText = (task: Task) => {
    const incompleteCount = task.dependencies.filter(dep => dep.dependsOnTask.status !== 'COMPLETED').length;
    if (incompleteCount === 0) return null;
    return `${incompleteCount} dependency${incompleteCount > 1 ? 'ies' : 'y'} pending`;
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', task.id);
      e.dataTransfer.effectAllowed = 'move';
    };

    return (
      <Card 
        className="p-4 mb-3 hover:shadow-md transition-shadow cursor-move"
        draggable
        onDragStart={handleDragStart}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
          <div className="flex items-center gap-1">
            <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.status === 'OVERDUE' && (
              <span className="text-red-500 text-xs">🚨</span>
            )}
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>
              {task.assignees.length > 0 ? (
                task.assignees.length > 1 
                  ? `${task.assignees[0].user.name} +${task.assignees.length - 1}`
                  : task.assignees[0].user.name
              ) : task.assignee ? (
                task.assignee.name
              ) : (
                'Unassigned'
              )}
            </span>
            {task.assignmentType === 'COLLABORATIVE' && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                Team
              </span>
            )}
          </div>
          
          {/* Dependency Indicators */}
          {task.dependencies.length > 0 && (
            <div className="flex items-center gap-1">
              <Link className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {task.dependencies.length} dep{task.dependencies.length > 1 ? 's' : ''}
              </span>
              {hasIncompleteDependencies(task) && (
                <span className="text-xs text-orange-600 font-medium">
                  (blocked)
                </span>
              )}
            </div>
          )}
          
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Complete Task Button */}
        {task.status !== 'COMPLETED' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button
              size="sm"
              variant="outline"
              className={`w-full ${
                hasIncompleteDependencies(task)
                  ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'text-green-600 border-green-200 hover:bg-green-50'
              }`}
              disabled={hasIncompleteDependencies(task)}
              onClick={(e) => {
                e.stopPropagation();
                if (!hasIncompleteDependencies(task)) {
                  handleCompleteTask(task);
                }
              }}
              title={
                hasIncompleteDependencies(task)
                  ? getDependencyStatusText(task) || 'Complete dependencies first'
                  : 'Complete task'
              }
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              {hasIncompleteDependencies(task) ? 'Blocked' : 'Complete'}
            </Button>
          </div>
        )}
      </Card>
    );
  };

  const KanbanColumn = ({ status, title, tasks, count }: { 
    status: string; 
    title: string; 
    tasks: Task[]; 
    count: number;
  }) => {
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('text/plain');
      
      // Don't update if the task is already in this status
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status === status) {
        return;
      }
      
      updateTaskStatus(taskId, status);
    };

    return (
      <div className="flex-1 min-w-0">
        <div 
          className="bg-gray-50 rounded-lg p-4 min-h-[400px] transition-colors hover:bg-gray-100"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <h3 className="font-medium text-gray-900">{title}</h3>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                {count}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Drop tasks here
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Filter tasks based on search
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your tasks...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Group tasks by status for Kanban view
  const groupedTasks = {
    PENDING: filteredTasks.filter(task => task.status === 'PENDING'),
    IN_PROGRESS: filteredTasks.filter(task => task.status === 'IN_PROGRESS'),
    COMPLETED: filteredTasks.filter(task => task.status === 'COMPLETED'),
    CANCELLED: filteredTasks.filter(task => task.status === 'CANCELLED'),
    OVERDUE: filteredTasks.filter(task => task.status === 'OVERDUE'),
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-gray-600">Tasks assigned to you</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
              variant="outline"
              className="flex items-center gap-2"
            >
              {viewMode === 'kanban' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
            </Button>
            <Button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className={`bg-${themeClasses.primary} text-white hover:bg-${themeClasses.primaryDark} flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
          </div>
        </div>

        {/* AI Recommendation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="flex">
            <div className="w-full h-full">
              <AIRecommendationCard
                title="My Tasks AI"
                subtitle="Your personalized task optimization assistant"
                recommendations={[
                  {
                    id: 'completed-progress',
                    title: 'Great Progress!',
                    description: `${stats.COMPLETED || 0} tasks completed this week. Keep up the momentum!`,
                    priority: 'high',
                    completed: false
                  },
                  {
                    id: 'overdue-warning',
                    title: 'Overdue Tasks',
                    description: `${stats.OVERDUE || 0} tasks are overdue. Consider prioritizing these tasks.`,
                    priority: 'high',
                    completed: false
                  },
                  {
                    id: 'in-progress-info',
                    title: 'In Progress',
                    description: `${stats.IN_PROGRESS || 0} tasks are currently being worked on. Stay focused!`,
                    priority: 'medium',
                    completed: false
                  }
                ]}
                onRecommendationComplete={(id) => {
                  console.log('Recommendation completed:', id);
                }}
                className="h-full"
              />
            </div>
          </div>
          
          {/* Enhanced Stats Cards */}
          <div className="flex">
            <div className="grid grid-cols-3 gap-3 w-full">
              {/* Total Tasks */}
              <Card className="p-3 h-18">
                <div className="flex items-center justify-between h-full">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total</p>
                    <p className="text-base font-bold text-gray-900">
                      {Object.values(stats).reduce((sum, count) => sum + (count || 0), 0)}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                </div>
              </Card>

              {/* Completed Tasks */}
              <Card className="p-3 h-18">
                <div className="flex items-center justify-between h-full">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Done</p>
                    <p className="text-base font-bold text-green-600">{stats.COMPLETED || 0}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  </div>
                </div>
              </Card>

              {/* In Progress */}
              <Card className="p-3 h-18">
                <div className="flex items-center justify-between h-full">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Active</p>
                    <p className="text-base font-bold text-blue-600">{stats.IN_PROGRESS || 0}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Play className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                </div>
              </Card>

              {/* Overdue Tasks */}
              <Card className="p-3 h-18">
                <div className="flex items-center justify-between h-full">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Due</p>
                    <p className="text-base font-bold text-red-600">{stats.OVERDUE || 0}</p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  </div>
                </div>
              </Card>

              {/* Pending Tasks */}
              <Card className="p-3 h-18">
                <div className="flex items-center justify-between h-full">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Pending</p>
                    <p className="text-base font-bold text-gray-600">{stats.PENDING || 0}</p>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                </div>
              </Card>

              {/* Completion Rate */}
              <Card className="p-3 h-18">
                <div className="flex items-center justify-between h-full">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Rate</p>
                    <p className="text-base font-bold text-green-600">
                      {Object.values(stats).reduce((sum, count) => sum + (count || 0), 0) > 0 
                        ? Math.round(((stats.COMPLETED || 0) / Object.values(stats).reduce((sum, count) => sum + (count || 0), 0)) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>


        {/* Content */}
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <KanbanColumn 
              status="PENDING" 
              title="Pending" 
              tasks={groupedTasks.PENDING} 
              count={groupedTasks.PENDING.length} 
            />
            <KanbanColumn 
              status="IN_PROGRESS" 
              title="In Progress" 
              tasks={groupedTasks.IN_PROGRESS} 
              count={groupedTasks.IN_PROGRESS.length} 
            />
            <KanbanColumn 
              status="COMPLETED" 
              title="Completed" 
              tasks={groupedTasks.COMPLETED} 
              count={groupedTasks.COMPLETED.length} 
            />
            <KanbanColumn 
              status="CANCELLED" 
              title="Cancelled" 
              tasks={groupedTasks.CANCELLED} 
              count={groupedTasks.CANCELLED.length} 
            />
            <KanbanColumn 
              status="OVERDUE" 
              title="Overdue" 
              tasks={groupedTasks.OVERDUE} 
              count={groupedTasks.OVERDUE.length} 
            />
          </div>
        ) : (
          <Card className="p-4">
            {/* Search and Filters - Integrated with Table */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowMoreFilters(!showMoreFilters)}
                  className="flex items-center gap-2 w-full md:w-auto"
                >
                  <Filter className="w-4 h-4" />
                  More Filters
                </Button>
              </div>
              {showMoreFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="OVERDUE">Overdue</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      id="priorityFilter"
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Priorities</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="recurringFilter" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      id="recurringFilter"
                      value={recurringFilter}
                      onChange={(e) => setRecurringFilter(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">All Tasks</option>
                      <option value="recurring">Recurring Only</option>
                      <option value="non-recurring">Non-Recurring Only</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Actions Bar */}
            {selectedTasks.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkComplete}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkDelete}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTasks([])}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="w-12 py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedTasks.length === paginatedTasks.length && paginatedTasks.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Task</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Team Members</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTasks.length > 0 ? (
                    paginatedTasks.map(task => (
                      <tr 
                        key={task.id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${selectedTasks.includes(task.id) ? 'bg-blue-50' : ''}`}
                        onClick={() => handleViewTask(task)}
                      >
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => handleSelectTask(task.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              {task.dependencies.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Link className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {task.dependencies.length} dep{task.dependencies.length > 1 ? 's' : ''}
                                  </span>
                                  {hasIncompleteDependencies(task) && (
                                    <span className="text-xs text-orange-600 font-medium">
                                      (blocked)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 line-clamp-1">{task.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {task.assignees.length > 1 
                                ? `${task.assignees[0].user.name} +${task.assignees.length - 1} more`
                                : task.assignees.length === 1 
                                  ? task.assignees[0].user.name
                                  : task.assignee 
                                    ? task.assignee.name
                                    : 'You'
                              }
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs px-2 py-1 rounded border ${
                            task.assignmentType === 'COLLABORATIVE' 
                              ? 'bg-blue-100 text-blue-700 border-blue-200' 
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {task.assignmentType === 'COLLABORATIVE' ? 'Team' : 'Individual'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu
                              trigger={
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              }
                            items={[
                              {
                                label: 'View Details',
                                icon: <Eye className="w-4 h-4 mr-2" />,
                                onClick: () => handleViewTask(task)
                              },
                              {
                                label: 'Edit Task',
                                icon: <Edit className="w-4 h-4 mr-2" />,
                                onClick: () => handleEditTask(task)
                              },
                              ...(task.status !== 'COMPLETED' ? [{
                                label: 'Complete Task',
                                icon: <CheckCircle className="w-4 h-4 mr-2" />,
                                onClick: () => handleCompleteTask(task),
                                className: 'text-green-600'
                              }] : []),
                              {
                                label: 'Delete Task',
                                icon: <Trash2 className="w-4 h-4 mr-2" />,
                                onClick: () => handleDeleteTask(task.id),
                                className: 'text-red-600'
                              }
                            ]}
                          />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500">
                        No tasks found for you.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredTasks.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTasks.length)} of {filteredTasks.length} tasks
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      setSelectedTasks([]);
                    }}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          setSelectedTasks([]);
                        }}
                        className={`px-3 py-1 text-sm rounded ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      setSelectedTasks([]);
                    }}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Modals */}
        <SimpleCreateTaskModal
          isOpen={isCreateTaskModalOpen}
          onClose={() => setIsCreateTaskModalOpen(false)}
          onTaskCreated={loadTasks}
        />
        {selectedTask && (
          <>
            <EditTaskModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              task={selectedTask}
              onTaskUpdated={loadTasks}
            />
            <TaskSlideout
              isOpen={isSlideoutOpen}
              onClose={() => {
                setIsSlideoutOpen(false);
                setSelectedTask(null);
              }}
              task={selectedTask}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
}
