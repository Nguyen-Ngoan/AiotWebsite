'use client';

import { useState, useEffect } from 'react';
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

export interface TechnicalDoc {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  doc_type: string;
}

export interface PrintedPart {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url: string;
  technical_doc?: TechnicalDoc;
  print_profiles: PrintProfile[];
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
      <div className="space-y-6">
        <div className="aspect-square relative rounded-xl overflow-hidden border bg-muted/30 flex items-center justify-center">
          {/* Main Image or 3D Viewer Placeholder */}
          {part.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={part.thumbnail_url}
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
          <div className="absolute bottom-4 right-4">
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-secondary/80"
            >
              <Box className="w-4 h-4" /> 3D View
            </Badge>
          </div>
        </div>

        {/* Thumbnails / Additional Images (Placeholder) */}
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-md bg-muted/50 border cursor-pointer hover:border-primary transition-colors"
            />
          ))}
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
          {part.technical_doc && (
            <p className="text-sm text-muted-foreground mt-1">
              Design Ref: {part.technical_doc.title}
            </p>
          )}
        </div>

        <div className="prose prose-sm text-muted-foreground">
          <p>{part.description || 'No description available for this part.'}</p>
        </div>

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
    </div>
  );
}
