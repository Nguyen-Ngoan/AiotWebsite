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
import { ProjectHeader } from './components/ProjectHeader';
import { ProjectImplementationLog } from './components/ProjectImplementationLog';
import { ProjectOverview } from './components/ProjectOverview';
import { ProjectSidebar } from './components/ProjectSidebar';
import { ProjectSolution } from './components/ProjectSolution';
import { MobileNav } from './components/MobileNav';
import { ProjectMediaSlider } from './components/ProjectMediaSlider';

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

  // Check if there is any media (video or images) to display in the slider
  const hasMedia =
    !!project.video_url || !!(project.images && project.images.length > 0);

  return (
    <>
      <Header navItems={navItems} />
      <div className="min-h-screen bg-white pt-12 pb-12 md:pt-28">
        {/* Breadcrumb - Minimal */}
        <ProjectBreadcrumb slug={project.slug} />

        <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-1 lg:mt-4 flex gap-12">
          {/* LEFT SIDEBAR - TOC */}
          <ProjectSidebar slug={project.slug} isAdmin={isAdmin} />

          {/* MAIN CONTENT */}
          <main className="flex-1 max-w-3xl min-w-0">
            {/* Title Section */}
            <ProjectHeader project={project} />

            {/* Media Slider (Video + Gallery) */}
            {hasMedia && <ProjectMediaSlider project={project} />}

            <MobileNav slug={project.slug} isAdmin={isAdmin} />

            {/* Problem Statement */}
            <ProjectOverview project={project} />

            {/* Solution Analysis */}
            <ProjectSolution project={project} isAdmin={isAdmin} />

            {/* Implementation Log */}
            <ProjectImplementationLog
              project={project}
              sortedSteps={sortedSteps}
              isAdmin={isAdmin}
            />

            <ConfigurationTable project={project} isAdmin={isAdmin} />

            {/* Footer / Downloads */}
            <ProjectDownloads project={project} />

            {/* Project Meta Footer */}
            <div className="mt-8 border-t border-gray-100 pt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 font-mono">
              <span title="Phiên bản hiện tại">
                Ver: {project.version || '1.0'}
              </span>
              {project.updated_at && (
                <span title="Ngày cập nhật cuối cùng">
                  Cập nhật:{' '}
                  {new Date(project.updated_at).toLocaleDateString('vi-VN')}
                </span>
              )}
              <span title="Tác giả">Tác giả: AiotAutotech</span>
              {project.complexity_mechanical && (
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                  Độ khó: {project.complexity_mechanical}/3
                </span>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
