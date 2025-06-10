
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, FileText, ExternalLink } from 'lucide-react';
import { studentApi } from '../services/api';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  subject_code: string;
  subject_name: string;
  credits: number;
  department: string;
}

interface SubjectMetadata {
  subject_code: string;
  subject_name: string;
  total_students: number;
  average_grade: number;
  file_size: string;
  last_updated: string;
  download_url: string;
}

export const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedMetadata, setSelectedMetadata] = useState<SubjectMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const response = await studentApi.getAllSubjects();
      setSubjects(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch subjects list"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectMetadata = async (subjectCode: string) => {
    setMetadataLoading(true);
    try {
      const response = await studentApi.getSubjectMetadata(subjectCode);
      setSelectedMetadata(response.data);
      toast({
        title: "Success",
        description: "Subject metadata loaded"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch subject metadata"
      });
      setSelectedMetadata(null);
    } finally {
      setMetadataLoading(false);
    }
  };

  const downloadSubjectExcel = async (subjectCode: string) => {
    try {
      const response = await studentApi.downloadSubjectExcel(subjectCode);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `subject_${subjectCode}_data.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: "Success",
        description: "Subject Excel file downloaded"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download subject file"
      });
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      'Computer Science': 'bg-blue-100 text-blue-800',
      'Mathematics': 'bg-green-100 text-green-800',
      'Physics': 'bg-purple-100 text-purple-800',
      'Chemistry': 'bg-orange-100 text-orange-800',
      'Engineering': 'bg-red-100 text-red-800',
      'Business': 'bg-yellow-100 text-yellow-800'
    };
    return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCreditColor = (credits: number) => {
    if (credits >= 4) return 'bg-green-100 text-green-800';
    if (credits >= 3) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Subjects</h1>
        <p className="text-muted-foreground">Browse available subjects and download course data</p>
      </div>

      {/* Subject Metadata Display */}
      {selectedMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Subject Details - {selectedMetadata.subject_code}
            </CardTitle>
            <CardDescription>{selectedMetadata.subject_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Total Students</h3>
                <p className="text-2xl font-bold">{selectedMetadata.total_students}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Average Grade</h3>
                <p className="text-2xl font-bold">{selectedMetadata.average_grade.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">File Size</h3>
                <p className="text-2xl font-bold">{selectedMetadata.file_size}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Last Updated</h3>
                <p className="text-sm font-medium">{selectedMetadata.last_updated}</p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button 
                onClick={() => downloadSubjectExcel(selectedMetadata.subject_code)}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Download Excel
              </Button>
              {selectedMetadata.download_url && (
                <Button 
                  variant="outline"
                  asChild
                >
                  <a href={selectedMetadata.download_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} className="mr-2" />
                    Open File
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subjects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen size={20} />
            All Subjects
          </CardTitle>
          <CardDescription>
            Complete list of available subjects and courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading subjects...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{subject.subject_code}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {subject.subject_name}
                        </CardDescription>
                      </div>
                      <Badge className={getCreditColor(subject.credits)}>
                        {subject.credits} credits
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <Badge className={getDepartmentColor(subject.department)}>
                        {subject.department}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => loadSubjectMetadata(subject.subject_code)}
                          disabled={metadataLoading}
                          className="flex-1"
                        >
                          <FileText size={14} className="mr-1" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadSubjectExcel(subject.subject_code)}
                        >
                          <Download size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
