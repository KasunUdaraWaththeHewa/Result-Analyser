
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { studentApi } from '../services/api';
import { useToast } from '@/hooks/use-toast';

interface DifficultySummary {
  subject_code: string;
  subject_name: string;
  total_students: number;
  pass_rate: number;
  average_grade: number;
  difficulty_level: string;
  grade_distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}

export const SubjectDifficulty = () => {
  const [allDifficulties, setAllDifficulties] = useState<DifficultySummary[]>([]);
  const [singleDifficulty, setSingleDifficulty] = useState<DifficultySummary | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAllDifficulties();
  }, []);

  const loadAllDifficulties = async () => {
    setLoading(true);
    try {
      const response = await studentApi.getAllDifficultySummary();
      setAllDifficulties(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch difficulty summaries"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDifficulty = async () => {
    if (!subjectCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a subject code"
      });
      return;
    }

    setSearchLoading(true);
    try {
      const response = await studentApi.getDifficultySummaryBySubject(subjectCode);
      setSingleDifficulty(response.data);
      toast({
        title: "Success",
        description: "Subject difficulty data loaded"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch difficulty data for this subject"
      });
      setSingleDifficulty(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-orange-100 text-orange-800';
      case 'very hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'moderate':
        return <TrendingUp size={16} className="text-yellow-600" />;
      case 'hard':
      case 'very hard':
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return <TrendingUp size={16} className="text-gray-600" />;
    }
  };

  const getPassRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const averagePassRate = allDifficulties.length > 0 
    ? allDifficulties.reduce((sum, item) => sum + item.pass_rate, 0) / allDifficulties.length
    : 0;

  const hardestSubjects = allDifficulties
    .filter(subject => subject.difficulty_level.toLowerCase().includes('hard'))
    .length;

  const easiestSubjects = allDifficulties
    .filter(subject => subject.difficulty_level.toLowerCase() === 'easy')
    .length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Subject Difficulty</h1>
        <p className="text-muted-foreground">Analyze subject difficulty and performance statistics</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search size={20} />
            Search Subject Difficulty
          </CardTitle>
          <CardDescription>
            Find difficulty analysis for a specific subject
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter subject code (e.g., CS1010)"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchDifficulty()}
            />
            <Button onClick={handleSearchDifficulty} disabled={searchLoading}>
              <Search size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Search Result */}
      {singleDifficulty && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getDifficultyIcon(singleDifficulty.difficulty_level)}
              {singleDifficulty.subject_code} - Difficulty Analysis
            </CardTitle>
            <CardDescription>{singleDifficulty.subject_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Pass Rate</h3>
                    <p className={`text-2xl font-bold ${getPassRateColor(singleDifficulty.pass_rate)}`}>
                      {singleDifficulty.pass_rate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Total Students</h3>
                    <p className="text-2xl font-bold">{singleDifficulty.total_students}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Average Grade</h3>
                    <p className="text-2xl font-bold">{singleDifficulty.average_grade.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Difficulty</h3>
                    <Badge className={getDifficultyColor(singleDifficulty.difficulty_level)}>
                      {singleDifficulty.difficulty_level}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">Grade Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(singleDifficulty.grade_distribution).map(([grade, count]) => (
                    <div key={grade} className="flex justify-between items-center">
                      <span className="font-medium">Grade {grade}:</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-2 bg-primary rounded"
                          style={{ 
                            width: `${(count / singleDifficulty.total_students) * 100}px`,
                            minWidth: '4px'
                          }}
                        />
                        <span className="text-sm font-bold">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allDifficulties.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPassRateColor(averagePassRate)}`}>
              {averagePassRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hard Subjects</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{hardestSubjects}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Easy Subjects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{easiestSubjects}</div>
          </CardContent>
        </Card>
      </div>

      {/* All Subjects Difficulty Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Difficulty Summary</CardTitle>
          <CardDescription>Complete analysis of all subjects</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading difficulty data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Subject Code</th>
                    <th className="text-left p-3">Subject Name</th>
                    <th className="text-left p-3">Students</th>
                    <th className="text-left p-3">Pass Rate</th>
                    <th className="text-left p-3">Avg Grade</th>
                    <th className="text-left p-3">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {allDifficulties.map((difficulty, index) => (
                    <tr key={index} className="border-b hover:bg-accent/50">
                      <td className="p-3 font-mono font-bold">{difficulty.subject_code}</td>
                      <td className="p-3">{difficulty.subject_name}</td>
                      <td className="p-3">{difficulty.total_students}</td>
                      <td className={`p-3 font-bold ${getPassRateColor(difficulty.pass_rate)}`}>
                        {difficulty.pass_rate.toFixed(1)}%
                      </td>
                      <td className="p-3 font-bold">{difficulty.average_grade.toFixed(2)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getDifficultyIcon(difficulty.difficulty_level)}
                          <Badge className={getDifficultyColor(difficulty.difficulty_level)}>
                            {difficulty.difficulty_level}
                          </Badge>
                        </div>
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
