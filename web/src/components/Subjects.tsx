import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Download,
  FileText,
  ExternalLink,
  BarChart,
} from "lucide-react";
import { studentApi } from "../services/api";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  subject_code: string;
  subject_name: string;
}

interface DifficultySummary {
  Subject: string;
  "Average GPA": number;
  "Total Students": number;
  Failures: number;
  "Failure Rate (%)": number;
  "Difficulty Score": number;
}

export const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<DifficultySummary | null>(null);
  const [difficultyList, setDifficultyList] = useState<DifficultySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [minDifficulty, setMinDifficulty] = useState<number | null>(null);
  const [maxGPA, setMaxGPA] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { toast } = useToast();

  useEffect(() => {
    loadSubjects();
    loadDifficultySummary();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getAllSubjects();
      setSubjects(
        res.data.subjects.map((fullName: string) => ({
          subject_code: fullName, // store full name in subject_code
          subject_name: fullName, // no splitting
        }))
      );
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch subjects",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDifficultySummary = async () => {
    try {
      const res = await studentApi.getAllDifficultySummary();
      setDifficultyList(res.data.summary);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load difficulty summary",
      });
    }
  };

  const onSubjectSelect = (fullSubject: string) => {
    setSelectedCode(fullSubject); // just save the selected subject
  };

  const downloadExcel = async () => {
    if (!selectedCode) return;
    try {
      const res = await studentApi.downloadSubjectExcel(selectedCode);
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedCode}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: "Success", description: "Downloaded Excel" });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Download failed",
      });
    }
  };

  const filteredList = difficultyList
    .filter((item) => {
      const matchesSearch = item.Subject.toLowerCase().includes(
        searchTerm.toLowerCase()
      );
      const matchesMinDifficulty =
        minDifficulty === null || item["Difficulty Score"] >= minDifficulty;
      const matchesMaxGPA = maxGPA === null || item["Average GPA"] <= maxGPA;
      return matchesSearch && matchesMinDifficulty && matchesMaxGPA;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      const aVal = a[sortBy as keyof DifficultySummary];
      const bVal = b[sortBy as keyof DifficultySummary];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Subjects & Difficulty</h1>
        <p className="text-muted-foreground">
          Browse or pick subject to view detailed difficulty
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen size={20} /> Download by Subject
          </CardTitle>
          <CardDescription>Select & get detailed data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-center">
            <Select onValueChange={onSubjectSelect} value={selectedCode || ""}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Pick a subject..." />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((sub) => (
                  <SelectItem key={sub.subject_code} value={sub.subject_code}>
                    {sub.subject_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={downloadExcel} disabled={!selectedCode}>
              <Download size={16} /> Download Excel
            </Button>
            <Button variant="outline" onClick={() => setSelectedCode(null)}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {metadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} /> {metadata.Subject}
            </CardTitle>
            <CardDescription>Subject difficulty details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Avg GPA
              </h3>
              <p className="text-2xl font-bold">
                {metadata["Average GPA"].toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Failures
              </h3>
              <p className="text-2xl font-bold">{metadata.Failures}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Fail Rate
              </h3>
              <p className="text-2xl font-bold">
                {metadata["Failure Rate (%)"].toFixed(1)}%
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Difficulty
              </h3>
              <p className="text-2xl font-bold">
                {metadata["Difficulty Score"].toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart size={20} /> Subject Difficulty Summary
          </CardTitle>
          <CardDescription>All subjects ranked by difficulty</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="flex flex-wrap gap-4 mb-4 items-end">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Search Subject
              </label>
              <input
                type="text"
                placeholder="SCS1208 Data Structure and Algorithm II"
                className="border rounded-md px-3 py-2 text-sm w-40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Min Difficulty
              </label>
              <input
                type="number"
                className="border rounded-md px-3 py-2 text-sm w-28"
                value={minDifficulty ?? ""}
                onChange={(e) =>
                  setMinDifficulty(
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                placeholder="e.g. 2.5"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Max Average GPA
              </label>
              <input
                type="number"
                className="border rounded-md px-3 py-2 text-sm w-28"
                value={maxGPA ?? ""}
                onChange={(e) =>
                  setMaxGPA(e.target.value ? parseFloat(e.target.value) : null)
                }
                placeholder="e.g. 3.0"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Sort By
              </label>
              <Select
                onValueChange={(value) => setSortBy(value)}
                value={sortBy || ""}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Average GPA">Average GPA</SelectItem>
                  <SelectItem value="Failures">Failures</SelectItem>
                  <SelectItem value="Failure Rate (%)">Failure Rate</SelectItem>
                  <SelectItem value="Difficulty Score">Difficulty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Order
              </label>
              <Select
                onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
                value={sortOrder}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setMinDifficulty(null);
                setMaxGPA(null);
                setSortBy(null);
                setSortOrder("desc");
              }}
            >
              Reset
            </Button>
          </div>

          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-muted border-b">
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Avg GPA</th>
                <th className="p-3 text-left">Failures</th>
                <th className="p-3 text-left">Fail Rate</th>
                <th className="p-3 text-left">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((ds) => (
                <tr key={ds.Subject} className="border-b hover:bg-muted/50">
                  <td className="p-3">{ds.Subject}</td>
                  <td className="p-3">{ds["Average GPA"].toFixed(2)}</td>
                  <td className="p-3">{ds.Failures}</td>
                  <td className="p-3">{ds["Failure Rate (%)"].toFixed(1)}%</td>
                  <td className="p-3">{ds["Difficulty Score"].toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
