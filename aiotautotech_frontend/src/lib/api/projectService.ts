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

export interface InstructionStep {
  order: number;
  title: string;
  content: string;
  image_url?: string;
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

  // Embedded Data
  bom?: BOMItem[];
  steps?: InstructionStep[];
  attachments?: string[];

  // Calculated Fields
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
