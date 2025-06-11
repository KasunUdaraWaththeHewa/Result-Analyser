import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BarChart3, Search, Users } from "lucide-react";
import { studentApi } from "../services/api";
import { useToast } from "@/hooks/use-toast";

interface GPASummaryItem {
  Index: number;
  Y1S1: number;
  Y1S2: number;
  Y2S1: number;
  Y2S2: number;
  Y3S1: number;
  FinalGPA: number;
  TotalMC: number;
  Rank: number;
}

export const GPASummary = () => {
  const [allSummaries, setAllSummaries] = useState<GPASummaryItem[]>([]);
  const [singleSummary, setSingleSummary] = useState<GPASummaryItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [filterText, setFilterText] = useState("");
  const [minGPA, setMinGPA] = useState("");
  const [maxGPA, setMaxGPA] = useState("");

  useEffect(() => {
    loadAllSummaries();
  }, []);

  const loadAllSummaries = async () => {
    setLoading(true);
    try {
      const response = await studentApi.getAllGPASummary();
      console.log("GPA Summary Response:", response);

      const summaries = Array.isArray(response.data)
        ? response.data
        : response.data?.summary || [];

      setAllSummaries(summaries);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch GPA summaries",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return "text-green-600";
    if (gpa >= 3.0) return "text-blue-600";
    if (gpa >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getGPALevel = (gpa: number) => {
    if (gpa >= 3.5) return "Excellent";
    if (gpa >= 3.0) return "Good";
    if (gpa >= 2.5) return "Average";
    return "Below Average";
  };

  const averageGPA =
    allSummaries.length > 0
      ? allSummaries.reduce((sum, item) => sum + item.FinalGPA, 0) /
        allSummaries.length
      : 0;

  const highestGPA =
    allSummaries.length > 0
      ? Math.max(...allSummaries.map((item) => item.FinalGPA))
      : 0;

  const filteredSummaries = allSummaries.filter((item) => {
    const matchesIndex = item.Index.toString()
      .toLowerCase()
      .includes(filterText.toLowerCase());

    const gpaInRange =
      (!minGPA || item.FinalGPA >= parseFloat(minGPA)) &&
      (!maxGPA || item.FinalGPA <= parseFloat(maxGPA));

    return matchesIndex && gpaInRange;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">GPA Summary</h1>
        <p className="text-muted-foreground">
          View and analyze student GPA statistics
        </p>
      </div>

      {/* Individual Search Result */}
      {singleSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Individual GPA Summary</CardTitle>
            <CardDescription>Index: {singleSummary.Index}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Final GPA
                </h3>
                <p
                  className={`text-2xl font-bold ${getGPAColor(
                    singleSummary.FinalGPA
                  )}`}
                >
                  {singleSummary.FinalGPA.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getGPALevel(singleSummary.FinalGPA)}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Rank
                </h3>
                <p className="text-2xl font-bold">{singleSummary.Rank}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Total MC
                </h3>
                <p className="text-2xl font-bold">{singleSummary.TotalMC}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
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
          <CardDescription>
            Complete list of student GPA records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-wrap gap-4 items-center">
                <Input
                  className="w-48"
                  placeholder="Filter by index number"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
                <Input
                  className="w-32"
                  type="number"
                  step="0.01"
                  placeholder="Min GPA"
                  value={minGPA}
                  onChange={(e) => setMinGPA(e.target.value)}
                />
                <Input
                  className="w-32"
                  type="number"
                  step="0.01"
                  placeholder="Max GPA"
                  value={maxGPA}
                  onChange={(e) => setMaxGPA(e.target.value)}
                />
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Rank</th>
                    <th className="text-left p-3">Index</th>
                    <th className="text-left p-3">Y1S1</th>
                    <th className="text-left p-3">Y1S2</th>
                    <th className="text-left p-3">Y2S1</th>
                    <th className="text-left p-3">Y2S2</th>
                    <th className="text-left p-3">Y3S1</th>
                    <th className="text-left p-3">Final GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSummaries.map((summary, index) => (
                    <tr key={index} className="border-b hover:bg-accent/50">
                      <td className="p-3">{summary.Rank}</td>
                      <td className="p-3 font-mono">{summary.Index}</td>
                      <td className="p-3">{summary.Y1S1.toFixed(2)}</td>
                      <td className="p-3">{summary.Y1S2.toFixed(2)}</td>
                      <td className="p-3">{summary.Y2S1.toFixed(2)}</td>
                      <td className="p-3">{summary.Y2S2.toFixed(2)}</td>
                      <td className="p-3">{summary.Y3S1.toFixed(2)}</td>
                      <td
                        className={`p-3 font-bold ${getGPAColor(
                          summary.FinalGPA
                        )}`}
                      >
                        {summary.FinalGPA.toFixed(2)}
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
