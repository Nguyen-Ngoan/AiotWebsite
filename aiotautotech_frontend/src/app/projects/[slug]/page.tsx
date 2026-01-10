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
import { ProjectAIPlaybooks, Playbook } from './components/ProjectAIPlaybooks';

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

  // Giả lập dữ liệu Playbooks (Thực tế sẽ lấy từ project object hoặc API riêng)
  const playbooks: Playbook[] = [
    {
      id: 'pb-1',
      topic_name: 'Modbus RTU Integration',
      domain: 'FIRMWARE',
      prompts: [
        {
          stage: 'CONCEPT',
          title: 'Phân tích giao thức Modbus',
          content:
            'Tôi đang phát triển firmware cho thiết bị IoT sử dụng Modbus RTU. Hãy phân tích cấu trúc frame cho function code 0x03 (Read Holding Registers) với Slave ID là {{slave_id}} và bắt đầu từ thanh ghi {{start_addr}}.',
          variables: ['slave_id', 'start_addr'],
        },
        {
          stage: 'UNIT_TEST',
          title: 'Viết Unit Test cho Parser',
          content:
            'Viết mã C++ sử dụng ArduinoFake để test hàm parseModbusResponse. Giả sử baudrate là {{baudrate}}.',
          variables: ['baudrate'],
        },
      ],
    },
  ];

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

            {/* Status & Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                {project.status || 'PROTOTYPE'}
              </span>
              {project.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>

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

            <ProjectAIPlaybooks projectId={project.id} playbooks={playbooks} />

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

              {/* Complexities */}
              <div className="flex gap-2">
                {(project.complexity_mechanical ?? 0) > 0 && (
                  <span
                    className="px-2 py-0.5 bg-gray-100 rounded text-[10px]"
                    title="Độ khó cơ khí"
                  >
                    Cơ khí: {project.complexity_mechanical}/5
                  </span>
                )}
                {(project.complexity_electrical ?? 0) > 0 && (
                  <span
                    className="px-2 py-0.5 bg-gray-100 rounded text-[10px]"
                    title="Độ khó điện tử"
                  >
                    Điện tử: {project.complexity_electrical}/5
                  </span>
                )}
                {(project.complexity_software ?? 0) > 0 && (
                  <span
                    className="px-2 py-0.5 bg-gray-100 rounded text-[10px]"
                    title="Độ khó phần mềm"
                  >
                    Lập trình: {project.complexity_software}/5
                  </span>
                )}
              </div>

              {(project.estimated_hours ?? 0) > 0 && (
                <span title="Thời gian thực hiện dự kiến">
                  Ước tính: ~{project.estimated_hours}h
                </span>
              )}

              {(project.required_skills?.length ?? 0) > 0 && (
                <div className="w-full mt-2 text-[11px] text-gray-400 italic">
                  Kỹ năng cần thiết: {project.required_skills?.join(', ')}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
