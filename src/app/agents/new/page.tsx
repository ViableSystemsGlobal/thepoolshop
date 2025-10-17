"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  MapPin,
  Users,
  Target,
  DollarSign,
  Calendar,
  FileText
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

interface Agent {
  id: string;
  agentCode: string;
  user: User;
  status: string;
  territory?: string;
  team?: string;
  managerId?: string;
  commissionRate: number;
  targetMonthly?: number;
  targetQuarterly?: number;
  targetAnnual?: number;
  notes?: string;
}

export default function NewAgentPage() {
  const { getThemeClasses, getThemeColor } = useTheme();
  const theme = getThemeClasses();
  const { success, error: showError } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [formData, setFormData] = useState({
    userId: "",
    status: "ACTIVE",
    hireDate: new Date().toISOString().split('T')[0],
    territory: "",
    team: "",
    managerId: "",
    commissionRate: 0,
    targetMonthly: "",
    targetQuarterly: "",
    targetAnnual: "",
    notes: ""
  });

  useEffect(() => {
    fetchUsers();
    fetchAgents();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/public');
      if (response.ok) {
        const data = await response.json();
        // Filter out users who are already agents
        setUsers(data.users.filter((user: User) => user.isActive));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId) {
      showError("Validation Error", "Please select a user");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId,
          status: formData.status,
          hireDate: formData.hireDate,
          territory: formData.territory || null,
          team: formData.team || null,
          managerId: formData.managerId || null,
          commissionRate: parseFloat(formData.commissionRate.toString()) || 0,
          targetMonthly: formData.targetMonthly ? parseFloat(formData.targetMonthly) : null,
          targetQuarterly: formData.targetQuarterly ? parseFloat(formData.targetQuarterly) : null,
          targetAnnual: formData.targetAnnual ? parseFloat(formData.targetAnnual) : null,
          notes: formData.notes || null
        }),
      });

      if (response.ok) {
        const newAgent = await response.json();
        success("Agent Created", `Agent ${newAgent.agentCode} has been successfully created for ${newAgent.user.name}`);
        router.push('/agents');
      } else {
        const errorData = await response.json();
        showError("Error", errorData.error || 'Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      showError("Network Error", 'Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectedUser = users.find(user => user.id === formData.userId);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Agent</h1>
              <p className="text-gray-600">Create a new sales agent and assign them to your team</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>User Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="userId">Select User *</Label>
                  <Select value={formData.userId} onValueChange={(value) => handleInputChange('userId', value)}>
                    <option value="">Choose a user to make an agent</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email} ({user.role})
                      </option>
                    ))}
                  </Select>
                </div>

                {selectedUser && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Selected User Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {selectedUser.name}</p>
                      <p><strong>Email:</strong> {selectedUser.email}</p>
                      <p><strong>Phone:</strong> {selectedUser.phone || 'Not provided'}</p>
                      <p><strong>Role:</strong> {selectedUser.role}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agent Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Agent Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="managerId">Manager (Optional)</Label>
                  <Select value={formData.managerId} onValueChange={(value) => handleInputChange('managerId', value)}>
                    <option value="">No Manager</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.agentCode} - {agent.user.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Territory & Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Territory & Team</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="territory">Territory</Label>
                  <Input
                    id="territory"
                    value={formData.territory}
                    onChange={(e) => handleInputChange('territory', e.target.value)}
                    placeholder="e.g., North Region, Accra, Kumasi"
                  />
                </div>

                <div>
                  <Label htmlFor="team">Team</Label>
                  <Input
                    id="team"
                    value={formData.team}
                    onChange={(e) => handleInputChange('team', e.target.value)}
                    placeholder="e.g., Sales Team A, Enterprise Team"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Commission & Targets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Commission & Targets</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commissionRate}
                    onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 5.5"
                  />
                </div>

                <div>
                  <Label htmlFor="targetMonthly">Monthly Target (GH₵)</Label>
                  <Input
                    id="targetMonthly"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.targetMonthly}
                    onChange={(e) => handleInputChange('targetMonthly', e.target.value)}
                    placeholder="e.g., 50000"
                  />
                </div>

                <div>
                  <Label htmlFor="targetQuarterly">Quarterly Target (GH₵)</Label>
                  <Input
                    id="targetQuarterly"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.targetQuarterly}
                    onChange={(e) => handleInputChange('targetQuarterly', e.target.value)}
                    placeholder="e.g., 150000"
                  />
                </div>

                <div>
                  <Label htmlFor="targetAnnual">Annual Target (GH₵)</Label>
                  <Input
                    id="targetAnnual"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.targetAnnual}
                    onChange={(e) => handleInputChange('targetAnnual', e.target.value)}
                    placeholder="e.g., 600000"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Additional Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes about this agent..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.userId}
              style={{ backgroundColor: getThemeColor(), color: 'white' }}
              className="hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Agent...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Agent
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
