import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

const ParticleField = () => {
  const particlesRef = useRef();
  const particleCount = 2000;
  const particleSize = 0.03;
  
  // Generate random particles
  const particlesPosition = new Float32Array(particleCount * 3);
  const particlesColor = new Float32Array(particleCount * 3);
  
  // Set positions and colors with a gradient of blue to purple
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlesPosition[i3] = (Math.random() - 0.5) * 10;
    particlesPosition[i3 + 1] = (Math.random() - 0.5) * 10;
    particlesPosition[i3 + 2] = (Math.random() - 0.5) * 10;
    
    // Create a color gradient from blue to purple
    const mixFactor = Math.random();
    particlesColor[i3] = 0.2 + mixFactor * 0.4; // R: 0.2-0.6
    particlesColor[i3 + 1] = 0.3 + mixFactor * 0.3; // G: 0.3-0.6
    particlesColor[i3 + 2] = 0.8 + mixFactor * 0.2; // B: 0.8-1.0
  }
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (particlesRef.current) {
      // Rotate the entire particle field
      particlesRef.current.rotation.y = time * 0.05;
      
      // Animate particle positions for a wave effect
      const positions = particlesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time + positions[i3] * 0.5) * 0.002;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  useEffect(() => {
    if (particlesRef.current) {
      gsap.to(particlesRef.current.rotation, {
        y: Math.PI * 2,
        duration: 120,
        repeat: -1,
        ease: 'none'
      });
    }
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particlesPosition}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particlesColor}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particleSize}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
};

const BackgroundScene = () => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 60 }}>
        <color attach="background" args={['#050815']} />
        <fog attach="fog" args={['#050815', 3, 15]} />
        <ParticleField />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default BackgroundScene;