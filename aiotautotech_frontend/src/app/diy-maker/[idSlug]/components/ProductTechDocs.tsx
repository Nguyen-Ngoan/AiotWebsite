// src/app/diy-maker/[idSlug]/components/ProductTechDocs.tsx

interface ProductTechDocsProps {
  datasheet_url?: string;
  schematic_url?: string;
  step_model_url?: string;
  stl_files_url?: string;
  user_manual_url?: string;
  github_repo_url?: string;
}

export function ProductTechDocs({
  datasheet_url,
  schematic_url,
  step_model_url,
  stl_files_url,
  user_manual_url,
  github_repo_url,
}: ProductTechDocsProps) {
  const hasAny =
    datasheet_url ||
    schematic_url ||
    step_model_url ||
    stl_files_url ||
    user_manual_url ||
    github_repo_url;

  return (
    <details
      className="group rounded-xl border border-gray-800 bg-[#050608]"
      open
    >
      <summary className="flex cursor-pointer list-none items-center justify-between py-2 pl-3 pr-4 sm:pl-4 sm:pr-6">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-[#8883c8]">
            Tài liệu kỹ thuật
          </h2>
        </div>
        <div className="relative ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="hidden h-3.5 w-3.5 group-open:block"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 group-open:hidden"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </summary>
      <div className="border-t border-gray-800 px-4 pb-4 pt-3 sm:px-6 sm:pb-4 sm:pt-3">
        {!hasAny && (
          <p className="text-sm text-gray-400">
            Chưa đính kèm tài liệu kỹ thuật cho sản phẩm này.
          </p>
        )}
        {hasAny && (
          <ul className="space-y-1 text-sm">
            {datasheet_url && (
              <li>
                <span className="text-gray-400">Datasheet:&nbsp;</span>
                <a
                  href={datasheet_url}
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Mở datasheet
                </a>
              </li>
            )}
            {schematic_url && (
              <li>
                <span className="text-gray-400">
                  Schematic (mạch nguyên lý):&nbsp;
                </span>
                <a
                  href={schematic_url}
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Xem schematic
                </a>
              </li>
            )}
            {step_model_url && (
              <li>
                <span className="text-gray-400">Model 3D STEP:&nbsp;</span>
                <a
                  href={step_model_url}
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Tải file STEP
                </a>
              </li>
            )}
            {stl_files_url && (
              <li>
                <span className="text-gray-400">File STL in 3D:&nbsp;</span>
                <a
                  href={stl_files_url}
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Tải file STL
                </a>
              </li>
            )}
            {user_manual_url && (
              <li>
                <span className="text-gray-400">Hướng dẫn sử dụng:&nbsp;</span>
                <a
                  href={user_manual_url}
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Xem tài liệu
                </a>
              </li>
            )}
            {github_repo_url && (
              <li>
                <span className="text-gray-400">
                  Source code / ví dụ:&nbsp;
                </span>
                <a
                  href={github_repo_url}
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Mở GitHub repo
                </a>
              </li>
            )}
          </ul>
        )}
      </div>
    </details>
  );
}
