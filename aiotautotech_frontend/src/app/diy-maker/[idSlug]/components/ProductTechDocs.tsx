// src/app/diy-maker/[idSlug]/components/ProductTechDocs.tsx

interface ProductTechDocsProps {
  datasheet_url?: string;
  schematic_url?: string;
  step_model_url?: string;
  stl_files_url?: string;
  user_manual_url?: string;
  github_repo_url?: string;
}

export function ProductTechDocs({ datasheet_url, schematic_url, step_model_url, stl_files_url, user_manual_url, github_repo_url }: ProductTechDocsProps) {
  const hasAny = datasheet_url || schematic_url || step_model_url || stl_files_url || user_manual_url || github_repo_url;

  return (
    <details className="rounded-2xl border border-gray-800 bg-[#050608] p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-gray-100">
        Tài liệu kỹ thuật cho DIY / Maker
        <span className="ml-2 text-xs font-normal text-gray-500">(datasheet, schematic, model 3D…)</span>
      </summary>
      <div className="mt-3 space-y-2 border-t border-gray-800 pt-3 text-sm text-gray-200">
        {!hasAny && <p className="text-sm text-gray-400">Chưa đính kèm tài liệu kỹ thuật cho sản phẩm này.</p>}

        <ul className="space-y-1 text-sm">
          {datasheet_url && (
            <li>
              <span className="text-gray-400">Datasheet:&nbsp;</span>
              <a href={datasheet_url} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                Mở datasheet
              </a>
            </li>
          )}
          {schematic_url && (
            <li>
              <span className="text-gray-400">Schematic (mạch nguyên lý):&nbsp;</span>
              <a href={schematic_url} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                Xem schematic
              </a>
            </li>
          )}
          {step_model_url && (
            <li>
              <span className="text-gray-400">Model 3D STEP:&nbsp;</span>
              <a href={step_model_url} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                Tải file STEP
              </a>
            </li>
          )}
          {stl_files_url && (
            <li>
              <span className="text-gray-400">File STL in 3D:&nbsp;</span>
              <a href={stl_files_url} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                Tải file STL
              </a>
            </li>
          )}
          {user_manual_url && (
            <li>
              <span className="text-gray-400">Hướng dẫn sử dụng:&nbsp;</span>
              <a href={user_manual_url} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                Xem tài liệu
              </a>
            </li>
          )}
          {github_repo_url && (
            <li>
              <span className="text-gray-400">Source code / ví dụ:&nbsp;</span>
              <a href={github_repo_url} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                Mở GitHub repo
              </a>
            </li>
          )}
        </ul>
      </div>
    </details>
  );
}
