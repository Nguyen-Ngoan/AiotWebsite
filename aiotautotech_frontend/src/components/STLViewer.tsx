'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { STLLoader } from 'three-stdlib';
import { OrbitControls, Center, Environment } from '@react-three/drei';

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const geom = useLoader(STLLoader, url);
  return (
    <mesh geometry={geom} scale={0.05} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
}

interface STLViewerProps {
  stlUrl: string;
}

export default function STLViewer({ stlUrl }: STLViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <Center>
            <Model url={stlUrl} />
          </Center>
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
}
