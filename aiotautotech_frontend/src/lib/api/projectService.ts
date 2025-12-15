import { getApiUrl } from '@/lib/apiConfig';

// =============================================================================
// 1. INTERFACES (Data Models)
// =============================================================================

export interface BOMItem {
  product_id: string;
  quantity: number;
  product_name: string;
  unit_price: number;
  usage_note?: string;
  is_optional?: boolean;
}

export interface ProjectProduct {
  id: string;
  product: {
    id: string;
    title: string;
    slug: string;
    base_price: number;
  };
  quantity: number;
  subtotal: number;
}

export interface ProjectMaterial {
  id: string;
  material: {
    id: string;
    name: string;
    unit_price: number;
    specifications: string;
  };
  quantity: number;
  subtotal: number;
}

export interface InstructionStep {
  order: number;
  title: string;
  content: string;
  image_url?: string;
}

export interface ProjectImage {
  id: string;
  fileName: string;
  type: 'cover' | 'gallery' | 'detail' | 'dimension';
  isPrimary: boolean;
  url: string;
  url_medium: string;
  url_thumb: string;
  alt?: string;
  title?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  video_url?: string;
  thumbnail_url?: string;
  tags?: string[];
  complexity_mechanical?: number;
  complexity_electrical?: number;
  complexity_software?: number;
  estimated_hours?: number;
  required_skills?: string[];
  created_at?: string;
  updated_at?: string;
  version?: string;
  status?: string;
  problem_statement?: string;
  solution_analysis?: string;
  block_diagram_url?: string;

  // Embedded Data
  bom?: BOMItem[];
  images?: ProjectImage[];
  products?: ProjectProduct[];
  materials?: ProjectMaterial[];
  steps?: InstructionStep[];
  attachments?: string[];

  // Calculated Fields
  total_cost?: number;
  estimated_cost?: number;
  view_count?: number;
}

export interface CreateProjectData {
  title: string;
  description: string;
  video_url?: string;
  thumbnail_url?: string;
  slug?: string;
  tags?: string[];
  complexity_mechanical?: number;
  complexity_electrical?: number;
  complexity_software?: number;
  estimated_hours?: number;
  required_skills?: string[];
  version?: string;
  status?: string;
  problem_statement?: string;
  solution_analysis?: string;
  block_diagram_url?: string;
  images?: ProjectImage[];
}

export interface AddBOMItemData {
  product_id: string;
  quantity: number;
  usage_note?: string;
  is_optional?: boolean;
}

export interface AddStepData {
  order: number;
  title: string;
  content: string;
  image_url?: string;
}

export interface CheckSlugPayload {
  slug: string;
  exclude_id?: string;
}

export interface CheckSlugResponse {
  available: boolean;
  message?: string;
}

// =============================================================================
// 2. SERVICE FUNCTIONS
// =============================================================================

export const projectService = {
  /**
   * Lấy danh sách dự án (mặc định 50 item mới nhất)
   */
  async getProjects(limit = 50): Promise<Project[]> {
    const url = getApiUrl(`/projects/?limit=${limit}`);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 60 }, // Cache ISR 60 giây
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.statusText}`);
    }

    return res.json();
  },

  /**
   * Lấy chi tiết dự án theo Slug (bao gồm BOM và Steps)
   */
  async getProjectBySlug(slug: string): Promise<Project> {
    const url = getApiUrl(`/projects/${slug}/`);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store', // Luôn lấy dữ liệu mới nhất cho trang chi tiết
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Project not found');
      }
      throw new Error(`Failed to fetch project detail: ${res.statusText}`);
    }

    return res.json();
  },

  /**
   * Tạo dự án mới
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    const url = getApiUrl('/projects/');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to create project: ${res.statusText}`
      );
    }

    return res.json();
  },

  /**
   * Cập nhật thông tin dự án
   */
  async updateProject(slug: string, data: CreateProjectData): Promise<Project> {
    const url = getApiUrl(`/projects/${slug}/`);
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to update project: ${res.statusText}`
      );
    }

    return res.json();
  },

  /**
   * Kiểm tra slug có tồn tại hay không
   */
  async checkSlug(payload: CheckSlugPayload): Promise<CheckSlugResponse> {
    const url = getApiUrl('/projects/check-slug/');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to check slug: ${res.statusText}`
      );
    }

    return res.json();
  },

  /**
   * Thêm linh kiện vào BOM
   */
  async addBOMItem(
    projectId: string,
    data: AddBOMItemData
  ): Promise<{ bom: BOMItem[] }> {
    const url = getApiUrl(`/projects/${projectId}/bom/`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to add BOM item: ${res.statusText}`
      );
    }

    return res.json();
  },

  /**
   * Thêm Product vào Project (Live Reference)
   */
  async addProduct(
    projectId: string,
    data: { product_id: string; quantity: number }
  ): Promise<any> {
    const url = getApiUrl(`/projects/${projectId}/add-product/`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to add product: ${res.statusText}`
      );
    }

    return res.json();
  },

  /**
   * Thêm Material vào Project (Live Reference)
   */
  async addMaterial(
    projectId: string,
    data: { material_id: string; quantity: number }
  ): Promise<any> {
    const url = getApiUrl(`/projects/${projectId}/add-material/`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to add material: ${res.statusText}`
      );
    }

    return res.json();
  },

  /**
   * Upload ảnh thumbnail cho dự án
   */
  async uploadThumbnail(
    projectId: string,
    file: File
  ): Promise<{ thumbnail_url: string }> {
    const url = getApiUrl(`/projects/${projectId}/thumbnail/`);
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to upload thumbnail: ${res.statusText}`
      );
    }

    return res.json();
  },

  /**
   * Upload ảnh gallery cho dự án
   */
  async uploadProjectImage(
    projectId: string,
    file: File,
    metadata: {
      seo_file_name: string;
      type: string;
      is_primary: boolean;
      alt?: string;
      title?: string;
    }
  ): Promise<{ images: ProjectImage[] }> {
    const url = getApiUrl(`/projects/${projectId}/images/`);
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const res = await fetch(url, { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },

  /**
   * Xóa ảnh khỏi thư viện dự án
   */
  async deleteProjectImage(projectId: string, fileName: string): Promise<void> {
    const url = getApiUrl(`/projects/${projectId}/images/delete/`);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Delete failed');
    }
  },

  /**
   * Cập nhật (thay thế) toàn bộ danh sách các bước thực hiện của dự án.
   * Dùng cho việc sắp xếp, sửa, xoá các bước.
   */
  async updateProjectSteps(projectId: string, steps: any[]): Promise<void> {
    const url = getApiUrl(`/projects/${projectId}/steps/`);
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ steps }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to update project steps: ${res.statusText}`
      );
    }
    // No content is returned on success, so the promise is void
  },

  /**
   * Thêm bước hướng dẫn (Steps)
   */
  async addInstructionStep(
    projectId: string,
    data: AddStepData
  ): Promise<{ status: string }> {
    const url = getApiUrl(`/projects/${projectId}/steps/`);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to add instruction step: ${res.statusText}`
      );
    }

    return res.json();
  },
};
