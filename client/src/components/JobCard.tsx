import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Job } from "@shared/schema";
import { formatSalary, timeSince, truncateText } from "@/lib/utils";
import { MapPin, DollarSign, Building } from "lucide-react";

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const {
    id,
    title,
    company,
    location,
    type,
    salary,
    description,
    tags,
    createdAt,
  } = job;

  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="bg-gray-100 rounded-md h-12 w-12 flex items-center justify-center text-gray-500 mr-4">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600">{company}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{location}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>{formatSalary(salary)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            {type}
          </Badge>
          {tags && Array.isArray(tags) && tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {tag}
            </Badge>
          ))}
          {tags && Array.isArray(tags) && tags.length > 2 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              +{tags.length - 2} more
            </Badge>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {truncateText(description, 150)}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Posted {timeSince(createdAt)}
          </span>
          <Link href={`/jobs/${id}`}>
            <Button variant="link" className="text-primary hover:text-primary/90 p-0">
              View Job
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
