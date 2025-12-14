import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projectService } from '@/lib/api/projectService';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { navItems } from '@/components/layout/nav-items';
import { ConfigurationTable } from './components/ConfigurationTable';
import { ProjectBreadcrumb } from './components/ProjectBreadcrumb';
import { ProjectDownloads } from './components/ProjectDownloads';
import { ProjectGallery } from './components/ProjectGallery';
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectImplementationLog } from './components/ProjectImplementationLog';
import { ProjectOverview } from './components/ProjectOverview';
import { ProjectSidebar } from './components/ProjectSidebar';
import { ProjectSolution } from './components/ProjectSolution';
import { MobileNav } from './components/MobileNav';

interface ProjectDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  try {
    const project = await projectService.getProjectBySlug(slug);
    return {
      title: `${project.title} | AiotAutotech DIY`,
      description: project.description,
      openGraph: {
        images: project.thumbnail_url ? [project.thumbnail_url] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Dự án không tồn tại',
    };
  }
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;

  // TODO: Tích hợp logic kiểm tra quyền Admin thực tế tại đây
  const isAdmin = true;

  let project;
  try {
    project = await projectService.getProjectBySlug(slug);
  } catch (error) {
    notFound();
  }

  // Sắp xếp các bước theo thứ tự
  const sortedSteps = project.steps
    ? [...project.steps].sort((a, b) => a.order - b.order)
    : [];

  const hasGallery = !!(project.images && project.images.length > 0);

  return (
    <>
      <Header navItems={navItems} />
      <div className="min-h-screen bg-white pt-12 pb-12 md:pt-28">
        {/* Breadcrumb - Minimal */}
        <ProjectBreadcrumb slug={project.slug} />

        <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-1 lg:mt-4 flex gap-12">
          {/* LEFT SIDEBAR - TOC */}
          <ProjectSidebar
            slug={project.slug}
            hasGallery={hasGallery}
            isAdmin={isAdmin}
          />

          {/* MAIN CONTENT */}
          <main className="flex-1 max-w-3xl min-w-0">
            <MobileNav
              slug={project.slug}
              isAdmin={isAdmin}
              hasGallery={hasGallery}
            />

            {/* Title Section */}
            <ProjectHeader project={project} />

            {/* Problem Statement */}
            <ProjectOverview project={project} />

            {/* Solution Analysis */}
            <ProjectSolution project={project} isAdmin={isAdmin} />

            {/* Project Gallery */}
            {hasGallery && (
              <ProjectGallery project={project} isAdmin={isAdmin} />
            )}

            {/* Implementation Log */}
            <ProjectImplementationLog
              project={project}
              sortedSteps={sortedSteps}
              hasGallery={hasGallery}
              isAdmin={isAdmin}
            />

            <ConfigurationTable
              project={project}
              isAdmin={isAdmin}
              hasGallery={hasGallery}
            />

            {/* Footer / Downloads */}
            <ProjectDownloads project={project} hasGallery={hasGallery} />
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
