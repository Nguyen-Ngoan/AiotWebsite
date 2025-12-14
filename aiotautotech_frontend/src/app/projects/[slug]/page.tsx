import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projectService } from '@/lib/api/projectService';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { navItems } from '@/components/layout/nav-items';
import { DetailedAnalysisPanel } from './components/DetailedAnalysisPanel';

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

  const hasGallery = project.images && project.images.length > 0;

  return (
    <>
      <Header navItems={navItems} />
      <div className="min-h-screen bg-white pt-12 pb-12 md:pt-28">
        {/* Breadcrumb - Minimal */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100">
          <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-2">
              <li className="flex">
                <div className="flex items-center">
                  <Link href="/" className="text-gray-400 hover:text-gray-500">
                    <svg
                      className="h-5 w-5 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="sr-only">Trang chủ</span>
                  </Link>
                </div>
              </li>
              <li>
                <span className="text-gray-300">/</span>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Projects
                </Link>
              </li>
              <li>
                <span className="text-gray-300">/</span>
              </li>
              <li>
                <span
                  className="text-sm font-medium text-gray-900"
                  aria-current="page"
                >
                  {project.slug}
                </span>
              </li>
            </ol>
          </nav>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 sm:mt-2 flex gap-12">
          {/* LEFT SIDEBAR - TOC */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
                Contents
              </h4>
              <nav className="space-y-1 border-l border-gray-200">
                <a
                  href="#overview"
                  className="block pl-4 text-sm text-gray-600 hover:text-gray-900 hover:border-l-2 hover:border-gray-900 py-1 -ml-px"
                >
                  1. Overview
                </a>
                <a
                  href="#solution"
                  className="block pl-4 text-sm text-gray-600 hover:text-gray-900 hover:border-l-2 hover:border-gray-900 py-1 -ml-px"
                >
                  2. Solution Analysis
                </a>
                {hasGallery && (
                  <a
                    href="#gallery"
                    className="block pl-4 text-sm text-gray-600 hover:text-gray-900 hover:border-l-2 hover:border-gray-900 py-1 -ml-px"
                  >
                    3. Project Gallery
                  </a>
                )}
                <a
                  href="#implementation"
                  className="block pl-4 text-sm text-gray-600 hover:text-gray-900 hover:border-l-2 hover:border-gray-900 py-1 -ml-px"
                >
                  {hasGallery ? '4.' : '3.'} Implementation Log
                </a>
                <a
                  href="#configuration"
                  className="block pl-4 text-sm text-gray-600 hover:text-gray-900 hover:border-l-2 hover:border-gray-900 py-1 -ml-px"
                >
                  {hasGallery ? '5.' : '4.'} Configuration
                </a>
                <a
                  href="#downloads"
                  className="block pl-4 text-sm text-gray-600 hover:text-gray-900 hover:border-l-2 hover:border-gray-900 py-1 -ml-px"
                >
                  {hasGallery ? '6.' : '5.'} Resources
                </a>
              </nav>

              {/* Admin Quick Link */}
              {isAdmin && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Admin Controls
                  </h4>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/admin/projects/${project.slug}/edit`}
                      className="text-xs font-mono text-gray-500 hover:text-blue-600"
                    >
                      [Edit Metadata]
                    </Link>
                    <Link
                      href={`/admin/projects/${project.slug}/bom`}
                      className="text-xs font-mono text-gray-500 hover:text-blue-600"
                    >
                      [Edit BOM]
                    </Link>
                    <Link
                      href={`/admin/projects/${project.slug}/steps`}
                      className="text-xs font-mono text-gray-500 hover:text-blue-600"
                    >
                      [Edit Log]
                    </Link>
                    <Link
                      href={`/admin/projects/${project.slug}/images`}
                      className="text-xs font-mono text-gray-500 hover:text-blue-600"
                    >
                      [Edit Gallery]
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 max-w-3xl min-w-0">
            {/* Mobile Admin Controls */}
            {isAdmin && (
              <div className="lg:hidden mb-6 px-4 py-2 bg-gray-50 border border-gray-200">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/admin/projects/${project.slug}/edit`}
                    className="text-xs font-mono text-blue-600 hover:underline"
                  >
                    [Metadata]
                  </Link>
                  <Link
                    href={`/admin/projects/${project.slug}/bom`}
                    className="text-xs font-mono text-blue-600 hover:underline"
                  >
                    [BOM]
                  </Link>
                  <Link
                    href={`/admin/projects/${project.slug}/steps`}
                    className="text-xs font-mono text-blue-600 hover:underline"
                  >
                    [Log]
                  </Link>
                  <Link
                    href={`/admin/projects/${project.slug}/images`}
                    className="text-xs font-mono text-blue-600 hover:underline"
                  >
                    [Gallery]
                  </Link>
                </div>
              </div>
            )}

            {/* Title Section */}
            <div className="mb-8 pb-0">
              <h1 className="text-3xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 font-mono">
                <span title="Phiên bản hiện tại">
                  Ver: {project.version || '1.0.0'}
                </span>
                <span title="Ngày cập nhật cuối cùng">
                  Last Updated: {new Date().toLocaleDateString('en-US')}
                </span>
                <span title="Tác giả">Author: AiotAutotech Engineering</span>
                {project.complexity_mechanical && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                    Level: {project.complexity_mechanical}/3
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Table of Contents */}
            <div className="lg:hidden mb-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Contents
              </h4>
              <nav className="flex flex-col space-y-3">
                <a
                  href="#overview"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
                >
                  <span className="w-6 text-gray-400 font-mono">1.</span>{' '}
                  Overview
                </a>
                <a
                  href="#solution"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
                >
                  <span className="w-6 text-gray-400 font-mono">2.</span>{' '}
                  Solution Analysis
                </a>
                {hasGallery && (
                  <a
                    href="#gallery"
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
                  >
                    <span className="w-6 text-gray-400 font-mono">3.</span>{' '}
                    Project Gallery
                  </a>
                )}
                <a
                  href="#implementation"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
                >
                  <span className="w-6 text-gray-400 font-mono">
                    {hasGallery ? '4.' : '3.'}
                  </span>{' '}
                  Implementation Log
                </a>
                <a
                  href="#configuration"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
                >
                  <span className="w-6 text-gray-400 font-mono">
                    {hasGallery ? '5.' : '4.'}
                  </span>{' '}
                  Configuration
                </a>
                <a
                  href="#downloads"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center"
                >
                  <span className="w-6 text-gray-400 font-mono">
                    {hasGallery ? '6.' : '5.'}
                  </span>{' '}
                  Resources
                </a>
              </nav>
            </div>

            {/* Problem Statement */}
            <section id="overview" className="mb-10 scroll-mt-28">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-gray-400 font-mono">1.</span> Problem
                Statement
                {isAdmin && (
                  <Link
                    href={`/admin/projects/${project.slug}/edit`}
                    className="ml-2 text-xs font-mono font-normal text-gray-300 hover:text-blue-600"
                  >
                    [Edit]
                  </Link>
                )}
              </h2>
              <div className="prose prose-slate max-w-none text-gray-700">
                <p className="lead whitespace-pre-line">
                  {project.problem_statement || project.description}
                </p>
                {/* Placeholder for extended text if description is short */}
                <p className="text-gray-500 italic text-sm mt-4">
                  * This project documentation outlines the technical
                  specifications, assembly instructions, and configuration
                  details required to replicate the system.
                </p>
              </div>
            </section>

            {/* Solution Analysis */}
            <section id="solution" className="mb-10 scroll-mt-28">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-gray-400 font-mono">2.</span> Solution
                Analysis
                {isAdmin && (
                  <Link
                    href={`/admin/projects/${project.slug}/solution`}
                    className="ml-2 text-xs font-mono font-normal text-gray-300 hover:text-blue-600"
                  >
                    [Edit]
                  </Link>
                )}
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-4">
                {/* Image as Diagram */}
                {project.block_diagram_url || project.thumbnail_url ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded bg-white">
                    <Image
                      src={
                        project.block_diagram_url || project.thumbnail_url || ''
                      }
                      alt="System Diagram"
                      fill
                      className="object-contain cursor-zoom-in"
                    />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400 italic">
                    No system diagram available.
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 italic text-center font-mono">
                Figure 1: System Architecture & Design Overview
              </p>

              {project.solution_analysis && (
                <DetailedAnalysisPanel
                  htmlContent={project.solution_analysis}
                />
              )}

              {project.video_url && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    Video Demonstration
                    {isAdmin && (
                      <Link
                        href={`/admin/projects/${project.slug}/edit`}
                        className="ml-2 text-xs font-mono font-normal text-gray-300 hover:text-blue-600 normal-case"
                      >
                        [Edit]
                      </Link>
                    )}
                  </h3>
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200 bg-black">
                    <iframe
                      src={project.video_url.replace('watch?v=', 'embed/')}
                      title="Video hướng dẫn"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Project Gallery */}
            {hasGallery && (
              <section id="gallery" className="mb-10 scroll-mt-28">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-gray-400 font-mono">3.</span> Project
                  Gallery
                  {isAdmin && (
                    <Link
                      href={`/admin/projects/${project.slug}/images`}
                      className="ml-2 text-xs font-mono font-normal text-gray-300 hover:text-blue-600"
                    >
                      [Edit]
                    </Link>
                  )}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.images?.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                    >
                      <Image
                        src={img.url_medium || img.url}
                        alt={img.alt || project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Implementation Log */}
            <section id="implementation" className="mb-10 scroll-mt-28">
              <h2 className="group text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-gray-400 font-mono">
                  {hasGallery ? '4.' : '3.'}
                </span>{' '}
                Implementation Log
                {isAdmin && (
                  <Link
                    href={`/admin/projects/${project.slug}/steps`}
                    className="ml-2 text-xs font-mono font-normal text-gray-300 hover:text-blue-600"
                  >
                    [Edit]
                  </Link>
                )}
              </h2>
              <div className="space-y-8 border-l-2 border-gray-100 pl-6 ml-2">
                {sortedSteps.length > 0 ? (
                  sortedSteps.map((step, index) => (
                    <div key={index} className="relative group">
                      <span className="absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-gray-200 text-xs font-mono font-medium text-gray-500 group-hover:border-gray-900 group-hover:text-gray-900 transition-colors">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <div className="prose prose-slate max-w-none text-gray-600 text-sm">
                        <div className="whitespace-pre-line">
                          {step.content}
                        </div>
                      </div>
                      {step.image_url && (
                        <div className="mt-4">
                          <img
                            src={step.image_url}
                            alt={step.title}
                            className="rounded border border-gray-200 cursor-zoom-in hover:shadow-lg transition-shadow max-h-96 object-contain bg-gray-50"
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    No implementation steps recorded.
                  </p>
                )}
              </div>
            </section>

            {/* Configuration Table */}
            <section id="configuration" className="mb-10 scroll-mt-28">
              <h2 className="group text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-gray-400 font-mono">
                  {hasGallery ? '5.' : '4.'}
                </span>{' '}
                Configuration
                {isAdmin && (
                  <Link
                    href={`/admin/projects/${project.slug}/bom`}
                    className="ml-2 text-xs font-mono font-normal text-gray-300 hover:text-blue-600"
                  >
                    [Edit]
                  </Link>
                )}
              </h2>

              {/* Display Total Cost if available (Live Reference) */}
              {typeof project.total_cost === 'number' &&
                project.total_cost > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
                    <span className="text-blue-900 font-medium">
                      Estimated Total Cost (Live)
                    </span>
                    <span className="text-2xl font-bold text-blue-700">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(project.total_cost)}
                    </span>
                  </div>
                )}

              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-mono"
                      >
                        Component
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-mono"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-mono"
                      >
                        Unit Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-mono"
                      >
                        Qty
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-mono"
                      >
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Render Live Products */}
                    {project.products?.map((item) => (
                      <tr key={`prod-${item.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {item.product.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 uppercase">
                          Product
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right font-mono">
                          {new Intl.NumberFormat('vi-VN').format(
                            item.product.base_price
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right font-mono">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-mono font-medium">
                          {new Intl.NumberFormat('vi-VN').format(item.subtotal)}
                        </td>
                      </tr>
                    ))}

                    {/* Render Live Materials */}
                    {project.materials?.map((item) => (
                      <tr key={`mat-${item.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.material.name}
                          <div className="text-xs text-gray-500 font-normal">
                            {item.material.specifications}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 uppercase">
                          Material
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right font-mono">
                          {new Intl.NumberFormat('vi-VN').format(
                            item.material.unit_price
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 text-right font-mono">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-mono font-medium">
                          {new Intl.NumberFormat('vi-VN').format(item.subtotal)}
                        </td>
                      </tr>
                    ))}

                    {/* Fallback to Legacy BOM if no live data */}
                    {!project.products?.length &&
                    !project.materials?.length &&
                    project.bom &&
                    project.bom.length > 0
                      ? project.bom.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              <Link
                                href={`/diy-maker/${item.product_id}`}
                                className="hover:text-blue-600 hover:underline decoration-blue-600/30"
                                title="View Component Details"
                              >
                                {item.product_name}
                              </Link>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500 uppercase">
                              Snapshot
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 text-right font-mono">
                              {new Intl.NumberFormat('vi-VN').format(
                                item.unit_price
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 text-right font-mono">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-right font-mono font-medium">
                              {new Intl.NumberFormat('vi-VN').format(
                                item.unit_price * item.quantity
                              )}
                            </td>
                          </tr>
                        ))
                      : !project.products?.length &&
                        !project.materials?.length && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-4 text-center text-sm text-gray-500 italic"
                            >
                              No configuration data available.
                            </td>
                          </tr>
                        )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Footer / Downloads */}
            <section
              id="downloads"
              className="pt-8 border-t border-gray-200 scroll-mt-28"
            >
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Resources & Downloads
              </h2>
              <div className="flex flex-wrap gap-4">
                {project.attachments && project.attachments.length > 0 ? (
                  project.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        ></path>
                      </svg>
                      Download Source ({i + 1})
                    </a>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">
                    No downloadable resources.
                  </span>
                )}
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2.4-9h6m-6 4h6m-6-9h6M5 3a2 2 0 012-2h10a2 2 0 012 2v2H5V3z"
                    ></path>
                  </svg>
                  Print Spec Sheet
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
