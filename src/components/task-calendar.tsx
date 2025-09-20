'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  User,
  Users
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  completedAt?: string;
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

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick?: (date: Date) => void;
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
}

export default function TaskCalendar({ 
  tasks, 
  onTaskClick, 
  onDateClick,
  currentDate = new Date(),
  onDateChange 
}: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  // Get first day of the month and calculate starting date for calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  // Generate calendar days (42 days to fill 6 weeks)
  const calendarDays = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    calendarDays.push(date);
  }

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  // Get tasks for a date range (for week view)
  const getTasksForDateRange = (startDate: Date, endDate: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= startDate && taskDate <= endDate;
    });
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'IN_PROGRESS':
        return <Play className="w-3 h-3 text-blue-500" />;
      case 'PENDING':
        return <Clock className="w-3 h-3 text-gray-500" />;
      case 'CANCELLED':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'OVERDUE':
        return <AlertCircle className="w-3 h-3 text-orange-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  // Get priority color
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

  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    onDateChange?.(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  // Week view functions
  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);

  if (viewMode === 'week') {
    return (
      <div className="space-y-4">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={goToPreviousMonth}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Week
            </Button>
            <Button
              onClick={goToNextMonth}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Next Week
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={goToToday}
              variant="outline"
              size="sm"
            >
              Today
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode('month')}
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
            >
              Month
            </Button>
            <Button
              onClick={() => setViewMode('week')}
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
            >
              Week
            </Button>
            <Button
              onClick={() => setViewMode('day')}
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
            >
              Day
            </Button>
          </div>
        </div>

        {/* Week Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dayTasks = getTasksForDate(date);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            
            return (
              <Card 
                key={index}
                className={`p-4 min-h-[200px] cursor-pointer transition-colors ${
                  isToday ? 'bg-blue-50 border-blue-200' : 
                  isSelected ? 'bg-gray-50 border-gray-300' : 
                  'hover:bg-gray-50'
                }`}
                onClick={() => handleDateClick(date)}
              >
                <div className="text-center mb-3">
                  <div className="text-sm font-medium text-gray-600">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-semibold ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task);
                      }}
                      className={`p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow ${
                        getPriorityColor(task.priority)
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {getStatusIcon(task.status)}
                        <span className="font-medium truncate">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs opacity-75">
                        {task.assignmentType === 'COLLABORATIVE' ? (
                          <Users className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        <span className="truncate">
                          {task.assignmentType === 'COLLABORATIVE' 
                            ? `${task.assignees.length} members`
                            : task.assignee?.name || 'Unassigned'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (viewMode === 'day') {
    const dayTasks = getTasksForDate(selectedDate);
    
    return (
      <div className="space-y-4">
        {/* Day Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={goToPreviousMonth}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Day
            </Button>
            <Button
              onClick={goToNextMonth}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Next Day
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={goToToday}
              variant="outline"
              size="sm"
            >
              Today
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode('month')}
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
            >
              Month
            </Button>
            <Button
              onClick={() => setViewMode('week')}
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
            >
              Week
            </Button>
            <Button
              onClick={() => setViewMode('day')}
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
            >
              Day
            </Button>
          </div>
        </div>

        {/* Day Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        </div>

        {/* Day Tasks */}
        <Card className="p-6">
          {dayTasks.length > 0 ? (
            <div className="space-y-4">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow border ${
                    getPriorityColor(task.priority)
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-semibold">{task.title}</h3>
                      </div>
                      {task.description && (
                        <p className="text-sm opacity-75 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          {task.assignmentType === 'COLLABORATIVE' ? (
                            <Users className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                          <span>
                            {task.assignmentType === 'COLLABORATIVE' 
                              ? `${task.assignees.length} members`
                              : task.assignee?.name || 'Unassigned'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks scheduled for this day</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Month view (default)
  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={goToPreviousMonth}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Month
          </Button>
          <Button
            onClick={goToNextMonth}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            Next Month
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={goToToday}
            variant="outline"
            size="sm"
          >
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setViewMode('month')}
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
          >
            Month
          </Button>
          <Button
            onClick={() => setViewMode('week')}
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
          >
            Week
          </Button>
          <Button
            onClick={() => setViewMode('day')}
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
          >
            Day
          </Button>
        </div>
      </div>

      {/* Month Header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 bg-gray-50">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((date, index) => {
          const dayTasks = getTasksForDate(date);
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();
          
          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${
                isToday ? 'bg-blue-50 border-blue-200' : 
                isSelected ? 'bg-gray-100 border-gray-300' : 
                'hover:bg-gray-50'
              }`}
              onClick={() => handleDateClick(date)}
            >
              <div className={`text-sm font-medium mb-2 ${
                isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              } ${isToday ? 'text-blue-600' : ''}`}>
                {date.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayTasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(task);
                    }}
                    className={`p-1 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow truncate ${
                      getPriorityColor(task.priority)
                    }`}
                    title={task.title}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(task.status)}
                      <span className="truncate">{task.title}</span>
                    </div>
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
