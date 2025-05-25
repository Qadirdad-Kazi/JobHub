import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Application, Job } from "@shared/schema";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Briefcase, Building, Calendar, MapPin } from "lucide-react";

interface ApplicationCardProps {
  application: Application & { job: Job };
  onViewDetails?: () => void;
}

export default function ApplicationCard({ application, onViewDetails }: ApplicationCardProps) {
  const { job, status, appliedAt } = application;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold line-clamp-1">{job.title}</CardTitle>
          <Badge className={getStatusColor(status)}>{status}</Badge>
        </div>
        <div className="text-sm font-medium flex items-center gap-1">
          <Building className="h-4 w-4 opacity-70" />
          <span>{job.company}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 opacity-70" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4 opacity-70" />
            <span>{job.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 opacity-70" />
            <span>Applied: {formatDate(new Date(appliedAt))}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}