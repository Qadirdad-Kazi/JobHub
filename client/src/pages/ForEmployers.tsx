import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isAuthenticated, isEmployer } from "@/lib/utils";
import { CheckCircle, Users, TrendingUp, Briefcase, Search, DollarSign } from "lucide-react";

export default function ForEmployers() {
  const handleGetStarted = () => {
    if (!isAuthenticated()) {
      document.dispatchEvent(new CustomEvent('open-auth-modal', { 
        detail: { mode: 'signUp' } 
      }));
    }
  };

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-primary-700 to-accent-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Find the perfect talent for your team
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Access our pool of qualified candidates and hire the best talent for your company. 
                Post job listings, manage applications, and grow your team all in one place.
              </p>
              {isAuthenticated() && isEmployer() ? (
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link href="/post-job">
                    <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                      Post a Job
                    </Button>
                  </Link>
                  <Link href="/employer/dashboard">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-600">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary-700 hover:bg-gray-100"
                    onClick={handleGetStarted}
                  >
                    Get Started
                  </Button>
                  <Link href="#pricing">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-600">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="hidden md:block">
              <svg 
                className="w-full"
                viewBox="0 0 500 400"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="500" height="400" fill="none" />
                
                {/* Background office elements */}
                <rect x="50" y="50" width="400" height="300" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                
                {/* Window */}
                <rect x="70" y="70" width="140" height="120" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                
                {/* Desk */}
                <rect x="70" y="220" width="360" height="20" rx="2" fill="rgba(255,255,255,0.2)" />
                <rect x="80" y="240" width="20" height="80" fill="rgba(255,255,255,0.2)" />
                <rect x="400" y="240" width="20" height="80" fill="rgba(255,255,255,0.2)" />
                
                {/* Computer */}
                <rect x="230" y="170" width="100" height="60" rx="2" fill="rgba(255,255,255,0.25)" />
                <rect x="260" y="230" width="40" height="10" fill="rgba(255,255,255,0.3)" />
                <rect x="250" y="240" width="60" height="5" fill="rgba(255,255,255,0.2)" />
                
                {/* People/Avatars */}
                <circle cx="160" cy="190" r="25" fill="white" />
                <rect x="140" y="220" width="40" height="60" rx="5" fill="white" />
                
                <circle cx="340" cy="190" r="25" fill="white" />
                <rect x="320" y="220" width="40" height="60" rx="5" fill="white" />
                
                {/* Document/Charts */}
                <rect x="100" y="200" width="40" height="30" rx="2" fill="rgba(255,255,255,0.3)" />
                <line x1="110" y1="210" x2="130" y2="210" stroke="white" strokeWidth="2" />
                <line x1="110" y1="220" x2="125" y2="220" stroke="white" strokeWidth="2" />
                
                <rect x="400" y="200" width="40" height="30" rx="2" fill="rgba(255,255,255,0.3)" />
                <line x1="410" y1="210" x2="430" y2="210" stroke="white" strokeWidth="2" />
                <line x1="410" y1="220" x2="425" y2="220" stroke="white" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Benefits section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose JobHub?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform helps employers find the right candidates quickly and efficiently with a suite of powerful tools.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-8">
              <div className="text-primary mb-4 flex justify-center">
                <Users size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Quality Candidates
              </h3>
              <p className="text-gray-600 text-center">
                Access a pool of pre-screened, qualified professionals actively looking for new opportunities.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-8">
              <div className="text-primary mb-4 flex justify-center">
                <TrendingUp size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Advanced Analytics
              </h3>
              <p className="text-gray-600 text-center">
                Track performance metrics for your job listings and gain insights into candidate engagement.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-8">
              <div className="text-primary mb-4 flex justify-center">
                <Briefcase size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Streamlined Hiring
              </h3>
              <p className="text-gray-600 text-center">
                Simplify your recruitment process with our all-in-one platform for posting jobs and managing applications.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* How it works */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and streamline your hiring process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary mb-4">
                <Search size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. Create Your Account</h3>
              <p className="text-gray-600">
                Sign up as an employer and set up your company profile to get started.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary mb-4">
                <Briefcase size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. Post Your Jobs</h3>
              <p className="text-gray-600">
                Create detailed job listings with requirements, benefits, and company information.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary mb-4">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. Review Applicants</h3>
              <p className="text-gray-600">
                Receive applications, review candidates, and manage the hiring process all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pricing */}
      <div id="pricing" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that works best for your hiring needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-gray-300 transition-all">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$49<span className="text-lg font-normal text-gray-500">/month</span></div>
                <p className="text-gray-500">Perfect for small businesses</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Up to 3 active job postings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Basic applicant tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Email notifications</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>30-day job listings</span>
                </li>
              </ul>
              
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-primary shadow-lg relative md:scale-105">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Professional</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$99<span className="text-lg font-normal text-gray-500">/month</span></div>
                <p className="text-gray-500">For growing companies</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Up to 10 active job postings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Advanced applicant tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Resume search access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Featured job listings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>60-day job listings</span>
                </li>
              </ul>
              
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-gray-300 transition-all">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$249<span className="text-lg font-normal text-gray-500">/month</span></div>
                <p className="text-gray-500">For large organizations</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Unlimited job postings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Premium applicant tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Advanced analytics dashboard</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Branded company profile</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>90-day job listings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
              
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleGetStarted}
              >
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* CTA */}
      <div className="bg-primary-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to find your perfect hire?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Join thousands of companies who have successfully hired through JobHub. Post your first job today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-white text-primary-700 hover:bg-gray-100"
              onClick={handleGetStarted}
            >
              Get Started Now
            </Button>
            {isAuthenticated() && isEmployer() && (
              <Link href="/post-job">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-600">
                  Post a Job
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
