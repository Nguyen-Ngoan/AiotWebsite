'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { navItems } from '@/components/layout/nav-items';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  ImageIcon,
  ChevronRight,
  Home,
  ArrowUpDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getApiUrl } from '@/lib/apiConfig';

// --- Type Definitions ---
interface TechnicalDoc {
  id: string;
  doc_type: string;
  title: string;
  description: string;
  url: string;
  thumbnail_url?: string;
  version: string;
  file_size?: number;
  updated_at?: any;
  metadata?: {
    machine_model?: string;
    material_type?: string;
    nozzle?: number;
  };
}

type SortConfig = {
  key: keyof TechnicalDoc;
  direction: 'ascending' | 'descending';
} | null;

export default function TechnicalDocsPage() {
  const [docs, setDocs] = useState<TechnicalDoc[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Partial<TechnicalDoc> | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'title',
    direction: 'ascending',
  });

  const fetchDocs = async () => {
    try {
      const response = await fetch(getApiUrl('/technical-docs/'));
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data: TechnicalDoc[] = await response.json();
      setDocs(data);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const sortedDocs = useMemo(() => {
    let sortableDocs = [...docs];
    if (sortConfig !== null) {
      sortableDocs.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableDocs;
  }, [docs, sortConfig]);

  const handleSaveDoc = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    const url = editingDoc.id
      ? getApiUrl(`/technical-docs/${editingDoc.id}/`)
      : getApiUrl('/technical-docs/');
    const method = editingDoc.id ? 'PUT' : 'POST';

    const formData = new FormData();
    formData.append('title', editingDoc.title || '');
    formData.append('doc_type', editingDoc.doc_type || '');
    formData.append('description', editingDoc.description || '');
    formData.append('version', editingDoc.version || '');

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    // Add metadata if doc_type is gcode_file
    if (editingDoc.doc_type === 'gcode_file' && editingDoc.metadata) {
      formData.append('metadata', JSON.stringify(editingDoc.metadata));
    }

    try {
      const response = await fetch(url, { method, body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save document');
      }
      toast.success(
        `Document "${editingDoc.title}" ${
          editingDoc.id ? 'updated' : 'created'
        } successfully!`
      );
      setIsDialogOpen(false);
      setEditingDoc(null);
      setSelectedFile(null);
      fetchDocs();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const response = await fetch(getApiUrl(`/technical-docs/${id}/`), {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
      toast.success(`Document "${title}" deleted successfully!`);
      fetchDocs();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const openAddDialog = () => {
    setEditingDoc({ title: '', doc_type: 'datasheet', metadata: {} });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (doc: TechnicalDoc) => {
    setEditingDoc(JSON.parse(JSON.stringify(doc))); // Deep copy
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const requestSort = (key: keyof TechnicalDoc) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      <Header navItems={navItems} />
      <div className="container mx-auto min-h-screen pt-12 md:pt-28 lg:pt-32 pb-10">
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="font-medium text-foreground">Technical Docs</span>
        </nav>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Technical Documents</CardTitle>
                <CardDescription>
                  Manage datasheets, schematics, 3D models, and G-code files.
                </CardDescription>
              </div>
              <Button onClick={openAddDialog}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Document
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Thumbnail</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort('title')}
                    >
                      Title
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort('doc_type')}
                    >
                      Type
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDocs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      {doc.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={doc.thumbnail_url}
                          alt={doc.title}
                          className="h-10 w-10 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {doc.title}
                      </a>
                      {doc.doc_type === 'gcode_file' &&
                        doc.metadata?.machine_model && (
                          <Badge variant="outline" className="ml-2 font-normal">
                            {doc.metadata.machine_model}
                          </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.doc_type}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.version}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(doc)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteDoc(doc.id, doc.title)}
                            className="text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingDoc?.id ? 'Edit' : 'Add'} Document
              </DialogTitle>
              <DialogDescription>
                Upload a new document or edit an existing one.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveDoc} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="doc-title">Title</Label>
                <Input
                  id="doc-title"
                  value={editingDoc?.title || ''}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="doc-type">Document Type</Label>
                <Select
                  value={editingDoc?.doc_type || ''}
                  onValueChange={(value) =>
                    setEditingDoc({ ...editingDoc, doc_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="datasheet">Datasheet</SelectItem>
                    <SelectItem value="schematic">Schematic</SelectItem>
                    <SelectItem value="step_model">STEP Model</SelectItem>
                    <SelectItem value="stl_files">STL File</SelectItem>
                    <SelectItem value="gcode_file">G-code File</SelectItem>
                    <SelectItem value="user_manual">User Manual</SelectItem>
                    <SelectItem value="github_repo">GitHub Repo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional G-code Metadata Fields */}
              {editingDoc?.doc_type === 'gcode_file' && (
                <div className="space-y-4 rounded-md border p-4 bg-muted/50">
                  <h3 className="font-semibold text-sm">G-code Metadata</h3>
                  <div className="grid gap-2">
                    <Label htmlFor="gcode-machine">Machine Model</Label>
                    <Input
                      id="gcode-machine"
                      value={editingDoc.metadata?.machine_model || ''}
                      onChange={(e) =>
                        setEditingDoc((prev) => ({
                          ...prev,
                          metadata: {
                            ...prev?.metadata,
                            machine_model: e.target.value,
                          },
                        }))
                      }
                      placeholder="e.g., Bambu Lab X1C"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="gcode-material">Material</Label>
                      <Input
                        id="gcode-material"
                        value={editingDoc.metadata?.material_type || ''}
                        onChange={(e) =>
                          setEditingDoc((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev?.metadata,
                              material_type: e.target.value,
                            },
                          }))
                        }
                        placeholder="e.g., PETG"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gcode-nozzle">Nozzle Size (mm)</Label>
                      <Input
                        id="gcode-nozzle"
                        type="number"
                        step="0.1"
                        value={editingDoc.metadata?.nozzle || ''}
                        onChange={(e) =>
                          setEditingDoc((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev?.metadata,
                              nozzle: Number(e.target.value),
                            },
                          }))
                        }
                        placeholder="e.g., 0.4"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="doc-file">
                  File {editingDoc?.id ? '(leave blank to keep existing)' : ''}
                </Label>
                <Input
                  id="doc-file"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Document</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
}
