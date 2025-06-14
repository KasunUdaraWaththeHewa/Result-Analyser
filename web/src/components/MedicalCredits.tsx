import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { studentApi } from "../services/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, ArrowUp, Filter } from "lucide-react";

interface SummaryRecord {
  Index: number;
  FinalGPA: number;
  Rank: number;
  TotalMC: number;
  StrategicUseOfMC: boolean;
}

type SortKey = "Rank" | "TotalMC";

export const MedicalCredits = () => {
  const [summaryRecords, setSummaryRecords] = useState<SummaryRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SummaryRecord[]>([]);
  const [strategicOnly, setStrategicOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("Rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSummaryRecords();
  }, []);

  useEffect(() => {
    filterAndSortRecords();
  }, [summaryRecords, strategicOnly, sortKey, sortAsc]);

  const loadSummaryRecords = async () => {
    setLoading(true);
    try {
      const response = await studentApi.getAllMedicalCredits();
      setSummaryRecords(response.data.summary);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch summary data",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRecords = () => {
    let records = [...summaryRecords];

    if (strategicOnly) {
      records = records.filter((r) => r.StrategicUseOfMC);
    }

    records.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    setFilteredRecords(records);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Medical Credits
        </h1>
        <p className="text-muted-foreground">
          Track and analyze MC usage patterns
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={18} />
            Filters
          </CardTitle>
          <CardDescription>
            Toggle filters and sort the summary data
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="strategic"
              checked={strategicOnly}
              onCheckedChange={(checked) =>
                setStrategicOnly(checked as boolean)
              }
            />
            <label htmlFor="strategic" className="text-sm">
              Show only strategic users
            </label>
          </div>
          <Button
            variant="outline"
            onClick={() => toggleSort("Rank")}
            className="text-xs"
          >
            Sort by Rank {sortKey === "Rank" && (sortAsc ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
          </Button>
          <Button
            variant="outline"
            onClick={() => toggleSort("TotalMC")}
            className="text-xs"
          >
            Sort by Total MC {sortKey === "TotalMC" && (sortAsc ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
          </Button>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Medical Credits Summary</CardTitle>
          <CardDescription>
            Overview of students' total MC usage and GPA
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <table className="w-full text-sm border">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="text-left p-3">Index</th>
                  <th className="text-left p-3">Final GPA</th>
                  <th className="text-left p-3">Rank</th>
                  <th className="text-left p-3">Total MC</th>
                  <th className="text-left p-3">Strategic Use</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.Index} className="border-b hover:bg-muted/50">
                    <td className="p-3">{record.Index}</td>
                    <td className="p-3">{record.FinalGPA.toFixed(2)}</td>
                    <td className="p-3">{record.Rank}</td>
                    <td className="p-3">{record.TotalMC}</td>
                    <td className="p-3">
                      {record.StrategicUseOfMC ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
