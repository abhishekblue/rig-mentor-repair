// import { useState, useEffect } from 'react';
// import { useNavigate } from "react-router-dom"
// import { motion, AnimatePresence } from "framer-motion";
import { motion } from 'framer-motion';
import type { ServiceCardProps } from '../types';
import Carousel from './carousel';


import Navbar from './Navbar';

type IconProps = {
  path: string
  className?: string
}
// Helper component for Icons
const Icon = ({ path, className = "h-6 w-6" } : IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);



// --- ServiceCard.tsx ---
// A reusable component for the service cards
const ServiceCard = ({ icon, title, description } : ServiceCardProps) => {
const icons = {
  gpu: "M5.25 3v2.25M18.75 3v2.25M12 7.5v9m9 0h-18m18 0v2.25A2.25 2.25 0 0118.75 21h-13.5A2.25 2.25 0 013 18.75V16.5m18 0v-9m0 9h-18m18-9V5.25A2.25 2.25 0 0018.75 3h-13.5A2.25 2.25 0 003 5.25V7.5m18 0h-18",
  laptop: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-1.621-1.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h9.75a2.25 2.25 0 012.25 2.25z",
  asic: "M4.5 6.75h15m-15 3h15m-15 3h15m-15 3h15M6.75 4.5v15m3-15v15m3-15v15m3-15v15",
  wheel: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 4.5A5.5 5.5 0 0117.5 12h-3a2.5 2.5 0 10-5 0h-3A5.5 5.5 0 0112 6.5z",
  cpu: "M7.5 2.25v1.5M16.5 2.25v1.5M7.5 20.25v1.5M16.5 20.25v1.5M2.25 7.5h1.5M2.25 16.5h1.5M20.25 7.5h1.5M20.25 16.5h1.5M6 6h12v12H6z",
  console: "M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25zM12 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z",
};
  
  const iconKey = icon as keyof typeof icons
  return (
      <motion.div
        whileHover={{
          scale: 1.04,
          boxShadow: "0 8px 32px rgba(56, 189, 248, 0.14)"  // blue-ish soft shadow
        }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="bg-white p-6 rounded-lg text-center flex flex-col items-center cursor-pointer"
      >
        <div className="bg-blue-100 text-blue-600 rounded-lg p-3 inline-block mb-4">
          <Icon path={icons[iconKey]} className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </motion.div>
  );
}


// --- page.tsx ---
// This would be your main page file
const Page = () => {
  return (
    <div className="bg-gray-50 min-h-screen font-sans cursor-default">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <Carousel />
        
        <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12">
              India’s only repair service for GPUs, ASIC miners, gaming consoles, racing wheels, laptops, and full PCs – with honest advice, no guesswork, and real engineers. Get transparent diagnosis, free pickup, and live status tracking!
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          <ServiceCard 
            icon="gpu"
            title="Graphics Card Repair"
            description="Black screen, artifacts, or fan noise? We fix all GPU models, from basic to advanced, and restore full performance for gamers and miners."
          />
          <ServiceCard 
            icon="laptop"
            title="Laptop Repair"
            description="Screen broken, power issues, or heating up? Fast repairs for all laptops – from simple upgrades to chip-level work."
          />
          <ServiceCard 
            icon="asic"
            title="ASIC Miner Repair"
            description="Hashrate drops, dead boards, or PSU faults? We’re India’s experts for Bitmain, Whatsminer, and other mining hardware."
          />
          <ServiceCard 
            icon="wheel"
            title="Racing Wheel Repair"
            description="Loss of force feedback, pedal glitches, or PCB failures? Bring your Logitech, Thrustmaster, or Fanatec back to life."
          />
          <ServiceCard 
            icon="cpu"
            title="Complete CPU Service"
            description="Not sure what’s wrong with your PC? Book a full system diagnosis and let us find and fix the real issue- hardware or software."
          />
          <ServiceCard 
            icon="console"
            title="Gaming Console Repair"
            description="No power, HDMI/display issues, overheating, or disk errors? We repair PlayStation, Xbox, and Switch with genuine parts."
          />
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return <Page />;
}
