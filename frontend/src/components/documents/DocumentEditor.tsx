import {
  AlertCircle,
  ArrowLeft,
  Globe,
  Loader2,
  Lock,
  Save,
  Share2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { documentsAPI } from "../../lib/api";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import RichTextEditor from "../ui/rich-text-editor";
import { Skeleton } from "../ui/skeleton";

interface Document {
  id: string;
  title: string;
  content: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [visibility, setVisibility] = useState<string>("private");
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const path = window.location.pathname;
  const isNewDocument = path.endsWith("/new");

  useEffect(() => {
    if (!isNewDocument) {
      fetchDocument();
    } else {
      setTitle("");
      setContent("");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (hasChanges && !isNewDocument) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      autoSaveRef.current = setTimeout(() => {
        handleSave(true);
      }, 3000);
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [title, content, hasChanges]);

  const fetchDocument = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await documentsAPI.getById(id);
      const doc = response.data;
      setDocument(doc);
      setTitle(doc.title);
      setContent(doc.content);
      setVisibility(doc.visibility);
    } catch (err: any) {
      setError("Failed to load document");
      toast.error("Failed to load document");
      console.error("Error fetching document:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(true);
  };

  const handleSave = async (isAutoSave = false) => {
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    try {
      setSaving(true);
      const documentData = {
        title: title.trim(),
        content,
        visibility: visibility,
      };

      let response;
      if (isNewDocument) {
        response = await documentsAPI.create(documentData);
        const newDoc = response.data;
        setDocument(newDoc);
        navigate(`/documents/${newDoc._id}/edit`, { replace: true });
      } else if (id) {
        response = await documentsAPI.update(id, documentData);
        setDocument(response.data);
      }

      setHasChanges(false);
      if (!isAutoSave) {
        toast.success("Document saved successfully!");
      }
    } catch (err: any) {
      console.error("Error saving document:", err);
      const message = err.response?.data?.message || "Failed to save document";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?",
      );
      if (!confirmed) return;
    }
    navigate("/");
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Globe className="h-4 w-4" />;
      case "shared":
        return <Share2 className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-green-100 text-green-800";
      case "shared":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleToggleVisibility = async () => {
    const newVisibility = visibility === "public" ? "private" : "public";

    if (isNewDocument) {
      setVisibility(newVisibility);
      setHasChanges(true);
      toast.success(`Document visibility set to ${newVisibility}`);
    } else if (id) {
      try {
        setIsUpdatingVisibility(true);
        await documentsAPI.updateVisibility(id, newVisibility);
        setVisibility(newVisibility);
        if (document) {
          setDocument({
            ...document,
            visibility: newVisibility,
          });
        }
        toast.success(`Document is now ${newVisibility}`);
      } catch (error) {
        console.error("Error updating visibility:", error);
        toast.error("Failed to update document visibility");
      } finally {
        setIsUpdatingVisibility(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="">
          <CardHeader className="">
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error loading document
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => fetchDocument()}
              className=""
              variant="default"
              size="default"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="default"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Button>

        <div className="flex items-center gap-3">
          {(document || isNewDocument) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleVisibility}
                disabled={isUpdatingVisibility}
                className={`flex items-center gap-1 ${getVisibilityColor(
                  visibility,
                )}`}
              >
                {getVisibilityIcon(visibility)}
                {visibility}
              </Button>
            </>
          )}
          <Button
            onClick={() => handleSave()}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2"
            variant="default"
            size="default"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Card className="">
        <CardHeader className="">
          <CardTitle className="">
            {isNewDocument ? "Create New Document" : "Edit Document"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="">
              Title
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter document title..."
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label className="">Content</Label>
            <RichTextEditor
              content={content}
              onChange={handleContentChange}
              placeholder="Start writing your document..."
              className="min-h-[400px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
