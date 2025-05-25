import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { isAuthenticated, isEmployer, isJobSeeker } from "@/lib/utils";

export default function Hero() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
              Find your dream job or perfect candidate
            </h1>
            <p className="text-lg text-gray-500 mb-8">
              JobHub connects top talent with leading companies. Create a standout resume and land your next opportunity.
            </p>
            <div className="space-x-4">
              <Link href="/jobs">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Find Jobs
                </Button>
              </Link>
              <Link 
                href={isAuthenticated() && isEmployer() ? "/post-job" : "#"} 
                onClick={(e) => {
                  if (!(isAuthenticated() && isEmployer())) {
                    e.preventDefault();
                    document.dispatchEvent(new CustomEvent('open-auth-modal', { 
                      detail: { mode: 'signUp' } 
                    }));
                  }
                }}
              >
                <Button variant="outline" className="bg-white text-primary border-primary hover:bg-gray-50">
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
          <div>
            <svg
              className="w-full h-auto rounded-lg shadow-lg"
              viewBox="0 0 800 600"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="800" height="600" fill="#f8fafc" rx="8" ry="8" />
              
              {/* Office background */}
              <rect x="50" y="50" width="700" height="500" fill="#ffffff" rx="6" ry="6" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Windows */}
              <rect x="100" y="80" width="150" height="200" fill="#f0f9ff" rx="2" ry="2" stroke="#e5e7eb" strokeWidth="1" />
              <rect x="300" y="80" width="150" height="200" fill="#f0f9ff" rx="2" ry="2" stroke="#e5e7eb" strokeWidth="1" />
              <rect x="500" y="80" width="150" height="200" fill="#f0f9ff" rx="2" ry="2" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Meeting table */}
              <ellipse cx="400" cy="400" rx="250" ry="100" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* People as abstract shapes */}
              <g transform="translate(250, 350)">
                <rect width="60" height="100" fill="#3b82f6" rx="30" ry="30" />
                <circle cx="30" cy="-30" r="30" fill="#3b82f6" />
              </g>
              
              <g transform="translate(350, 330)">
                <rect width="60" height="100" fill="#8b5cf6" rx="30" ry="30" />
                <circle cx="30" cy="-30" r="30" fill="#8b5cf6" />
              </g>
              
              <g transform="translate(450, 360)">
                <rect width="60" height="100" fill="#ec4899" rx="30" ry="30" />
                <circle cx="30" cy="-30" r="30" fill="#ec4899" />
              </g>
              
              <g transform="translate(550, 340)">
                <rect width="60" height="100" fill="#10b981" rx="30" ry="30" />
                <circle cx="30" cy="-30" r="30" fill="#10b981" />
              </g>
              
              {/* Laptop */}
              <rect x="370" y="380" width="60" height="40" fill="#d1d5db" rx="2" ry="2" />
              <rect x="350" y="415" width="100" height="5" fill="#9ca3af" rx="2" ry="2" />
              
              {/* Plants */}
              <rect x="150" y="350" width="40" height="60" fill="#d1d5db" rx="2" ry="2" />
              <circle cx="170" cy="330" r="30" fill="#059669" />
              
              <rect x="600" y="350" width="40" height="60" fill="#d1d5db" rx="2" ry="2" />
              <circle cx="620" cy="330" r="30" fill="#059669" />
              
              {/* Ceiling lights */}
              <circle cx="200" cy="100" r="20" fill="#fef3c7" stroke="#fde68a" strokeWidth="1" />
              <circle cx="400" cy="100" r="20" fill="#fef3c7" stroke="#fde68a" strokeWidth="1" />
              <circle cx="600" cy="100" r="20" fill="#fef3c7" stroke="#fde68a" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
