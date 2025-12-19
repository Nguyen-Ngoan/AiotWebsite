'use client';

import { useState, useEffect, FormEvent } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  ImageIcon,
  ArrowLeft,
  ChevronRight,
  Home,
  Star,
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
interface PrintProfile {
  profile_name: string;
  machine_group_ref: string;
  material_type: string;
  estimated_time_min: number;
  filament_weight_g: number;
  labor_time_min: number;
  is_default: boolean;
}

interface ProductImage {
  id: string;
  fileName: string;
  type: string;
  isPrimary: boolean;
  url: string;
  url_medium: string;
  url_thumb: string;
  alt: string;
  title: string;
}

interface PrintedPart {
  id: string;
  title: string;
  slug: string;
  step_file_id: string;
  stl_file_id: string;
  gcode_file_ids: string[];
  thumbnail_url: string;
  print_profiles: PrintProfile[];
  images?: ProductImage[];
}

interface TechnicalDoc {
  id: string;
  doc_type: string;
  title: string;
  description: string;
  url: string;
  thumbnail_url?: string;
  version: string;
  metadata?: {
    machine_model?: string;
    material_type?: string;
    nozzle?: number;
  };
}

interface MachineGroup {
  id: string; // This is the slug
  name: string;
}

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -

export default function PrintedPartsPage() {
  const [parts, setParts] = useState<PrintedPart[]>([]);
  const [techDocs, setTechDocs] = useState<TechnicalDoc[]>([]);
  const [machineGroups, setMachineGroups] = useState<MachineGroup[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Partial<PrintedPart> | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  const fetchParts = async () => {
    try {
      const response = await fetch(getApiUrl('/printing/parts/'));
      if (!response.ok) throw new Error('Failed to fetch printed parts');
      const data: PrintedPart[] = await response.json();
      setParts(data);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const fetchMachineGroups = async () => {
    try {
      const response = await fetch(getApiUrl('/printing/machines/'));
      if (!response.ok) throw new Error('Failed to fetch machine groups');
      const data: MachineGroup[] = await response.json();
      setMachineGroups(data);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const fetchTechDocs = async () => {
    try {
      const response = await fetch(getApiUrl('/technical-docs/'));
      if (!response.ok) throw new Error('Failed to fetch technical documents');
      const data: TechnicalDoc[] = await response.json();
      setTechDocs(data);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    fetchParts();
    fetchMachineGroups();
    fetchTechDocs();
  }, []);

  const handleSavePart = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingPart) return;

    const url = editingPart.id
      ? getApiUrl(`/printing/parts/${editingPart.id}/`)
      : getApiUrl('/printing/parts/');
    const method = editingPart.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPart),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save part');
      }
      toast.success(
        `Part "${editingPart.title}" ${
          editingPart.id ? 'updated' : 'created'
        } successfully!`
      );
      setIsDialogOpen(false);
      setEditingPart(null);
      fetchParts(); // Re-fetch
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDeletePart = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const response = await fetch(getApiUrl(`/printing/parts/${id}/`), {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete part');
      toast.success(`Part "${title}" deleted successfully!`);
      fetchParts(); // Re-fetch
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const openAddDialog = () => {
    setEditingPart({
      title: '',
      slug: '',
      print_profiles: [],
      step_file_id: '',
      stl_file_id: '',
      gcode_file_ids: [],
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (part: PrintedPart) => {
    setEditingPart(JSON.parse(JSON.stringify(part))); // Deep copy
    setIsDialogOpen(true);
  };

  const handleProfileChange = (
    index: number,
    field: keyof PrintProfile,
    value: any
  ) => {
    if (!editingPart) return;
    const updatedProfiles = [...(editingPart.print_profiles || [])];
    updatedProfiles[index] = { ...updatedProfiles[index], [field]: value };
    setEditingPart({ ...editingPart, print_profiles: updatedProfiles });
  };

  const handleDefaultChange = (index: number) => {
    if (!editingPart) return;
    const updatedProfiles = (editingPart.print_profiles || []).map((p, i) => ({
      ...p,
      is_default: i === index,
    }));
    setEditingPart({ ...editingPart, print_profiles: updatedProfiles });
  };

  const addProfile = () => {
    if (!editingPart) return;
    const newProfile: PrintProfile = {
      profile_name: 'Default',
      machine_group_ref: '',
      material_type: 'PETG',
      estimated_time_min: 0,
      filament_weight_g: 0,
      labor_time_min: 0,
      is_default: (editingPart.print_profiles || []).length === 0,
    };
    const updatedProfiles = [...(editingPart.print_profiles || []), newProfile];
    setEditingPart({ ...editingPart, print_profiles: updatedProfiles });
  };

  const removeProfile = (index: number) => {
    if (!editingPart) return;
    const updatedProfiles = (editingPart.print_profiles || []).filter(
      (_, i) => i !== index
    );
    setEditingPart({ ...editingPart, print_profiles: updatedProfiles });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPart?.id || !e.target.files?.[0]) return;

    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'gallery');
    formData.append('seo_file_name', file.name.split('.')[0]);

    try {
      const response = await fetch(
        getApiUrl(`/printing/parts/${editingPart.id}/images/`),
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      setEditingPart((prev) =>
        prev ? { ...prev, images: data.images } : null
      );
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (fileName: string) => {
    if (!editingPart?.id) return;
    if (!confirm('Delete this image?')) return;

    try {
      const response = await fetch(
        getApiUrl(`/printing/parts/${editingPart.id}/images/delete/`),
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName }),
        }
      );

      if (!response.ok) throw new Error('Failed to delete image');

      setEditingPart((prev) => {
        if (!prev) return null;
        const newImages = (prev.images || []).filter(
          (img) => img.fileName !== fileName
        );
        return { ...prev, images: newImages };
      });
      toast.success('Image deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleSetPrimary = async (fileName: string) => {
    if (!editingPart?.id) return;

    const updatedImages = (editingPart.images || []).map((img) => ({
      ...img,
      isPrimary: img.fileName === fileName,
    }));

    // Optimistic update
    setEditingPart((prev) =>
      prev ? { ...prev, images: updatedImages } : null
    );

    // Call PUT to save changes (including thumbnail_url update on backend)
    try {
      const response = await fetch(
        getApiUrl(`/printing/parts/${editingPart.id}/`),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...editingPart, images: updatedImages }),
        }
      );
      if (!response.ok) throw new Error('Failed to update primary image');
      toast.success('Primary image updated');
      fetchParts(); // Refresh list to update thumbnail in table
    } catch (error) {
      toast.error('Failed to set primary image');
    }
  };

  // Derived lists for selectors
  const stlDocs = techDocs.filter((doc) => doc.doc_type === 'stl_files');

  const stepDocs = techDocs.filter((doc) => doc.doc_type === 'step_model');

  const gcodeDocs = techDocs.filter((doc) => doc.doc_type === 'gcode_file');

  return (
    <>
      <Header navItems={navItems} />
      <div className="container mx-auto min-h-screen pt-12 md:pt-28 lg:pt-32 pb-10">
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="hover:text-foreground transition-colors">Admin</span>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link
            href="/admin/printing/settings"
            className="hover:text-foreground transition-colors"
          >
            3D Printing
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="font-medium text-foreground">Printed Parts</span>
        </nav>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Printed Parts</h1>
          <Button asChild variant="outline">
            <Link href="/admin/printing/settings">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Settings
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Manage Printed Parts</CardTitle>
                <CardDescription>
                  Add, edit, or delete 3D printed parts and their profiles.
                </CardDescription>
              </div>
              <Button onClick={openAddDialog}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Part
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>
                      {part.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={part.thumbnail_url}
                          alt={part.title}
                          className="h-10 w-10 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/parts/${part.slug}`}
                        className="hover:underline text-primary"
                      >
                        {part.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {part.slug}
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
                          <DropdownMenuItem
                            onClick={() => openEditDialog(part)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeletePart(part.id, part.title)
                            }
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
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPart?.id ? 'Edit' : 'Add'} Printed Part
              </DialogTitle>
              <DialogDescription>
                Manage the part details and its printing profiles.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSavePart} className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="part-title">Title</Label>
                    <Input
                      id="part-title"
                      value={editingPart?.title || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingPart((prev) => {
                          if (!prev) return null;
                          // Nếu đang tạo mới (chưa có ID), tự động cập nhật slug theo title
                          if (!prev.id) {
                            return { ...prev, title: val, slug: slugify(val) };
                          }
                          return { ...prev, title: val };
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="part-slug">Slug</Label>
                    <Input
                      id="part-slug"
                      value={editingPart?.slug || ''}
                      onChange={(e) =>
                        setEditingPart({ ...editingPart, slug: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="stl-file-id">STL File (Required)</Label>
                    <Select
                      value={editingPart?.stl_file_id || ''}
                      onValueChange={(value) =>
                        setEditingPart({
                          ...editingPart,
                          stl_file_id: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select STL file..." />
                      </SelectTrigger>
                      <SelectContent>
                        {stlDocs.length > 0 ? (
                          stlDocs.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.title} ({doc.version || 'v1'})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-muted-foreground">
                            No STL files found.{' '}
                            <Link
                              href="/admin/technical-docs"
                              className="text-primary underline"
                            >
                              Upload one?
                            </Link>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="step-file-id">STEP File (Optional)</Label>
                    <Select
                      value={editingPart?.step_file_id || ''}
                      onValueChange={(value) =>
                        setEditingPart({ ...editingPart, step_file_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select STEP file..." />
                      </SelectTrigger>
                      <SelectContent>
                        {stepDocs.length > 0 ? (
                          stepDocs.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.title} ({doc.version || 'v1'})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-muted-foreground">
                            No STEP files found.{' '}
                            <Link
                              href="/admin/technical-docs"
                              className="text-primary underline"
                            >
                              Upload one?
                            </Link>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="gcode-files">Associated G-code Files</Label>
                    <div className="space-y-2">
                      {(editingPart?.gcode_file_ids || []).map((gcodeId) => {
                        const doc = techDocs.find((d) => d.id === gcodeId);
                        return (
                          <div
                            key={gcodeId}
                            className="flex items-center justify-between rounded-md border p-2 text-sm bg-muted/50"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {doc?.title || 'Unknown File'}
                              </span>
                              {doc?.metadata && (
                                <span className="text-xs text-muted-foreground">
                                  {doc.metadata.machine_model || 'N/A'} -{' '}
                                  {doc.metadata.material_type || 'N/A'}
                                </span>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive/90"
                              onClick={() => {
                                const newIds = (
                                  editingPart?.gcode_file_ids || []
                                ).filter((id) => id !== gcodeId);
                                setEditingPart({
                                  ...editingPart,
                                  gcode_file_ids: newIds,
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (
                          value &&
                          !(editingPart?.gcode_file_ids || []).includes(value)
                        ) {
                          setEditingPart({
                            ...editingPart,
                            gcode_file_ids: [
                              ...(editingPart?.gcode_file_ids || []),
                              value,
                            ],
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add G-code file..." />
                      </SelectTrigger>
                      <SelectContent>
                        {gcodeDocs
                          .filter(
                            (doc) =>
                              !(editingPart?.gcode_file_ids || []).includes(
                                doc.id
                              )
                          )
                          .map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.title} (
                              {doc.metadata?.machine_model || 'N/A'} -{' '}
                              {doc.metadata?.material_type || 'N/A'})
                            </SelectItem>
                          ))}
                        {gcodeDocs.filter(
                          (doc) =>
                            !(editingPart?.gcode_file_ids || []).includes(
                              doc.id
                            )
                        ).length === 0 && (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No more files available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Image Gallery Section */}
              <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-semibold">Images</h3>
                {!editingPart?.id ? (
                  <div className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-md">
                    Please save the part first to upload images.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(editingPart.images || []).map((img) => (
                        <div
                          key={img.fileName}
                          className="relative group aspect-square rounded-md overflow-hidden border bg-muted"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url_thumb}
                            alt={img.alt}
                            className="w-full h-full object-cover"
                          />
                          {img.isPrimary && (
                            <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" /> Primary
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            {!img.isPrimary && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-6 text-xs"
                                onClick={() => handleSetPrimary(img.fileName)}
                                type="button"
                              >
                                Set Primary
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => handleDeleteImage(img.fileName)}
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {/* Upload Button */}
                      <div className="aspect-square rounded-md border border-dashed flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors relative">
                        {isUploading ? (
                          <div className="text-sm text-muted-foreground">
                            Uploading...
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                            />
                            <div className="text-center">
                              <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-1" />
                              <span className="text-xs text-muted-foreground">
                                Upload
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Manager */}
              <div className="space-y-4 rounded-md border p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Print Profiles</h3>
                  <Button type="button" size="sm" onClick={addProfile}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Profile
                  </Button>
                </div>
                <div className="space-y-4">
                  {(editingPart?.print_profiles || []).map((profile, index) => (
                    <div key={index} className="rounded-md border p-3 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeProfile(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label>Profile Name</Label>
                          <Input
                            value={profile.profile_name}
                            onChange={(e) =>
                              handleProfileChange(
                                index,
                                'profile_name',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Machine Group</Label>
                          <Select
                            value={profile.machine_group_ref}
                            onValueChange={(v) =>
                              handleProfileChange(index, 'machine_group_ref', v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select machine..." />
                            </SelectTrigger>
                            <SelectContent>
                              {machineGroups.map((mg) => (
                                <SelectItem
                                  key={mg.id}
                                  value={`machine_groups/${mg.id}`}
                                >
                                  {mg.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Material Type</Label>
                          <Select
                            value={profile.material_type}
                            onValueChange={(v) =>
                              handleProfileChange(index, 'material_type', v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select material..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PETG">PETG</SelectItem>
                              <SelectItem value="PLA">PLA</SelectItem>
                              <SelectItem value="ABS">ABS</SelectItem>
                              <SelectItem value="ASA">ASA</SelectItem>
                              <SelectItem value="TPU">TPU</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Print Time (min)</Label>
                          <Input
                            type="number"
                            value={profile.estimated_time_min}
                            onChange={(e) =>
                              handleProfileChange(
                                index,
                                'estimated_time_min',
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Filament (g)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={profile.filament_weight_g}
                            onChange={(e) =>
                              handleProfileChange(
                                index,
                                'filament_weight_g',
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Labor Time (min)</Label>
                          <Input
                            type="number"
                            value={profile.labor_time_min}
                            onChange={(e) =>
                              handleProfileChange(
                                index,
                                'labor_time_min',
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <Checkbox
                          id={`is-default-${index}`}
                          checked={profile.is_default}
                          onCheckedChange={() => handleDefaultChange(index)}
                        />
                        <Label htmlFor={`is-default-${index}`}>
                          Set as default profile
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Part</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
}
