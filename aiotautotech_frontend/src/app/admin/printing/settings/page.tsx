'use client';

import { useState, useEffect, FormEvent, Fragment } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { navItems } from '@/components/layout/nav-items';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MoreHorizontal,
  PlusCircle,
  Circle,
  ArrowRight,
  ChevronRight,
  Home,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getApiUrl } from '@/lib/apiConfig';

// Type Definitions
interface SystemConfig {
  id: string;
  electricity_rate_kwh: number;
  labor_cost_per_hour: number;
  failure_rate_multiplier: number;
  updated_at: string | null;
}

interface MachineGroup {
  id: string;
  name: string;
  description: string;
  hourly_operating_cost: number;
  power_consumption_kw: number;
  bed_size_mm: number[];
  compatible_materials: string[];
}

interface Filament {
  id: string;
  name: string;
  brand: string;
  material_type: string;
  color_hex: string;
  texture?: string;
  spool_weight_g: number;
  cost_per_spool: number;
  stock_qty: number;
  density_g_cm3?: number;
  diameter_mm?: number;
  print_temp_min?: number;
  print_temp_max?: number;
  bed_temp_min?: number;
}

// --- 1. General Config Tab ---
const GeneralConfigTab = () => {
  const [config, setConfig] = useState<Partial<SystemConfig>>({
    electricity_rate_kwh: 0,
    labor_cost_per_hour: 0,
    failure_rate_multiplier: 1.0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(getApiUrl('/printing/config/'));
        if (!response.ok) throw new Error('Failed to fetch config');
        const data: SystemConfig = await response.json();
        setConfig(data);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(getApiUrl('/printing/config/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Failed to save config');
      const savedConfig = await response.json();
      setConfig(savedConfig);
      toast.success('Configuration saved successfully!');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Printing Costs</CardTitle>
        <CardDescription>
          Set global parameters for calculating printing costs.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSave}>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="electricity">Electricity Rate (VND/kWh)</Label>
            <Input
              id="electricity"
              type="number"
              value={config.electricity_rate_kwh || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  electricity_rate_kwh: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="labor">Labor Cost (VND/hour)</Label>
            <Input
              id="labor"
              type="number"
              value={config.labor_cost_per_hour || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  labor_cost_per_hour: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="failure">Failure Rate Multiplier</Label>
            <Input
              id="failure"
              type="number"
              step="0.01"
              value={config.failure_rate_multiplier || ''}
              onChange={(e) =>
                setConfig({
                  ...config,
                  failure_rate_multiplier: Number(e.target.value),
                })
              }
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

// --- 2. Machine Groups Tab ---
const MachineGroupsTab = () => {
  const [machines, setMachines] = useState<MachineGroup[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] =
    useState<Partial<MachineGroup> | null>(null);

  const fetchMachines = async () => {
    try {
      const response = await fetch(getApiUrl('/printing/machines/'));
      if (!response.ok) throw new Error('Failed to fetch machines');
      const data: MachineGroup[] = await response.json();
      setMachines(data);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleSaveMachine = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingMachine) return;

    const url = editingMachine.id
      ? getApiUrl(`/printing/machines/${editingMachine.id}/`)
      : getApiUrl('/printing/machines/');
    const method = editingMachine.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMachine),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save machine');
      }
      toast.success(
        `Machine ${editingMachine.id ? 'updated' : 'added'} successfully!`
      );
      setIsDialogOpen(false);
      setEditingMachine(null);
      fetchMachines(); // Re-fetch
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDeleteMachine = async (id: string) => {
    if (!confirm('Are you sure you want to delete this machine group?')) return;
    try {
      const response = await fetch(getApiUrl(`/printing/machines/${id}/`), {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete machine');
      toast.success('Machine deleted successfully!');
      fetchMachines(); // Re-fetch
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const openAddDialog = () => {
    setEditingMachine({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (machine: MachineGroup) => {
    setEditingMachine(machine);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Machine Groups</CardTitle>
        <CardDescription>
          Manage your 3D printer groups and their operational costs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-right mb-4">
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Machine
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Hourly Cost</TableHead>
              <TableHead>Power (kW)</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {machines.map((machine) => (
              <TableRow key={machine.id}>
                <TableCell className="font-medium">{machine.name}</TableCell>
                <TableCell>
                  {machine.hourly_operating_cost.toLocaleString()} VND
                </TableCell>
                <TableCell>{machine.power_consumption_kw}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openEditDialog(machine)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteMachine(machine.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMachine?.id ? 'Edit' : 'Add'} Machine Group
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the machine group.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveMachine} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="machine-name">Name</Label>
              <Input
                id="machine-name"
                value={editingMachine?.name || ''}
                onChange={(e) =>
                  setEditingMachine({ ...editingMachine, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="machine-cost">Hourly Operating Cost (VND)</Label>
              <Input
                id="machine-cost"
                type="number"
                value={editingMachine?.hourly_operating_cost || ''}
                onChange={(e) =>
                  setEditingMachine({
                    ...editingMachine,
                    hourly_operating_cost: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="machine-power">Power Consumption (kW)</Label>
              <Input
                id="machine-power"
                type="number"
                step="0.01"
                value={editingMachine?.power_consumption_kw || ''}
                onChange={(e) =>
                  setEditingMachine({
                    ...editingMachine,
                    power_consumption_kw: Number(e.target.value),
                  })
                }
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
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// --- 3. Filaments Tab ---
const PRESET_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Gold', hex: '#FFD700' },
];

const FilamentsTab = () => {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFilament, setEditingFilament] =
    useState<Partial<Filament> | null>(null);
  const [expandedFilamentId, setExpandedFilamentId] = useState<string | null>(
    null
  );

  const fetchFilaments = async () => {
    try {
      const response = await fetch(getApiUrl('/printing/filaments/'));
      if (!response.ok) throw new Error('Failed to fetch filaments');
      const data: Filament[] = await response.json();
      setFilaments(data);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    fetchFilaments();
  }, []);

  const handleSaveFilament = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingFilament) return;

    const url = editingFilament.id
      ? getApiUrl(`/printing/filaments/${editingFilament.id}/`)
      : getApiUrl('/printing/filaments/');
    const method = editingFilament.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFilament),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save filament');
      }
      toast.success(
        `Filament ${editingFilament.id ? 'updated' : 'added'} successfully!`
      );
      setIsDialogOpen(false);
      setEditingFilament(null);
      fetchFilaments(); // Re-fetch
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDeleteFilament = async (id: string) => {
    if (!confirm('Are you sure you want to delete this filament?')) return;
    try {
      const response = await fetch(getApiUrl(`/printing/filaments/${id}/`), {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete filament');
      toast.success('Filament deleted successfully!');
      fetchFilaments(); // Re-fetch
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const openAddDialog = () => {
    setEditingFilament({
      spool_weight_g: 1000,
      color_hex: '#FFFFFF',
      density_g_cm3: 1.24,
      diameter_mm: 1.75,
      print_temp_min: 200,
      print_temp_max: 220,
      bed_temp_min: 60,
      texture: 'Glossy',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (filament: Filament) => {
    setEditingFilament({
      ...filament,
      color_hex: filament.color_hex || '#FFFFFF',
    });
    setIsDialogOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedFilamentId(expandedFilamentId === id ? null : id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filaments</CardTitle>
        <CardDescription>
          Manage your filament inventory and costs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-right mb-4">
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Filament
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Cost/Spool</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filaments.map((filament) => (
              <Fragment key={filament.id}>
                <TableRow
                  className={
                    expandedFilamentId === filament.id
                      ? 'border-b-0 bg-muted/50'
                      : ''
                  }
                >
                  <TableCell className="font-medium">
                    <div
                      className="flex w-full items-center justify-between gap-2 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => toggleExpand(filament.id)}
                    >
                      {filament.name}
                      {expandedFilamentId === filament.id ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{filament.brand}</TableCell>
                  <TableCell>{filament.material_type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(filament.color_hex || '#FFFFFF')
                        .trim()
                        .toUpperCase() === '#000000' ? (
                        <div
                          className="h-4 w-4 rounded-full border shadow-sm"
                          style={{
                            backgroundColor: 'transparent',
                            boxShadow: 'inset 0 0 0 50px #000000',
                          }}
                        />
                      ) : (
                        <Circle
                          className="h-4 w-4"
                          fill={(filament.color_hex || '#FFFFFF').trim()}
                          stroke="currentColor"
                          strokeWidth={1}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {filament.cost_per_spool.toLocaleString()} VND
                  </TableCell>
                  <TableCell>
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
                          onClick={() => openEditDialog(filament)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteFilament(filament.id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {expandedFilamentId === filament.id && (
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell colSpan={6}>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-muted-foreground">
                            Technical Specs
                          </h4>
                          <div className="grid grid-cols-2 gap-1">
                            <span className="text-muted-foreground">
                              Diameter:
                            </span>
                            <span>{filament.diameter_mm || 'N/A'} mm</span>
                            <span className="text-muted-foreground">
                              Density:
                            </span>
                            <span>{filament.density_g_cm3 || 'N/A'} g/cm³</span>
                            <span className="text-muted-foreground">
                              Texture:
                            </span>
                            <span>{filament.texture || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-muted-foreground">
                            Temperature
                          </h4>
                          <div className="grid grid-cols-2 gap-1">
                            <span className="text-muted-foreground">
                              Print Temp:
                            </span>
                            <span>
                              {filament.print_temp_min || '?'} -{' '}
                              {filament.print_temp_max || '?'} °C
                            </span>
                            <span className="text-muted-foreground">
                              Bed Temp:
                            </span>
                            <span>{filament.bed_temp_min || '?'} °C</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-muted-foreground">
                            Inventory
                          </h4>
                          <div className="grid grid-cols-2 gap-1">
                            <span className="text-muted-foreground">
                              Stock Qty:
                            </span>
                            <span>{filament.stock_qty} spools</span>
                            <span className="text-muted-foreground">
                              Weight/Spool:
                            </span>
                            <span>{filament.spool_weight_g} g</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFilament?.id ? 'Edit' : 'Add'} Filament
            </DialogTitle>
            <DialogDescription>
              Configure technical specifications and pricing for this material.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveFilament} className="space-y-6 py-4">
            {/* Group 1: Basic Info */}
            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="filament-name">Name</Label>
                  <Input
                    id="filament-name"
                    value={editingFilament?.name || ''}
                    onChange={(e) =>
                      setEditingFilament({
                        ...editingFilament,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filament-brand">Brand</Label>
                  <Input
                    id="filament-brand"
                    value={editingFilament?.brand || ''}
                    onChange={(e) =>
                      setEditingFilament({
                        ...editingFilament,
                        brand: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filament-type">Type</Label>
                  <Select
                    onValueChange={(value) =>
                      setEditingFilament({
                        ...editingFilament,
                        material_type: value,
                      })
                    }
                    value={editingFilament?.material_type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLA">PLA</SelectItem>
                      <SelectItem value="PETG">PETG</SelectItem>
                      <SelectItem value="ABS">ABS</SelectItem>
                      <SelectItem value="TPU">TPU</SelectItem>
                      <SelectItem value="ASA">ASA</SelectItem>
                      <SelectItem value="NYLON">Nylon</SelectItem>
                      <SelectItem value="PC">PC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filament-stock">Stock Qty</Label>
                  <Input
                    id="filament-stock"
                    type="number"
                    value={editingFilament?.stock_qty || 0}
                    onChange={(e) =>
                      setEditingFilament({
                        ...editingFilament,
                        stock_qty: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filament-cost">Cost/Spool (VND)</Label>
                  <Input
                    id="filament-cost"
                    type="number"
                    value={editingFilament?.cost_per_spool || ''}
                    onChange={(e) =>
                      setEditingFilament({
                        ...editingFilament,
                        cost_per_spool: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filament-weight">Spool Weight (g)</Label>
                  <Input
                    id="filament-weight"
                    type="number"
                    value={editingFilament?.spool_weight_g || ''}
                    onChange={(e) =>
                      setEditingFilament({
                        ...editingFilament,
                        spool_weight_g: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Technical Specs */}
            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                Technical Specifications
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="filament-density">Density (g/cm³)</Label>
                  <Input
                    id="filament-density"
                    type="number"
                    step="0.01"
                    value={editingFilament?.density_g_cm3 || ''}
                    onChange={(e) =>
                      setEditingFilament({
                        ...editingFilament,
                        density_g_cm3: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filament-diameter">Diameter (mm)</Label>
                  <Input
                    id="filament-diameter"
                    type="number"
                    step="0.01"
                    value={editingFilament?.diameter_mm || ''}
                    onChange={(e) =>
                      setEditingFilament({
                        ...editingFilament,
                        diameter_mm: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filament-bed-temp">Bed Temp (°C)</Label>
                  <Input
                    id="filament-bed-temp"
                    type="number"
                    value={editingFilament?.bed_temp_min || ''}
                    onChange={(e) =>
                      setEditingFilament({
                        ...editingFilament,
                        bed_temp_min: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filament-print-min">
                    Print Temp Min (°C)
                  </Label>
                  <Input
                    id="filament-print-min"
                    type="number"
                    value={editingFilament?.print_temp_min || ''}
                    onChange={(e) =>
                      setEditingFilament({
                        ...editingFilament,
                        print_temp_min: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filament-print-max">
                    Print Temp Max (°C)
                  </Label>
                  <Input
                    id="filament-print-max"
                    type="number"
                    value={editingFilament?.print_temp_max || ''}
                    onChange={(e) =>
                      setEditingFilament({
                        ...editingFilament,
                        print_temp_max: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Group 3: Visuals */}
            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                Visual Properties
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="filament-color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="filament-color"
                      type="color"
                      className="w-12 h-10 p-1 cursor-pointer"
                      value={editingFilament?.color_hex || '#FFFFFF'}
                      onChange={(e) =>
                        setEditingFilament({
                          ...editingFilament,
                          color_hex: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="text"
                      value={editingFilament?.color_hex || '#FFFFFF'}
                      onChange={(e) =>
                        setEditingFilament({
                          ...editingFilament,
                          color_hex: e.target.value,
                        })
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filament-texture">Texture / Finish</Label>
                  <Select
                    onValueChange={(value) =>
                      setEditingFilament({
                        ...editingFilament,
                        texture: value,
                      })
                    }
                    value={editingFilament?.texture || 'Glossy'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select finish" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Glossy">Glossy</SelectItem>
                      <SelectItem value="Matte">Matte</SelectItem>
                      <SelectItem value="Silk">Silk</SelectItem>
                      <SelectItem value="Transparent">Transparent</SelectItem>
                      <SelectItem value="Wood">Wood Fill</SelectItem>
                      <SelectItem value="Carbon">Carbon Fiber</SelectItem>
                      <SelectItem value="Glow">Glow in Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// --- Main Page Component ---
export default function PrintingSettingsPage() {
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
          <span className="font-medium text-foreground">
            3D Printing Settings
          </span>
        </nav>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">3D Printing Management</h1>
          <Button asChild variant="outline">
            <Link href="/admin/printing/parts">
              Manage Parts <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">General Config</TabsTrigger>
            <TabsTrigger value="machines">Machine Groups</TabsTrigger>
            <TabsTrigger value="filaments">Filaments</TabsTrigger>
          </TabsList>
          <TabsContent value="config">
            <GeneralConfigTab />
          </TabsContent>
          <TabsContent value="machines">
            <MachineGroupsTab />
          </TabsContent>
          <TabsContent value="filaments">
            <FilamentsTab />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
}
