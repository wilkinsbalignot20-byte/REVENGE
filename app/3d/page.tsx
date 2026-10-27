 'use client'

import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF } from '@react-three/drei'
import { Model as Pinkcar } from '@/components/3d/Pinkcar'
import { motion } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

// 1. ILAGAY DITO ANG KINOPYA MONG LINK MULA SA CLOUDINARY PARA MAG-PRELOAD:
const CLOUDINARY_URL = 'https://res.cloudinary.com/nresxj0f/image/upload/v1793102450/pinkcar-transformed.glb'
useGLTF.preload(CLOUDINARY_URL)

export default function Page() {
  const controlsRef = useRef<any>(null)

  // GSAP: Automatic Cinematic Camera Rotation para sa pag-load ng page (Intro Animation)
  useGSAP(() => {
    if (controlsRef.current) {
      // Sisimulan natin ang camera sa malayo at mabilis na iikot pabalik sa pwesto
      gsap.from(controlsRef.current, {
        autoRotate: true,
        autoRotateSpeed: 20, // Paikutin ang kotse para ipakita ang buong detalye nito
        duration: 3,        // Tatagal ng 3 segundo ang intro spin
        ease: 'power2.out',
        onComplete: () => {
          // Pagkatapos ng intro, hihinto ito pero pwedeng-pwede pa ring laruin o i-rotate ng user
          controlsRef.current.autoRotate = false 
        }
      })
    }
  }, [controlsRef])

  return (
    <div className="w-full h-screen bg-zinc-900 flex flex-col items-center justify-center overflow-hidden select-none">
      
      {/* Framer Motion: Cinematic Title Animation */}
      <motion.h1 
        initial={{ opacity: 0, y: -50, letterSpacing: '0.1em' }}
        animate={{ opacity: 1, y: 0, letterSpacing: '0.3em' }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        className="text-white text-3xl md:text-5xl font-extrabold absolute top-12 z-10 text-center uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)]"
      >
        Audi e-tron Concept
      </motion.h1>

      {/* Ang 3D Canvas wrapper ng Three.js */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          {/* Mga Ilaw para kuminang ang Metallic Black Pintura mo */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          
          {/* Ang Stage ang bahala sa automatic lighting at anino na parang studio */}
          <Stage environment="city" intensity={0.5} shadows={{ type: 'contact', blur: 2, opacity: 0.5 }}>
            {/* I-pass natin ang url string sa loob ng Pinkcar component */}
            <Pinkcar url={CLOUDINARY_URL} />
          </Stage>
          
          {/* OrbitControls na may Ref para makontrol ng GSAP Animation */}
          <OrbitControls 
            ref={controlsRef}
            enableZoom={true} 
            maxPolarAngle={Math.PI / 2} // Para hindi lumubog sa sahig ang camera kapag iniikot
            minDistance={3}
            maxDistance={10}
            enableDamping={true} // Ginagawa nitong swabe o makinis ang pag-ikot kapag binitawan ng mouse
            dampingFactor={0.05}
          />
        </Canvas>
      </div>

      {/* Framer Motion: Simple Commercial Subtitle Prompt sa Ibaba */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-10 z-10 text-zinc-400 text-sm tracking-wider pointer-events-none"
      >
        Drag to explore the future of electric
      </motion.div>
    </div>
  )
}
