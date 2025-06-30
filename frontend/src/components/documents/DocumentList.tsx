import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { documentsAPI } from "../../lib/api";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  FileText,
  Plus,
  Globe,
  Lock,
  Calendar,
  User,
  Search,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import type { Document } from "../../types";

interface DocumentListProps {
  searchQuery: string;
}

export default function DocumentList({ searchQuery }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      fetchDocuments();
    }
  }, [searchQuery]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentsAPI.getAll();
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Failed to load documents");
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentsAPI.search(query);
      setDocuments(response.data);
    } catch (error) {
      console.error("Error searching documents:", error);
      setError("Search failed");
      toast.error("Search failed");
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error loading documents
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchDocuments}>Try again</Button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        {searchQuery ? (
          <>
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No documents found
            </h3>
            <p className="text-gray-600 mb-4">
              No documents match your search for "{searchQuery}"
            </p>
            <Button onClick={() => window.location.reload()}>
              Clear search
            </Button>
          </>
        ) : (
          <>
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No documents yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first document
            </p>
            <Link to="/documents/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Document
              </Button>
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchQuery && (
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Search results for "{searchQuery}"
          </h2>
          <p className="text-sm text-gray-600">
            {documents.length} document{documents.length !== 1 ? "s" : ""} found
          </p>
        </div>
      )}

      {documents.map((document) => (
        <Card key={document._id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">
                  <Link
                    to={`/documents/${document._id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {document.title}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{document.author?.username || "Unknown"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(document.updatedAt)}</span>
                  </div>
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    document.visibility === "public" ? "default" : "secondary"
                  }
                >
                  {document.visibility === "public" ? (
                    <>
                      <Globe className="mr-1 h-3 w-3" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="mr-1 h-3 w-3" />
                      Private
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardHeader>
          {document.content && (
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 line-clamp-2">
                {document.content.replace(/<[^>]*>/g, "").substring(0, 150)}
                {document.content.length > 150 ? "..." : ""}
              </p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
