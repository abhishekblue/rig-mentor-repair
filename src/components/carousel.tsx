import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from 'framer-motion'

const slides = [
  {
    image: "/repair/images/gpu.png",
    title: "Graphics Card Not Working?",
    description: "No display, artifacts, or overheating issues? We repair all brands and models of GPUs, with expert diagnosis and quick turnaround.",
  },
  {
    image: "/repair/images/laptop.png",
    title: "Laptop Problems? We Fix Them All.",
    description: "Screen damage, power issues, slow performance—our certified technicians restore laptops to like-new condition.",
  },
  {
    image: "/repair/images/asic.png",
    title: "ASIC Miner Down? Don't Panic.",
    description: "Hashrate drop, dead hashboards, or fan errors? Trust India's leading ASIC repair team for a fast, professional fix.",
  },
  {
    image: "/repair/images/wheel.png",
    title: "Racing Wheel Repair Experts",
    description: "Loss of force feedback, pedal or PCB issues? We fix all major racing wheels and get you back on track.",
  },
  {
    image: "/repair/images/cpu.png",
    title: "Complete PC Service",
    description: "Not sure what's wrong with your PC? Book a full system diagnostic and repair—no problem too tough for us.",
  },
  {
    image: "/repair/images/console.png",
    title: "Console Not Booting? Let Us Help.",
    description: "PlayStation, Xbox, Switch—all major consoles repaired. From HDMI issues to overheating, we've got you covered.",
  },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const navigate = useNavigate();

  const next = () => { setDirection(1); setCurrent(c => c === slides.length - 1 ? 0 : c + 1) }
  const prev = () => { setDirection(-1); setCurrent(c => c === 0 ? slides.length - 1 : c - 1) }

  useEffect(() => {
    const i = setInterval(next, 5000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="relative w-full max-w-6xl mx-auto rounded-lg overflow-hidden shadow-xl mb-16 h-96">
      <div className="relative h-96 w-full overflow-hidden bg-black/35">
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={slides[current].image}
            src={slides[current].image}
            alt={slides[current].title}
            className="absolute w-full h-full object-contain bg-black/35"
            initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        {/* Overlay content */}
        <div className="absolute inset-0 border-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 pointer-events-auto">{slides[current].title}</h2>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl pointer-events-auto">{slides[current].description}</p>
          <button
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 hover:cursor-pointer transition-colors duration-300 pointer-events-auto"
            onClick={() => navigate("/form")}
          >
            Book Repair Now
          </button>
        </div>
      </div>
      <button
        onClick={prev}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/50 hover:bg-white/80 p-2 rounded-full pointer-events-auto"
      >
        {/* Left arrow SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-800">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/50 hover:bg-white/80 p-2 rounded-full pointer-events-auto"
      >
        {/* Right arrow SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-800">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
        </svg>
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
            className={`h-3 w-3 rounded-full ${current === i ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
