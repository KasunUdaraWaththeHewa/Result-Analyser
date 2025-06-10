
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Heart, Filter, AlertTriangle } from 'lucide-react';
import { studentApi } from '../services/api';
import { useToast } from '@/hooks/use-toast';

interface MedicalCreditRecord {
  index_number: string;
  student_name: string;
  semester: string;
  subject_code: string;
  subject_name: string;
  mc_used: number;
  total_mc_available: number;
  strategic_use: boolean;
  mc_percentage: number;
}

export const MedicalCredits = () => {
  const [records, setRecords] = useState<MedicalCreditRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalCreditRecord[]>([]);
  const [strategicOnly, setStrategicOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMedicalCredits();
  }, [strategicOnly]);

  useEffect(() => {
    if (strategicOnly) {
      setFilteredRecords(records.filter(record => record.strategic_use));
    } else {
      setFilteredRecords(records);
    }
  }, [records, strategicOnly]);

  const loadMedicalCredits = async () => {
    setLoading(true);
    try {
      const response = await studentApi.getAllMedicalCredits(strategicOnly);
      setRecords(response.data);
      setFilteredRecords(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch medical credits data"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMCUsageColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-100 text-red-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getMCUsageLevel = (percentage: number) => {
    if (percentage >= 80) return 'Critical';
    if (percentage >= 60) return 'High';
    if (percentage >= 40) return 'Moderate';
    return 'Low';
  };

  const totalStudents = new Set(records.map(record => record.index_number)).size;
  const strategicUsers = records.filter(record => record.strategic_use).length;
  const averageMCUsage = records.length > 0 
    ? records.reduce((sum, record) => sum + record.mc_percentage, 0) / records.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Medical Credits</h1>
        <p className="text-muted-foreground">Track and analyze MC usage patterns</p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filters
          </CardTitle>
          <CardDescription>
            Filter medical credit records by strategic usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="strategic"
              checked={strategicOnly}
              onCheckedChange={(checked) => setStrategicOnly(checked as boolean)}
            />
            <label
              htmlFor="strategic"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show only strategic MC usage
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRecords.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strategic Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{strategicUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg MC Usage</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMCUsage.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Credits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Credits Usage</CardTitle>
          <CardDescription>
            {strategicOnly ? 'Strategic MC usage records' : 'All medical credit records'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Index Number</th>
                    <th className="text-left p-3">Student Name</th>
                    <th className="text-left p-3">Semester</th>
                    <th className="text-left p-3">Subject</th>
                    <th className="text-left p-3">MC Used</th>
                    <th className="text-left p-3">MC Available</th>
                    <th className="text-left p-3">Usage %</th>
                    <th className="text-left p-3">Level</th>
                    <th className="text-left p-3">Strategic</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record, index) => (
                    <tr key={index} className="border-b hover:bg-accent/50">
                      <td className="p-3 font-mono">{record.index_number}</td>
                      <td className="p-3">{record.student_name}</td>
                      <td className="p-3">{record.semester}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-mono text-xs">{record.subject_code}</div>
                          <div className="text-xs text-muted-foreground">{record.subject_name}</div>
                        </div>
                      </td>
                      <td className="p-3 font-bold">{record.mc_used}</td>
                      <td className="p-3">{record.total_mc_available}</td>
                      <td className="p-3">
                        <span className="font-bold">{record.mc_percentage.toFixed(1)}%</span>
                      </td>
                      <td className="p-3">
                        <Badge className={getMCUsageColor(record.mc_percentage)}>
                          {getMCUsageLevel(record.mc_percentage)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {record.strategic_use ? (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle size={12} className="mr-1" />
                            Strategic
                          </Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
