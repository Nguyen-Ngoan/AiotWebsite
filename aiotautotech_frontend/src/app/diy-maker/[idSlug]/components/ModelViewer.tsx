// src/app/diy-maker/[idSlug]/components/ModelViewer.tsx
'use client';

import { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

function Model({ url }: { url: string }) {
  // useLoader là một hook của @react-three/fiber để tải các tài nguyên
  // Nó tự động xử lý việc tải và tích hợp với Suspense
  const geom = useLoader(STLLoader, url);

  return (
    <mesh geometry={geom}>
      {/* 
        Đây là vật liệu mặc định. Bạn có thể thay đổi màu sắc, độ bóng,... tại đây.
        Ví dụ: <meshStandardMaterial color="#ff8000" roughness={0.5} />
      */}
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
}

export default function ModelViewer({ fileUrl }: { fileUrl: string }) {
  if (!fileUrl) return null;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '400px',
        aspectRatio: '1 / 1', // Giữ tỷ lệ 1:1 (hình vuông)
        backgroundColor: '#111',
        borderRadius: '8px',
        border: '1px solid #1f2937', // Tương ứng với border-gray-800
        overflow: 'hidden', // Đảm bảo canvas bên trong không tràn ra ngoài border radius
      }}
    >
      <Canvas dpr={[1, 2]} camera={{ fov: 45, position: [-60, 60, 60] }}>
        <Suspense fallback={null}>
          {/* Stage tạo ra một môi trường ánh sáng và sàn diễn đẹp mắt */}
          <Stage environment="city" intensity={0.6} adjustCamera={false}>
            <Model url={fileUrl} />
          </Stage>
        </Suspense>
        {/* OrbitControls cho phép người dùng xoay, zoom, và di chuyển model */}
        <OrbitControls makeDefault autoRotate autoRotateSpeed={1.0} />
      </Canvas>
    </div>
  );
}
