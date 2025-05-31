import { Link } from "react-router-dom";
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
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {job.title}
            </h3>
            <div className="flex items-center text-gray-600">
              <Building className="h-4 w-4 mr-1" />
              <span>{job.company}</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {job.type}
          </Badge>
        </div>

        <div className="space-y-3 mb-6 flex-grow">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{job.location}</span>
          </div>
          {job.salary && (
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>
                {formatSalary(`${job.salary.min}-${job.salary.max} ${job.salary.currency}`)}
              </span>
            </div>
          )}
          <p className="text-gray-600">
            {truncateText(job.description, 150)}
          </p>
        </div>

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            Posted {job.createdAt ? timeSince(new Date(job.createdAt)) : 'recently'} ago
          </span>
          <Link to={`/jobs/${job._id}`}>
            <Button variant="outline">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
