'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface Source {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface SourceSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SourceSelect({ label, value, onChange, placeholder, disabled }: SourceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch sources on mount
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await fetch('/api/lead-sources', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setSources(data.sources || []);
        }
      } catch (error) {
        console.error('Error fetching sources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, []);

  const filteredSources = sources.filter(source =>
    source.isActive && source.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = useCallback(
    (source: Source) => {
      onChange(source.name);
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    },
    [onChange]
  );

  const handleCreateSource = async () => {
    if (!newSourceName.trim()) return;

    try {
      const response = await fetch('/api/lead-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newSourceName.trim(),
          description: null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSources(prev => [...prev, data.source]);
        onChange(data.source.name);
        setNewSourceName('');
        setIsCreating(false);
        setIsOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create source');
      }
    } catch (error) {
      console.error('Error creating source:', error);
      alert('Failed to create source');
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        const maxIndex = isCreating ? filteredSources.length : filteredSources.length - 1;
        setHighlightedIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (isCreating && newSourceName.trim()) {
          handleCreateSource();
        } else if (highlightedIndex !== -1 && filteredSources[highlightedIndex]) {
          handleSelect(filteredSources[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
        setIsCreating(false);
        setNewSourceName('');
        inputRef.current?.blur();
      }
    },
    [highlightedIndex, filteredSources, isCreating, newSourceName, handleSelect, handleCreateSource]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setNewSourceName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && filteredSources.length > 0 && highlightedIndex === -1) {
      setHighlightedIndex(0);
    }
  }, [isOpen, filteredSources, highlightedIndex]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Label htmlFor={`source-select-${label}`}>{label}</Label>
      <div
        className={cn(
          'flex items-center gap-2 border border-gray-300 rounded-md p-2 min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'
        )}
        onClick={() => !disabled && setIsOpen(true)}
      >
        <Input
          id={`source-select-${label}`}
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 border-none focus:ring-0 focus:outline-none p-0 h-auto bg-transparent"
          disabled={disabled}
        />
        {!disabled && (
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-500 transition-transform duration-200',
              isOpen ? 'rotate-180' : 'rotate-0'
            )}
          />
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-2 text-sm text-gray-500">Loading sources...</div>
          ) : (
            <>
              {/* Create new source option */}
              {!isCreating ? (
                <div
                  className="cursor-pointer p-2 text-sm hover:bg-gray-100 border-b border-gray-200 flex items-center gap-2 text-blue-600"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsCreating(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Create new source
                </div>
              ) : (
                <div className="p-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={newSourceName}
                      onChange={(e) => setNewSourceName(e.target.value)}
                      placeholder="Enter source name"
                      className="flex-1 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCreateSource();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsCreating(false);
                          setNewSourceName('');
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateSource();
                      }}
                      disabled={!newSourceName.trim()}
                      className="h-8 px-2"
                      type="button"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsCreating(false);
                        setNewSourceName('');
                      }}
                      className="h-8 px-2"
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Sources list */}
              {filteredSources.length > 0 ? (
                filteredSources.map((source, index) => (
                  <div
                    key={source.id}
                    className={cn(
                      'cursor-pointer p-2 text-sm hover:bg-gray-100',
                      highlightedIndex === index ? 'bg-gray-100' : ''
                    )}
                    onClick={() => handleSelect(source)}
                  >
                    <div className="font-medium">{source.name}</div>
                    {source.description && (
                      <div className="text-gray-500 text-xs">{source.description}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">
                  {searchTerm ? 'No sources found matching your search.' : 'No sources available.'}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
