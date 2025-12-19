'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Clock,
  Weight,
  Printer,
  Info,
  ShoppingCart,
  Box,
  AlertCircle,
  Edit,
  FileCode,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// --- Types ---
export interface PrintProfile {
  profile_name: string;
  material_type: string;
  calculated_price: number | null;
  estimated_time_min: number;
  filament_weight_g: number;
  is_default: boolean;
  price_error?: string;
}

export interface ProductImage {
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

export interface TechnicalDoc {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  doc_type: string;
  metadata?: {
    machine_model?: string;
    material_type?: string;
    nozzle?: number;
  };
}

const STLViewer = dynamic(() => import('@/components/STLViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      Loading 3D Model...
    </div>
  ),
});

export interface PrintedPart {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url: string;
  stl_file?: TechnicalDoc;
  step_file?: TechnicalDoc;
  gcode_files?: TechnicalDoc[];
  print_profiles: PrintProfile[];
  images?: ProductImage[];
}

interface PartDetailClientProps {
  part: PrintedPart;
  isAdmin?: boolean;
}

export default function PartDetailClient({
  part,
  isAdmin = false,
}: PartDetailClientProps) {
  const [selectedProfile, setSelectedProfile] = useState<PrintProfile | null>(
    null
  );
  const [activeImage, setActiveImage] = useState<string>(
    part.thumbnail_url || ''
  );
  const [is3dViewOpen, setIs3dViewOpen] = useState(false);

  // Cập nhật ảnh chính khi dữ liệu part thay đổi
  useEffect(() => {
    if (part.images && part.images.length > 0) {
      // Ưu tiên hiển thị ảnh Primary (dùng size medium/large cho ảnh chính)
      const primary =
        part.images.find((img) => img.isPrimary) || part.images[0];
      setActiveImage(primary.url_medium || primary.url);
    } else {
      setActiveImage(part.thumbnail_url || '');
    }
  }, [part]);

  // Cập nhật ảnh chính khi dữ liệu part thay đổi
  useEffect(() => {
    if (part.images && part.images.length > 0) {
      // Ưu tiên hiển thị ảnh Primary (dùng size medium/large cho ảnh chính)
      const primary =
        part.images.find((img) => img.isPrimary) || part.images[0];
      setActiveImage(primary.url_medium || primary.url);
    } else {
      setActiveImage(part.thumbnail_url || '');
    }
  }, [part]);

  // Initialize default profile
  useEffect(() => {
    if (part.print_profiles && part.print_profiles.length > 0) {
      const defaultProfile =
        part.print_profiles.find((p) => p.is_default) || part.print_profiles[0];
      setSelectedProfile(defaultProfile);
    }
  }, [part.print_profiles]);

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'Contact for Quote';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Media & 3D Viewer */}
      <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
        <div className="flex flex-col items-center space-y-2">
          {part.stl_file?.thumbnail_url && (
            <div
              onClick={() => setIs3dViewOpen(true)}
              title={part.stl_file.title}
              className="block cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={part.stl_file.thumbnail_url}
                alt={part.stl_file.title}
                className="h-12 w-12 flex-shrink-0 rounded-md border border-gray-300 bg-gray-100 object-contain transition-all duration-200 hover:scale-105 hover:border-primary"
              />
            </div>
          )}
          {part.step_file?.thumbnail_url && (
            <a
              href={part.step_file.url}
              target="_blank"
              rel="noopener noreferrer"
              title={part.step_file.title}
              className="block cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={part.step_file.thumbnail_url}
                alt={part.step_file.title}
                className="h-12 w-12 flex-shrink-0 rounded-md border border-gray-300 bg-gray-100 object-contain transition-all duration-200 hover:scale-105 hover:border-primary"
              />
            </a>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="aspect-[3/2] relative rounded-xl overflow-hidden border bg-muted/30 flex items-center justify-center">
            {/* Main Image or 3D Viewer Placeholder */}
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage}
                alt={part.title}
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <Box className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p>No Preview Available</p>
              </div>
            )}

            {/* 3D Viewer Placeholder Badge */}
            {part.stl_file?.url && (
              <div className="absolute bottom-4 right-4">
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => setIs3dViewOpen(true)}
                >
                  <Box className="w-4 h-4" /> 3D View
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails / Additional Images */}
          {part.images && part.images.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {part.images.map((img) => (
                <div
                  key={img.id}
                  className={`h-14 w-14 rounded-md bg-muted/50 border cursor-pointer overflow-hidden transition-all ${
                    activeImage === (img.url_medium || img.url)
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary'
                  }`}
                  onClick={() => setActiveImage(img.url_medium || img.url)}
                >
                  <img
                    src={img.url_thumb}
                    alt={img.alt || part.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Info & Actions */}
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {part.title}
            </h1>
            {isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/printing/parts">
                  <Edit className="w-4 h-4 mr-2" /> Manage Parts
                </Link>
              </Button>
            )}
          </div>
          {part.stl_file && (
            <p className="text-sm text-muted-foreground mt-1">
              STL: {part.stl_file.title}
            </p>
          )}
          {part.step_file && (
            <p className="text-sm text-muted-foreground mt-1">
              STEP: {part.step_file.title}
            </p>
          )}
        </div>

        <div className="prose prose-sm text-muted-foreground">
          <p>{part.description || 'No description available for this part.'}</p>
        </div>

        {part.gcode_files && part.gcode_files.length > 0 && (
          <div className="rounded-md border bg-muted/30 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <FileCode className="h-4 w-4" />
              Pre-sliced G-code Files
            </h3>
            <div className="grid gap-2">
              {part.gcode_files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-md border bg-background p-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{file.title}</span>
                    {file.metadata && (
                      <span className="text-xs text-muted-foreground">
                        {file.metadata.machine_model || 'Unknown Machine'} •{' '}
                        {file.metadata.material_type || 'Unknown Material'}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={file.url} download title="Download G-code">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Dynamic Pricing Selector */}
        <Card className="border-primary/10 bg-primary/5">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Select Material & Quality
              </label>
              <Select
                value={selectedProfile?.profile_name}
                onValueChange={(val) => {
                  const profile = part.print_profiles.find(
                    (p) => p.profile_name === val
                  );
                  if (profile) setSelectedProfile(profile);
                }}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent>
                  {part.print_profiles.map((profile, idx) => (
                    <SelectItem key={idx} value={profile.profile_name}>
                      {profile.profile_name} ({profile.material_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProfile ? (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    Estimated Price
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(selectedProfile.calculated_price)}
                  </span>
                </div>

                {selectedProfile.price_error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Pricing Error</AlertTitle>
                    <AlertDescription>
                      Could not calculate price: {selectedProfile.price_error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-2 rounded border">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>
                      {formatTime(selectedProfile.estimated_time_min)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-2 rounded border">
                    <Weight className="w-4 h-4 text-primary" />
                    <span>{selectedProfile.filament_weight_g}g</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-2 rounded border col-span-2">
                    <Printer className="w-4 h-4 text-primary" />
                    <span>Material: {selectedProfile.material_type}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Please select a printing profile to see pricing.
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!selectedProfile || !selectedProfile.calculated_price}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Order Print
            </Button>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-4 rounded-lg">
          <Info className="w-5 h-5 shrink-0 text-primary" />
          <p>
            Prices are estimated based on material usage and machine time. Final
            price may vary slightly depending on post-processing requirements.
          </p>
        </div>
      </div>

      {/* 3D Viewer Dialog */}
      {part.stl_file?.url && (
        <Dialog open={is3dViewOpen} onOpenChange={setIs3dViewOpen}>
          <DialogContent className="max-w-3xl h-[70vh] p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>{part.title} - 3D Model</DialogTitle>
            </DialogHeader>
            <div className="h-full w-full">
              <STLViewer stlUrl={part.stl_file.url} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
