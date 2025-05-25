import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobType } from "@/types/schema";

export default function JobSearchForm() {
  const [, navigate] = useLocation();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query string
    const params = new URLSearchParams();
    if (keyword) params.append("q", keyword);
    if (location) params.append("location", location);
    if (category) params.append("type", category);
    
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
            Keywords
          </label>
          <Input
            id="keyword"
            placeholder="Job title, skills, or company"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <Input
            id="location"
            placeholder="City, state, or zip code"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value={JobType.FULLTIME}>Full-time</SelectItem>
              <SelectItem value={JobType.PARTTIME}>Part-time</SelectItem>
              <SelectItem value={JobType.CONTRACT}>Contract</SelectItem>
              <SelectItem value={JobType.INTERNSHIP}>Internship</SelectItem>
              <SelectItem value={JobType.REMOTE}>Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            type="submit"
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            Search Jobs
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <span className="text-sm font-medium text-gray-700">Popular:</span>
        <Button variant="link" className="text-sm text-primary hover:text-primary/90 p-0 h-auto" onClick={() => {
          setCategory(JobType.REMOTE);
          navigate(`/jobs?type=${JobType.REMOTE}`);
        }}>
          Remote
        </Button>
        <Button variant="link" className="text-sm text-primary hover:text-primary/90 p-0 h-auto" onClick={() => {
          setKeyword("Software Engineer");
          navigate(`/jobs?q=Software Engineer`);
        }}>
          Software Engineer
        </Button>
        <Button variant="link" className="text-sm text-primary hover:text-primary/90 p-0 h-auto" onClick={() => {
          setKeyword("Data Scientist");
          navigate(`/jobs?q=Data Scientist`);
        }}>
          Data Scientist
        </Button>
        <Button variant="link" className="text-sm text-primary hover:text-primary/90 p-0 h-auto" onClick={() => {
          setKeyword("Product Manager");
          navigate(`/jobs?q=Product Manager`);
        }}>
          Product Manager
        </Button>
        <Button variant="link" className="text-sm text-primary hover:text-primary/90 p-0 h-auto" onClick={() => {
          setKeyword("Marketing");
          navigate(`/jobs?q=Marketing`);
        }}>
          Marketing
        </Button>
      </div>
    </form>
  );
}
