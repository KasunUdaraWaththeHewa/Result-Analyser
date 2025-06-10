
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart3, Search, Users } from 'lucide-react';
import { studentApi } from '../services/api';
import { useToast } from '@/hooks/use-toast';

interface GPASummaryItem {
  index_number: string;
  student_name: string;
  gpa: number;
  total_credits: number;
  semester: string;
}

export const GPASummary = () => {
  const [allSummaries, setAllSummaries] = useState<GPASummaryItem[]>([]);
  const [singleSummary, setSingleSummary] = useState<GPASummaryItem | null>(null);
  const [indexNumber, setIndexNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAllSummaries();
  }, []);

  const loadAllSummaries = async () => {
    setLoading(true);
    try {
      const response = await studentApi.getAllGPASummary();
      setAllSummaries(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch GPA summaries"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSummary = async () => {
    if (!indexNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an index number"
      });
      return;
    }

    setSearchLoading(true);
    try {
      const response = await studentApi.getGPASummaryByIndex(indexNumber);
      setSingleSummary(response.data);
      toast({
        title: "Success",
        description: "GPA summary found"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch GPA summary for this student"
      });
      setSingleSummary(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGPALevel = (gpa: number) => {
    if (gpa >= 3.5) return 'Excellent';
    if (gpa >= 3.0) return 'Good';
    if (gpa >= 2.5) return 'Average';
    return 'Below Average';
  };

  const averageGPA = allSummaries.length > 0 
    ? allSummaries.reduce((sum, item) => sum + item.gpa, 0) / allSummaries.length
    : 0;

  const highestGPA = allSummaries.length > 0 
    ? Math.max(...allSummaries.map(item => item.gpa))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">GPA Summary</h1>
        <p className="text-muted-foreground">View and analyze student GPA statistics</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search size={20} />
            Search Individual GPA
          </CardTitle>
          <CardDescription>
            Find GPA summary for a specific student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter index number"
              value={indexNumber}
              onChange={(e) => setIndexNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSummary()}
            />
            <Button onClick={handleSearchSummary} disabled={searchLoading}>
              <Search size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Search Result */}
      {singleSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Individual GPA Summary</CardTitle>
            <CardDescription>{singleSummary.student_name} - {singleSummary.index_number}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">GPA</h3>
                <p className={`text-2xl font-bold ${getGPAColor(singleSummary.gpa)}`}>
                  {singleSummary.gpa.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">{getGPALevel(singleSummary.gpa)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Total Credits</h3>
                <p className="text-2xl font-bold">{singleSummary.total_credits}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Semester</h3>
                <p className="text-2xl font-bold">{singleSummary.semester}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allSummaries.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGPAColor(averageGPA)}`}>
              {averageGPA.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest GPA</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {highestGPA.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Students GPA Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students GPA Summary</CardTitle>
          <CardDescription>Complete list of student GPA records</CardDescription>
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
                    <th className="text-left p-3">GPA</th>
                    <th className="text-left p-3">Level</th>
                    <th className="text-left p-3">Credits</th>
                    <th className="text-left p-3">Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {allSummaries.map((summary, index) => (
                    <tr key={index} className="border-b hover:bg-accent/50">
                      <td className="p-3 font-mono">{summary.index_number}</td>
                      <td className="p-3">{summary.student_name}</td>
                      <td className={`p-3 font-bold ${getGPAColor(summary.gpa)}`}>
                        {summary.gpa.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${getGPAColor(summary.gpa)} bg-opacity-10`}>
                          {getGPALevel(summary.gpa)}
                        </span>
                      </td>
                      <td className="p-3">{summary.total_credits}</td>
                      <td className="p-3">{summary.semester}</td>
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
