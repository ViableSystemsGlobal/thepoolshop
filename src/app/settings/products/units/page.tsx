"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { 
  Plus, 
  Search, 
  Package, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Ruler,
  Weight,
  Droplets,
  Hash
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Unit {
  id: string;
  name: string;
  symbol: string;
  type: string;
}

export default function UnitsPage() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: "", symbol: "", type: "count" });
  const { getThemeClasses } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/units');
      if (response.ok) {
        const data = await response.json();
        setUnits(data);
      } else {
        console.error('Failed to fetch units');
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.name || !newUnit.symbol) {
      showError("Validation Error", "Name and symbol are required");
      return;
    }

    try {
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUnit),
      });

      if (response.ok) {
        const data = await response.json();
        setUnits([...units, data]);
        setNewUnit({ name: "", symbol: "", type: "count" });
        setIsAddModalOpen(false);
        success("Unit Added", `"${data.name}" has been successfully added.`);
      } else {
        const errorData = await response.json();
        showError("Error", errorData.error || 'Failed to add unit');
      }
    } catch (error) {
      console.error('Error adding unit:', error);
      showError("Network Error", 'Unable to connect to server. Please try again.');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return <Weight className="h-4 w-4" />;
      case 'length':
        return <Ruler className="h-4 w-4" />;
      case 'volume':
        return <Droplets className="h-4 w-4" />;
      case 'count':
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weight':
        return 'text-orange-600';
      case 'length':
        return 'text-blue-600';
      case 'volume':
        return 'text-cyan-600';
      case 'count':
      default:
        return 'text-gray-600';
    }
  };

  const filteredUnits = units.filter(unit => 
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unitTypes = [
    { value: "count", label: "Count" },
    { value: "weight", label: "Weight" },
    { value: "length", label: "Length" },
    { value: "volume", label: "Volume" },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/settings/products')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Product Settings
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Units Management</h1>
              <p className="text-gray-600">Manage measurement units for your products</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-${theme.primaryBg}`}>
                  <Package className={`h-6 w-6 text-${theme.primary}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Units</p>
                  <p className={`text-2xl font-bold text-${theme.primary}`}>{units.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Weight className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Weight Units</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {units.filter(u => u.type === 'weight').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Ruler className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Length Units</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {units.filter(u => u.type === 'length').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-cyan-100">
                  <Droplets className="h-6 w-6 text-cyan-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Volume Units</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {units.filter(u => u.type === 'volume').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search units by name, symbol, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Units Table */}
        <Card>
          <CardHeader>
            <CardTitle>Units ({filteredUnits.length})</CardTitle>
            <CardDescription>
              Manage measurement units used in your product catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Unit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Symbol</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.map((unit) => (
                    <tr key={unit.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className={`p-1 rounded ${getTypeColor(unit.type)}`}>
                            {getTypeIcon(unit.type)}
                          </div>
                          <span className="ml-3 font-medium text-gray-900">{unit.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {unit.symbol}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                          unit.type === 'weight' ? 'bg-orange-100 text-orange-800' :
                          unit.type === 'length' ? 'bg-blue-100 text-blue-800' :
                          unit.type === 'volume' ? 'bg-cyan-100 text-cyan-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {unit.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Unit Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Add New Unit</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  ×
                </Button>
              </div>

              <form onSubmit={handleAddUnit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Name *
                  </label>
                  <Input
                    value={newUnit.name}
                    onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                    placeholder="e.g., Kilograms"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symbol *
                  </label>
                  <Input
                    value={newUnit.symbol}
                    onChange={(e) => setNewUnit({ ...newUnit, symbol: e.target.value })}
                    placeholder="e.g., kg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={newUnit.type}
                    onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {unitTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className={`bg-${theme.primary} hover:bg-${theme.primaryHover} text-white`}
                  >
                    Add Unit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
