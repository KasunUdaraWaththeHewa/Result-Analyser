
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Download, BookOpen } from 'lucide-react';
import { studentApi } from '../services/api';
import { useToast } from '@/hooks/use-toast';

interface StudentResult {
  index_number: string;
  student_name: string;
  subjects: Array<{
    subject_code: string;
    subject_name: string;
    grade: string;
    credits: number;
    gpa_points: number;
  }>;
  total_credits: number;
  gpa: number;
}

interface SubjectResult {
  subject_code: string;
  subject_name: string;
  grade: string;
  credits: number;
  gpa_points: number;
}

export const StudentLookup = () => {
  const [indexNumber, setIndexNumber] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [studentResult, setStudentResult] = useState<StudentResult | null>(null);
  const [subjectResult, setSubjectResult] = useState<SubjectResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStudentSearch = async () => {
    if (!indexNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an index number"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await studentApi.getStudentResults(indexNumber);
      setStudentResult(response.data);
      setSubjectResult(null);
      toast({
        title: "Success",
        description: "Student results loaded successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch student results"
      });
      setStudentResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSearch = async () => {
    if (!indexNumber.trim() || !subjectCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both index number and subject code"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await studentApi.getSubjectResult(indexNumber, subjectCode);
      setSubjectResult(response.data);
      setStudentResult(null);
      toast({
        title: "Success",
        description: "Subject result loaded successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch subject result"
      });
      setSubjectResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!indexNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an index number"
      });
      return;
    }

    try {
      const response = await studentApi.downloadStudentExcel(indexNumber);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_${indexNumber}_results.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: "Success",
        description: "Excel file downloaded successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download Excel file"
      });
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'A-':
      case 'B+':
        return 'bg-blue-100 text-blue-800';
      case 'B':
      case 'B-':
        return 'bg-yellow-100 text-yellow-800';
      case 'C+':
      case 'C':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Student Lookup</h1>
        <p className="text-muted-foreground">Search for student results and download reports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search size={20} />
              Student Results
            </CardTitle>
            <CardDescription>
              Search for complete student results by index number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter index number (e.g., 190001A)"
                value={indexNumber}
                onChange={(e) => setIndexNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStudentSearch()}
              />
              <Button onClick={handleStudentSearch} disabled={loading}>
                <Search size={16} />
              </Button>
            </div>
            <Button 
              onClick={handleDownloadExcel} 
              variant="outline" 
              className="w-full"
              disabled={!indexNumber.trim()}
            >
              <Download size={16} className="mr-2" />
              Download Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen size={20} />
              Single Subject
            </CardTitle>
            <CardDescription>
              View result for a specific subject
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Index number"
              value={indexNumber}
              onChange={(e) => setIndexNumber(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Subject code (e.g., CS1010)"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubjectSearch()}
              />
              <Button onClick={handleSubjectSearch} disabled={loading}>
                <Search size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Results Display */}
      {studentResult && (
        <Card>
          <CardHeader>
            <CardTitle>Student Results - {studentResult.student_name}</CardTitle>
            <CardDescription>Index: {studentResult.index_number}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Total Credits</h3>
                <p className="text-2xl font-bold">{studentResult.total_credits}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">GPA</h3>
                <p className="text-2xl font-bold">{studentResult.gpa.toFixed(2)}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <h3 className="font-semibold">Subjects</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Subject Code</th>
                      <th className="text-left p-2">Subject Name</th>
                      <th className="text-left p-2">Grade</th>
                      <th className="text-left p-2">Credits</th>
                      <th className="text-left p-2">GPA Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentResult.subjects.map((subject, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-mono">{subject.subject_code}</td>
                        <td className="p-2">{subject.subject_name}</td>
                        <td className="p-2">
                          <Badge className={getGradeColor(subject.grade)}>
                            {subject.grade}
                          </Badge>
                        </td>
                        <td className="p-2">{subject.credits}</td>
                        <td className="p-2">{subject.gpa_points.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Single Subject Result Display */}
      {subjectResult && (
        <Card>
          <CardHeader>
            <CardTitle>Subject Result - {subjectResult.subject_code}</CardTitle>
            <CardDescription>{subjectResult.subject_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Grade</h3>
                <Badge className={`text-lg ${getGradeColor(subjectResult.grade)}`}>
                  {subjectResult.grade}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Credits</h3>
                <p className="text-xl font-bold">{subjectResult.credits}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">GPA Points</h3>
                <p className="text-xl font-bold">{subjectResult.gpa_points.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
