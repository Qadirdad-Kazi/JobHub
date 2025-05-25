import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Hero from "@/components/Hero";
import JobSearchForm from "@/components/JobSearchForm";
import JobCard from "@/components/JobCard";
import ResumeTemplates from "@/components/ResumeTemplates";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@shared/schema";
import { isAuthenticated, isEmployer, isJobSeeker } from "@/lib/utils";

// Testimonial interface
interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function Home() {
  const { data: featuredJobs, isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs?limit=3'],
  });
  
  const { data: testimonials, isLoading: isLoadingTestimonials } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });

  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Job Search Section */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Find Your Next Opportunity</h2>
            <JobSearchForm />
          </div>
        </div>
      </div>

      {/* Featured Jobs Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
            <p className="mt-2 text-lg text-gray-500">
              Discover opportunities from top companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Skeleton loaders for jobs
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-md mr-4"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : featuredJobs && featuredJobs.length > 0 ? (
              featuredJobs.map(job => <JobCard key={job.id} job={job} />)
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500">No jobs available at the moment.</p>
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link href="/jobs">
              <Button variant="link" className="text-primary hover:text-primary/90 flex items-center">
                View all jobs
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-2" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14 5l7 7m0 0l-7 7m7-7H3" 
                  />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Resume Builder Section */}
      <div className="bg-gradient-to-r from-primary to-accent-500 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Create a professional resume in minutes</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Our AI-powered resume builder helps you craft a standout resume that gets noticed by employers. Choose from professional templates and get expert suggestions.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-secondary-500 mt-1 mr-3" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span className="text-gray-700">Professional templates designed by experts</span>
                  </li>
                  <li className="flex items-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-secondary-500 mt-1 mr-3" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span className="text-gray-700">Easy-to-use form with step-by-step guidance</span>
                  </li>
                  <li className="flex items-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-secondary-500 mt-1 mr-3" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span className="text-gray-700">Download as PDF, Word, or share online</span>
                  </li>
                  <li className="flex items-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-secondary-500 mt-1 mr-3" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span className="text-gray-700">ATS-friendly formats to pass screening</span>
                  </li>
                </ul>
                <Link href="/resume-builder">
                  <Button className="bg-primary text-white hover:bg-primary/90">
                    Build Your Resume
                  </Button>
                </Link>
              </div>
              <div className="bg-gray-100 flex items-center justify-center p-6 md:p-0">
                <svg 
                  className="w-full max-w-md" 
                  viewBox="0 0 650 800" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="50" y="50" width="550" height="700" fill="#fff" stroke="#e5e7eb" strokeWidth="2"/>
                  <rect x="80" y="80" width="490" height="100" fill="#f3f4f6"/>
                  <rect x="180" y="110" width="290" height="20" fill="#d1d5db"/>
                  <rect x="230" y="140" width="190" height="10" fill="#e5e7eb"/>
                  
                  <rect x="80" y="210" width="490" height="30" fill="#e5e7eb"/>
                  <rect x="80" y="250" width="200" height="10" fill="#e5e7eb"/>
                  <rect x="80" y="270" width="400" height="10" fill="#e5e7eb"/>
                  <rect x="80" y="290" width="350" height="10" fill="#e5e7eb"/>
                  
                  <rect x="80" y="330" width="490" height="30" fill="#e5e7eb"/>
                  <rect x="80" y="370" width="300" height="60" fill="#f3f4f6"/>
                  <rect x="100" y="380" width="150" height="10" fill="#d1d5db"/>
                  <rect x="100" y="400" width="80" height="10" fill="#e5e7eb"/>
                  <rect x="100" y="415" width="240" height="5" fill="#e5e7eb"/>
                  
                  <rect x="80" y="440" width="300" height="60" fill="#f3f4f6"/>
                  <rect x="100" y="450" width="150" height="10" fill="#d1d5db"/>
                  <rect x="100" y="470" width="80" height="10" fill="#e5e7eb"/>
                  <rect x="100" y="485" width="240" height="5" fill="#e5e7eb"/>
                  
                  <rect x="80" y="520" width="490" height="30" fill="#e5e7eb"/>
                  <rect x="80" y="560" width="490" height="50" fill="#f3f4f6"/>
                  <rect x="100" y="580" width="450" height="10" fill="#e5e7eb"/>
                  
                  <rect x="80" y="620" width="490" height="30" fill="#e5e7eb"/>
                  <rect x="80" y="660" width="100" height="30" fill="#3b82f6"/>
                  <rect x="190" y="660" width="100" height="30" fill="#3b82f6"/>
                  <rect x="300" y="660" width="100" height="30" fill="#3b82f6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Templates Section */}
      <ResumeTemplates />

      {/* Employer Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <svg 
                className="w-full rounded-lg shadow-lg" 
                viewBox="0 0 800 600" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="800" height="600" fill="#f0f4f8" rx="8" ry="8"/>
                <rect x="50" y="50" width="700" height="500" fill="#fff" rx="6" ry="6" stroke="#e5e7eb" strokeWidth="1"/>
                
                {/* Office furniture and layout */}
                <rect x="100" y="150" width="250" height="150" fill="#f3f4f6" rx="4" ry="4"/> {/* desk */}
                <rect x="400" y="150" width="250" height="150" fill="#f3f4f6" rx="4" ry="4"/> {/* desk */}
                <rect x="100" y="350" width="550" height="100" fill="#f3f4f6" rx="4" ry="4"/> {/* meeting table */}
                
                <circle cx="150" cy="230" r="30" fill="#d1d5db"/> {/* chair */}
                <circle cx="450" cy="230" r="30" fill="#d1d5db"/> {/* chair */}
                <circle cx="200" cy="400" r="20" fill="#d1d5db"/> {/* chair */}
                <circle cx="300" cy="400" r="20" fill="#d1d5db"/> {/* chair */}
                <circle cx="400" cy="400" r="20" fill="#d1d5db"/> {/* chair */}
                <circle cx="500" cy="400" r="20" fill="#d1d5db"/> {/* chair */}
                
                {/* People as abstract shapes */}
                <rect x="190" cy="220" width="60" height="80" fill="#3b82f6" rx="20" ry="20"/> {/* person */}
                <circle cx="220" cy="180" r="25" fill="#3b82f6"/> {/* head */}
                
                <rect x="490" cy="220" width="60" height="80" fill="#8b5cf6" rx="20" ry="20"/> {/* person */}
                <circle cx="520" cy="180" r="25" fill="#8b5cf6"/> {/* head */}
                
                <rect x="320" cy="370" width="40" height="60" fill="#059669" rx="15" ry="15"/> {/* person */}
                <circle cx="340" cy="340" r="20" fill="#059669"/> {/* head */}
                
                <rect x="440" cy="370" width="40" height="60" fill="#ec4899" rx="15" ry="15"/> {/* person */}
                <circle cx="460" cy="340" r="20" fill="#ec4899"/> {/* head */}
                
                {/* Window and plants */}
                <rect x="620" y="100" width="100" height="200" fill="#f0f9ff" rx="2" ry="2" stroke="#e5e7eb" strokeWidth="1"/> {/* window */}
                <line x1="620" y1="200" x2="720" y2="200" stroke="#e5e7eb" strokeWidth="1"/> {/* window divider */}
                
                <rect x="630" y="350" width="50" height="70" fill="#10b981" rx="2" ry="2"/> {/* plant */}
                <circle cx="655" cy="330" r="25" fill="#065f46"/> {/* plant top */}
                
                {/* Lighting */}
                <circle cx="200" cy="100" r="10" fill="#fef3c7"/> {/* light */}
                <circle cx="400" cy="100" r="10" fill="#fef3c7"/> {/* light */}
                <circle cx="600" cy="100" r="10" fill="#fef3c7"/> {/* light */}
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">For Employers</h2>
              <p className="text-lg text-gray-600 mb-6">
                Find the right talent for your team. Post job listings and reach thousands of qualified candidates.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary-100 rounded-md h-10 w-10 flex items-center justify-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-primary" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Find Qualified Candidates</h3>
                    <p className="mt-1 text-gray-500">
                      Access a pool of skilled professionals ready to join your team.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary-100 rounded-md h-10 w-10 flex items-center justify-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-primary" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Post Job Listings</h3>
                    <p className="mt-1 text-gray-500">
                      Create detailed job postings and manage applications all in one place.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary-100 rounded-md h-10 w-10 flex items-center justify-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-primary" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
                    <p className="mt-1 text-gray-500">
                      Track job performance and candidate engagement with detailed analytics.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-x-4">
                <Link href={isAuthenticated() && isEmployer() ? "/post-job" : "#"} 
                  onClick={(e) => {
                    if (!(isAuthenticated() && isEmployer())) {
                      e.preventDefault();
                      document.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'signUp' } }));
                    }
                  }}
                >
                  <Button className="bg-primary text-white hover:bg-primary/90">
                    Post a Job
                  </Button>
                </Link>
                <Link href="/for-employers">
                  <Button variant="link" className="text-primary hover:text-primary/90 flex items-center">
                    Learn More
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14 5l7 7m0 0l-7 7m7-7H3" 
                      />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Success Stories</h2>
            <p className="mt-2 text-lg text-gray-500">
              See how JobHub has helped people find their dream careers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  <svg 
                    viewBox="0 0 100 100" 
                    className="h-full w-full text-gray-400"
                    fill="currentColor"
                  >
                    <circle cx="50" cy="40" r="20" />
                    <circle cx="50" cy="100" r="35" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Sarah Johnson</h3>
                  <p className="text-gray-600 text-sm">UX Designer at DesignHub</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "JobHub's resume builder helped me create a professional resume that highlighted my skills perfectly. I landed interviews with 3 companies and got my dream job within two weeks!"
              </p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
                    />
                  </svg>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  <svg 
                    viewBox="0 0 100 100" 
                    className="h-full w-full text-gray-400"
                    fill="currentColor"
                  >
                    <circle cx="50" cy="40" r="20" />
                    <circle cx="50" cy="100" r="35" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Michael Chen</h3>
                  <p className="text-gray-600 text-sm">Software Engineer at TechCorp</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The job search tools on JobHub are far superior to other platforms. The filters helped me find remote positions that matched my skills, and I was able to apply with just a few clicks."
              </p>
              <div className="flex text-yellow-400">
                {[...Array(4)].map((_, i) => (
                  <svg 
                    key={i}
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
                    />
                  </svg>
                ))}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
                    clipPath="inset(0 50% 0 0)"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  <svg 
                    viewBox="0 0 100 100" 
                    className="h-full w-full text-gray-400"
                    fill="currentColor"
                  >
                    <circle cx="50" cy="40" r="20" />
                    <circle cx="50" cy="100" r="35" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">David Rodriguez</h3>
                  <p className="text-gray-600 text-sm">HR Manager at GrowthCo</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "As an employer, JobHub has transformed our recruitment process. The quality of candidates we've found is exceptional, and the platform's tools make managing applications efficient."
              </p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
                    />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to take the next step in your career?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Join thousands of professionals who have found their dream jobs through JobHub. Create your profile, build your resume, and start applying today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              className="bg-white text-primary-700 hover:bg-gray-100"
              onClick={() => {
                if (!isAuthenticated()) {
                  document.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'signUp' } }));
                } else if (isJobSeeker()) {
                  window.location.href = '/resume-builder';
                } else if (isEmployer()) {
                  window.location.href = '/post-job';
                }
              }}
            >
              Create Your Profile
            </Button>
            <Link href="/jobs">
              <Button variant="outline" className="bg-transparent text-white border-white hover:bg-primary-600">
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
