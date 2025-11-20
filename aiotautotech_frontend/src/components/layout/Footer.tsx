// src/components/Footer.tsx

"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const brandName = "AIOT AutoTech"; // Đổi tên thương hiệu tại đây

type SectionId = "products" | "docs" | "contact";

type MobileSectionProps = {
  id: SectionId;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  withBorderBottom?: boolean;
};

function MobileAccordionSection({ title, isOpen, onToggle, children, withBorderBottom = true }: MobileSectionProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState<string>("0px");

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight + "px");
    } else {
      setMaxHeight("0px");
    }
  }, [isOpen, children]);

  return (
    <div className={`py-1 ${withBorderBottom ? "border-b border-gray-200 dark:border-gray-800" : ""}`}>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
        <span>{title}</span>
        <span className="ml-2 text-gray-500">{isOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}</span>
      </button>

      <div style={{ maxHeight }} className="overflow-hidden transition-all duration-300">
        <div ref={contentRef} className={`pb-2 pt-1 transform transition-all duration-300 ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [openSection, setOpenSection] = useState<SectionId | null>(null);

  const toggleSection = (id: SectionId) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <footer className="mt-16 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 lg:px-6 text-xs text-gray-700 dark:text-gray-300">
        {/* ====== MOBILE LAYOUT (accordion + slide down) ====== */}
        <div className="md:hidden">
          {/* Khối 1 — Giới thiệu nhanh về thương hiệu (luôn hiển thị) */}
          <div className="mb-6">
            <div className="mb-3 flex items-center space-x-2">
              <img src="/apple_logo.svg" alt={`${brandName} Logo`} className="h-5 w-auto invert dark:invert-0" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{brandName}</span>
            </div>

            <p className="mb-3 leading-relaxed text-gray-600 dark:text-gray-400">Chuyên cung cấp linh kiện IoT, bộ điều khiển chuyển động và giải pháp tự động hóa giá rẻ cho DIY, xưởng sản xuất nhỏ và nông nghiệp công nghệ.</p>

            <ul className="mb-3 space-y-1">
              <li>• Sản phẩm được thiết kế &amp; lắp ráp tại Việt Nam</li>
              <li>• Miễn phí tài liệu kỹ thuật (code, sơ đồ, file 3D)</li>
              <li>• Hỗ trợ kỹ thuật nhanh qua Zalo</li>
            </ul>

            <div className="flex flex-wrap items-center gap-2">
              <a href="#" className="underline-offset-2 hover:underline">
                Facebook
              </a>
              <span>•</span>
              <a href="#" className="underline-offset-2 hover:underline">
                YouTube
              </a>
              <span>•</span>
              <a href="#" className="underline-offset-2 hover:underline">
                TikTok
              </a>
              <span>•</span>
              <a href="#" className="underline-offset-2 hover:underline">
                Zalo
              </a>
            </div>
          </div>

          <hr className="mb-2 border-gray-200 dark:border-gray-800" />

          {/* Khối 2 — Sản phẩm theo nhóm khách hàng */}
          <MobileAccordionSection id="products" title="Sản phẩm theo nhóm khách hàng" isOpen={openSection === "products"} onToggle={() => toggleSection("products")} withBorderBottom={true}>
            <p className="mt-1 font-semibold text-gray-700 dark:text-gray-200">Sản phẩm DIY &amp; Maker</p>
            <ul className="mt-1 space-y-1">
              <li>
                <Link href="#" className="hover:underline">
                  Bộ điều khiển ESP32 / STM32
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Trục tuyến tính 3D-print
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Mạch IoT DIY
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Linh kiện 3D Print &amp; CNC
                </Link>
              </li>
            </ul>

            <p className="mt-3 font-semibold text-gray-700 dark:text-gray-200">Giải pháp tự động hóa cho xưởng</p>
            <ul className="mt-1 space-y-1">
              <li>
                <Link href="#" className="hover:underline">
                  Bộ điều khiển chuyển động 2–4 trục
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Trục chuyển động tải nhẹ – tải trung
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Máy phun men – bơm hồ – máy phụ trợ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Thiết kế theo yêu cầu
                </Link>
              </li>
            </ul>

            <p className="mt-3 font-semibold text-gray-700 dark:text-gray-200">IoT nông nghiệp</p>
            <ul className="mt-1 space-y-1">
              <li>
                <Link href="#" className="hover:underline">
                  Bộ tưới cây tự động (WiFi/BLE)
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Bộ giám sát độ ẩm – ánh sáng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Combo tưới lan/bonsai
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Hướng dẫn lắp đặt
                </Link>
              </li>
            </ul>
          </MobileAccordionSection>

          {/* Khối 3 — Tài liệu & Hỗ trợ kỹ thuật */}
          <MobileAccordionSection id="docs" title="Tài liệu & Hỗ trợ kỹ thuật" isOpen={openSection === "docs"} onToggle={() => toggleSection("docs")} withBorderBottom={true}>
            <p className="mt-1 font-semibold text-gray-700 dark:text-gray-200">Tài liệu kỹ thuật</p>
            <ul className="mt-1 space-y-1">
              <li>
                <Link href="#" className="hover:underline">
                  File 3D (STEP, STL)
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Sơ đồ mạch
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Code mẫu ESP32/STM32
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Hướng dẫn lắp đặt các bộ kit
                </Link>
              </li>
            </ul>

            <p className="mt-3 font-semibold text-gray-700 dark:text-gray-200">Hỗ trợ kỹ thuật</p>
            <ul className="mt-1 space-y-1">
              <li>
                <Link href="#" className="hover:underline">
                  Zalo hỗ trợ nhanh
                </Link>
              </li>
              <li>
                <Link href="mailto:contact@xxxx.com" className="hover:underline">
                  Email hỗ trợ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
            </ul>
          </MobileAccordionSection>

          {/* Khối 4 — Thông tin liên hệ & pháp lý (KHÔNG border-bottom) */}
          <MobileAccordionSection
            id="contact"
            title="Thông tin liên hệ & pháp lý"
            isOpen={openSection === "contact"}
            onToggle={() => toggleSection("contact")}
            withBorderBottom={false} // <-- bỏ đường phân cách dưới
          >
            <p className="mt-1 font-semibold text-gray-700 dark:text-gray-200">Thông tin liên hệ:</p>
            <ul className="mt-1 space-y-1">
              <li>Hotline: 0xxx xxx xxx</li>
              <li>
                Zalo hỗ trợ kỹ thuật:{" "}
                <a href="#" className="hover:underline">
                  link
                </a>
              </li>
              <li>
                Email:{" "}
                <a href="mailto:contact@xxxx.com" className="hover:underline">
                  contact@xxxx.com
                </a>
              </li>
              <li>Địa chỉ: (ghi ngắn gọn)</li>
            </ul>

            <p className="mt-3 font-semibold text-gray-700 dark:text-gray-200">Pháp lý:</p>
            <ul className="mt-1 space-y-1">
              <li>
                <Link href="#" className="hover:underline">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </MobileAccordionSection>
        </div>

        {/* ====== DESKTOP / TABLET LAYOUT (4 khối) ====== */}
        <div className="hidden md:block">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* (Phần desktop giữ nguyên như trước) */}
            {/* Khối 1 */}
            <div>
              <div className="mb-3 flex items-center space-x-2">
                <img src="/apple_logo.svg" alt={`${brandName} Logo`} className="h-6 w-auto invert dark:invert-0" />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{brandName}</span>
              </div>
              <p className="mb-3 leading-relaxed text-gray-600 dark:text-gray-400">Chuyên cung cấp linh kiện IoT, bộ điều khiển chuyển động và giải pháp tự động hóa giá rẻ cho DIY, xưởng sản xuất nhỏ và nông nghiệp công nghệ.</p>
              <ul className="mb-3 space-y-1">
                <li>• Sản phẩm được thiết kế &amp; lắp ráp tại Việt Nam</li>
                <li>• Miễn phí tài liệu kỹ thuật (code, sơ đồ, file 3D)</li>
                <li>• Hỗ trợ kỹ thuật nhanh qua Zalo</li>
              </ul>
              <div className="flex flex-wrap items-center gap-2">
                <a href="#" className="underline-offset-2 hover:underline">
                  Facebook
                </a>
                <span>•</span>
                <a href="#" className="underline-offset-2 hover:underline">
                  YouTube
                </a>
                <span>•</span>
                <a href="#" className="underline-offset-2 hover:underline">
                  TikTok
                </a>
                <span>•</span>
                <a href="#" className="underline-offset-2 hover:underline">
                  Zalo
                </a>
              </div>
            </div>

            {/* Khối 2 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Sản phẩm theo nhóm khách hàng</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Sản phẩm DIY &amp; Maker</p>
                  <ul className="mt-1 space-y-1">
                    <li>
                      <Link href="#" className="hover:underline">
                        Bộ điều khiển ESP32 / STM32
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Trục tuyến tính 3D-print
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Mạch IoT DIY
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Linh kiện 3D Print &amp; CNC
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Giải pháp tự động hóa cho xưởng</p>
                  <ul className="mt-1 space-y-1">
                    <li>
                      <Link href="#" className="hover:underline">
                        Bộ điều khiển chuyển động 2–4 trục
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Trục chuyển động tải nhẹ – tải trung
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Máy phun men – bơm hồ – máy phụ trợ
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Thiết kế theo yêu cầu
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">IoT nông nghiệp</p>
                  <ul className="mt-1 space-y-1">
                    <li>
                      <Link href="#" className="hover:underline">
                        Bộ tưới cây tự động (WiFi/BLE)
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Bộ giám sát độ ẩm – ánh sáng
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Combo tưới lan/bonsai
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Hướng dẫn lắp đặt
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Khối 3 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Tài liệu &amp; Hỗ trợ kỹ thuật</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Tài liệu kỹ thuật</p>
                  <ul className="mt-1 space-y-1">
                    <li>
                      <Link href="#" className="hover:underline">
                        File 3D (STEP, STL)
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Sơ đồ mạch
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Code mẫu ESP32/STM32
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Hướng dẫn lắp đặt các bộ kit
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Hỗ trợ kỹ thuật</p>
                  <ul className="mt-1 space-y-1">
                    <li>
                      <Link href="#" className="hover:underline">
                        Zalo hỗ trợ nhanh
                      </Link>
                    </li>
                    <li>
                      <Link href="mailto:contact@xxxx.com" className="hover:underline">
                        Email hỗ trợ
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Trung tâm trợ giúp
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Câu hỏi thường gặp (FAQ)
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Khối 4 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Thông tin liên hệ &amp; pháp lý</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Thông tin liên hệ:</p>
                  <ul className="mt-1 space-y-1">
                    <li>Hotline: 0xxx xxx xxx</li>
                    <li>
                      Zalo hỗ trợ kỹ thuật:{" "}
                      <a href="#" className="hover:underline">
                        link
                      </a>
                    </li>
                    <li>
                      Email:{" "}
                      <a href="mailto:contact@xxxx.com" className="hover:underline">
                        contact@xxxx.com
                      </a>
                    </li>
                    <li>Địa chỉ: (ghi ngắn gọn)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">Pháp lý:</p>
                  <ul className="mt-1 space-y-1">
                    <li>
                      <Link href="#" className="hover:underline">
                        Điều khoản sử dụng
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Chính sách bảo hành
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Chính sách đổi trả
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="hover:underline">
                        Chính sách bảo mật
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dòng bản quyền dưới cùng */}
        <div className="mt-6 border-t border-gray-200 pt-4 text-[11px] text-gray-500 dark:border-gray-800 dark:text-gray-500">
          <p className="text-center">© 2025 {brandName} — All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
