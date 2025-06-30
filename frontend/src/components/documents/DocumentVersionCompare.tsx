import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { versionsAPI } from "../../lib/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  ArrowLeft,
  Clock,
  User,
  AlertCircle,
  History,
  GitCompare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

interface ComparisonData {
  documentId: string;
  documentTitle: string;
  targetVersion: {
    _id: string;
    version: number;
    content: string;
    changedBy: {
      _id: string;
      username: string;
    };
    changedAt: string;
  };
  compareVersion: {
    _id: string;
    version: number | string;
    content: string;
    changedBy: {
      _id: string;
      username: string;
    };
    changedAt: string;
  };
  differences: {
    added: string[];
    removed: string[];
    modified: string[];
  };
}

export default function DocumentVersionCompare() {
  const { id, versionId } = useParams<{ id: string; versionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const compareWith = searchParams.get("with");

  useEffect(() => {
    if (id && versionId) {
      fetchComparison();
    }
  }, [id, versionId, compareWith]);

  const fetchComparison = async () => {
    if (!id || !versionId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await versionsAPI.compareVersions(
        id,
        versionId,
        compareWith || undefined,
      );
      setComparisonData(response.data);
    } catch (error) {
      console.error("Error fetching version comparison:", error);
      setError("Failed to load version comparison");
      toast.error("Failed to load version comparison");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const renderDiff = (content1: string, content2: string) => {
    // Simple diff visualization - in a real app you might use a library like react-diff-viewer
    const lines1 = content1.split("\n");
    const lines2 = content2.split("\n");

    const maxLines = Math.max(lines1.length, lines2.length);
    const diffLines = [];

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || "";
      const line2 = lines2[i] || "";

      if (line1 === line2) {
        diffLines.push({ type: "equal", content: line1, lineNumber: i + 1 });
      } else if (!line1) {
        diffLines.push({ type: "added", content: line2, lineNumber: i + 1 });
      } else if (!line2) {
        diffLines.push({ type: "removed", content: line1, lineNumber: i + 1 });
      } else {
        diffLines.push({
          type: "modified",
          content: line1,
          lineNumber: i + 1,
          newContent: line2,
        });
      }
    }

    return diffLines;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading comparison
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate(`/documents/${id}/versions`)}>
            Back to Version History
          </Button>
        </div>
      </div>
    );
  }

  if (!comparisonData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Comparison not available
          </h3>
          <p className="text-gray-600 mb-4">
            Unable to compare the selected versions.
          </p>
          <Button onClick={() => navigate(`/documents/${id}/versions`)}>
            Back to Version History
          </Button>
        </div>
      </div>
    );
  }

  const diffLines = renderDiff(
    comparisonData.compareVersion.content,
    comparisonData.targetVersion.content,
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/documents/${id}/versions`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/documents/${id}/versions`)}
          >
            <History className="h-4 w-4 mr-2" />
            All Versions
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <GitCompare className="h-8 w-8 mr-3" />
            Version Comparison
          </h1>
          <p className="text-gray-600">{comparisonData.documentTitle}</p>
        </div>
      </div>

      {/* Version Headers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  Version {comparisonData.compareVersion.version}
                  {comparisonData.compareVersion.version === "current" &&
                    " (Current)"}
                </Badge>
                <span className="text-sm text-gray-600">Baseline</span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{comparisonData.compareVersion.changedBy.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  {formatDate(comparisonData.compareVersion.changedAt)}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="default">
                  Version {comparisonData.targetVersion.version}
                </Badge>
                <span className="text-sm text-gray-600">Comparing</span>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{comparisonData.targetVersion.changedBy.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  {formatDate(comparisonData.targetVersion.changedAt)}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Diff View */}
      <Card>
        <CardHeader>
          <CardTitle>Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
            {diffLines.map((line, index) => (
              <div
                key={index}
                className={`py-1 px-2 ${
                  line.type === "added"
                    ? "bg-green-100 border-l-4 border-green-500"
                    : line.type === "removed"
                    ? "bg-red-100 border-l-4 border-red-500"
                    : line.type === "modified"
                    ? "bg-yellow-100 border-l-4 border-yellow-500"
                    : ""
                }`}
              >
                <span className="text-gray-400 mr-4 select-none">
                  {line.lineNumber}
                </span>
                {line.type === "added" && (
                  <span className="text-green-600">+ </span>
                )}
                {line.type === "removed" && (
                  <span className="text-red-600">- </span>
                )}
                {line.type === "modified" && (
                  <span className="text-yellow-600">~ </span>
                )}
                <span className={line.type === "removed" ? "line-through" : ""}>
                  {line.content}
                </span>
                {line.type === "modified" && line.newContent && (
                  <div className="ml-8 text-green-600">+ {line.newContent}</div>
                )}
              </div>
            ))}
          </div>

          {diffLines.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No differences found between these versions.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
