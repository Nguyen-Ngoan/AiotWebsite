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

interface PrintedPart {
  id: string;
  title: string;
  slug: string;
  design_file_ref: string;
  thumbnail_url: string;
  print_profiles: PrintProfile[];
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
  const [machineGroups, setMachineGroups] = useState<MachineGroup[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Partial<PrintedPart> | null>(
    null
  );

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

  useEffect(() => {
    fetchParts();
    fetchMachineGroups();
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
    setEditingPart({ title: '', slug: '', print_profiles: [] });
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
                <div className="grid gap-2">
                  <Label htmlFor="part-doc-ref">Technical Doc ID</Label>
                  <Input
                    id="part-doc-ref"
                    placeholder="ID of the document in technical_docs collection"
                    value={editingPart?.design_file_ref || ''}
                    onChange={(e) =>
                      setEditingPart({
                        ...editingPart,
                        design_file_ref: e.target.value,
                      })
                    }
                  />
                </div>
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
