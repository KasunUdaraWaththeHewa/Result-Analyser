import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Download, BookOpen } from "lucide-react";
import { studentApi } from "../services/api";
import { useToast } from "@/hooks/use-toast";

import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Line,
} from "recharts";

interface SubjectResult {
  Subject: string;
  Year: number;
  Semester: string;
  Credits: number;
  Result: string;
}

interface StudentResult {
  index_number: string;
  results: SubjectResult[];
  gpaSummary: {
    Y1S1: number;
    Y1S2: number;
    Y2S1: number;
    Y2S2: number;
    Y3S1: number;
    FinalGPA: number;
    Rank: number;
    TotalMC: number;
  };
}

export const StudentLookup = () => {
  const [indexNumber, setIndexNumber] = useState("");
  const [studentResult, setStudentResult] = useState<StudentResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [filterYear, setFilterYear] = useState<string>("All");
  const [filterSemester, setFilterSemester] = useState<string>("All");
  const [filterResult, setFilterResult] = useState<string>("All");

  const handleStudentSearch = async () => {
    if (!indexNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an index number",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await studentApi.getStudentFullData(indexNumber); // <- updated function
      const { results, gpaSummary } = response;

      console.log("response", response);

      setStudentResult({
        index_number: results.index_number,
        results: results.results,
        gpaSummary: gpaSummary.summary[0],
      });

      toast({
        title: "Success",
        description: "Student results loaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch student results",
      });
      setStudentResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!indexNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an index number",
      });
      return;
    }

    try {
      const response = await studentApi.downloadStudentExcel(indexNumber);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `student_${indexNumber}_results.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: "Success",
        description: "Excel file downloaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download Excel file",
      });
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-100 text-green-800";
      case "A-":
      case "B+":
        return "bg-blue-100 text-blue-800";
      case "B":
      case "B-":
        return "bg-yellow-100 text-yellow-800";
      case "C+":
      case "C":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Student Lookup
        </h1>
        <p className="text-muted-foreground">
          Search for student results and download reports
        </p>
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
                onKeyPress={(e) => e.key === "Enter" && handleStudentSearch()}
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
      </div>

      {studentResult && (
        <Card>
          <CardHeader>
            <CardTitle>
              Student Results - {studentResult.index_number}
            </CardTitle>
            <CardDescription>
              Final GPA: {studentResult.gpaSummary.FinalGPA}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: "Y1S1", GPA: studentResult.gpaSummary.Y1S1 },
                    { name: "Y1S2", GPA: studentResult.gpaSummary.Y1S2 },
                    { name: "Y2S1", GPA: studentResult.gpaSummary.Y2S1 },
                    { name: "Y2S2", GPA: studentResult.gpaSummary.Y2S2 },
                    { name: "Y3S1", GPA: studentResult.gpaSummary.Y3S1 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 4]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="GPA"
                    stroke="#000000"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <h3 className="font-semibold">Subjects</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                <div>
                  <label className="text-sm block mb-1">Academic Year</label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="border px-2 py-1 rounded w-[200px]"  
                  >
                    <option value="All">All</option>
                    {[19, 20, 21].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm block mb-1">Semester</label>
                  <select
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value)}
                    className="border px-2 py-1 rounded w-[200px]"
                  >
                    <option value="All">All</option>
                    {["1", "2"].map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm block mb-1">Grade</label>
                  <select
                    value={filterResult}
                    onChange={(e) => setFilterResult(e.target.value)}
                    className="border px-2 py-1 rounded w-[200px]"
                  >
                    <option value="All">All</option>
                    {[
                      "A+",
                      "A",
                      "A-",
                      "B+",
                      "B",
                      "B-",
                      "C+",
                      "C",
                      "C-",
                      "D+",
                      "D",
                      "E",
                      "F",
                    ].map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-xs"
                onClick={() => {
                  setFilterYear("All");
                  setFilterSemester("All");
                  setFilterResult("All");
                }}
              >
                Reset Filters
              </Button>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Subject Name</th>
                      <th className="text-left p-2">Academic Year</th>
                      <th className="text-left p-2">Semester</th>
                      <th className="text-left p-2">Credits</th>
                      <th className="text-left p-2">Results</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentResult.results
                      .filter((subject) => {
                        return (
                          (filterYear === "All" ||
                            subject.Year.toString() === filterYear) &&
                          (filterSemester === "All" ||
                            subject.Semester === filterSemester) &&
                          (filterResult === "All" ||
                            subject.Result === filterResult)
                        );
                      })
                      .map((subject, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2">{subject.Subject}</td>
                          <td className="p-2">
                            <Badge
                              className={getGradeColor(subject.Year.toString())}
                            >
                              {subject.Year}
                            </Badge>
                          </td>
                          <td className="p-2">{subject.Semester}</td>
                          <td className="p-2">
                            <Badge
                              className={getGradeColor(
                                subject.Credits.toString()
                              )}
                            >
                              {subject.Credits}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge className={getGradeColor(subject.Result)}>
                              {subject.Result}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
