import { User } from "lucide-react";
import type { JSX } from "react";

export default function Navbar(): JSX.Element {
  return (
    <nav className="bg-white text-gray-800 shadow-md font-sans px-6 pt-2 flex items-center justify-between">
      {/* Logo (left) */}
      <a href="https://rigmentor.in/" className="flex items-center min-w-[120px]">
        <img
          src="/repair/logoi.png"
          alt="Rig Mentor Logo"
          className="w-36 h-auto"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/150x50/cccccc/ffffff?text=Logo+Error";
          }}
        />
      </a>

      {/* Title + tagline (center) */}
      <div className="flex-1 flex flex-col items-center hover:scale-110">
        <span className="text-xl md:text-2xl font-bold tracking-tight">Tech Repair Division</span>
        <span className="font-light text-sm text-gray-500 mt-1">
          India’s Trusted Tech Repair – Fast, Genuine, Hassle-Free
        </span>
      </div>

      {/* Profile (right) */}
      <a
        href="https://rigmentor.in/my-account/"
        className="flex items-center justify-end min-w-[48px] group"
        title="My Account"
      >
        <User className="h-8 w-8 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
      </a>
    </nav>
  );
}
