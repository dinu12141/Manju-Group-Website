import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Stars,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";

export default function Scene3D() {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  // Mouse interaction
  const mouse = useRef({ x: 0, y: 0 });

  useFrame(state => {
    // Smooth mouse follow
    mouse.current.x = THREE.MathUtils.lerp(
      mouse.current.x,
      (state.pointer.x * Math.PI) / 10,
      0.05
    );
    mouse.current.y = THREE.MathUtils.lerp(
      mouse.current.y,
      (state.pointer.y * Math.PI) / 10,
      0.05
    );

    if (groupRef.current) {
      groupRef.current.rotation.y = mouse.current.x;
      groupRef.current.rotation.x = -mouse.current.y;
    }

    const t = state.clock.getElapsedTime();
    if (ringRef1.current) {
      ringRef1.current.rotation.z = t * 0.1;
      ringRef1.current.rotation.x = Math.sin(t * 0.2) * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z = -t * 0.15;
      ringRef2.current.rotation.y = Math.cos(t * 0.2) * 0.2;
    }

    // Pulse scale slightly on the sphere
    if (sphereRef.current) {
      const scale = 1 + Math.sin(t * 1.5) * 0.02;
      sphereRef.current.scale.set(scale, scale, scale);
    }
  });

  // Premium dark materials
  const metalMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#aaaaaa",
        metalness: 1,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        envMapIntensity: 2.0,
      }),
    []
  );

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={35} />

      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} color="#ffffff" />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1.5}
        color="#0ea5e9"
      />
      <directionalLight
        position={[-10, -10, 10]}
        intensity={0.5}
        color="#3b82f6"
      />
      <spotLight
        position={[0, 15, 0]}
        intensity={2}
        angle={0.6}
        penumbra={1}
        color="#e0f2fe"
        castShadow
      />

      <Stars
        radius={50}
        depth={20}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          {/* Inner Premium Sphere */}
          <mesh ref={sphereRef} position={[0, 0, -2]}>
            <sphereGeometry args={[2, 64, 64]} />
            <MeshDistortMaterial
              color="#020617"
              envMapIntensity={1}
              clearcoat={1}
              clearcoatRoughness={0}
              metalness={0.9}
              roughness={0.1}
              distort={0.2}
              speed={2}
            />
          </mesh>

          {/* Outer Rotating Rings */}
          <mesh ref={ringRef1} position={[0, 0, -2]} material={metalMaterial}>
            <torusGeometry args={[3.2, 0.02, 16, 100]} />
          </mesh>

          <mesh
            ref={ringRef2}
            position={[0, 0, -2]}
            material={metalMaterial}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[3.8, 0.015, 16, 100]} />
          </mesh>

          {/* Subtle glow behind */}
          <mesh position={[0, 0, -5]}>
            <planeGeometry args={[20, 20]} />
            <meshBasicMaterial color="#0284c7" transparent opacity={0.05} />
          </mesh>
        </Float>
      </group>
    </>
  );
}
