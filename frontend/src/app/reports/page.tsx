'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';

export default function ReportsPage() {
  const [generateLoading, setGenerateLoading] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const reports = [
    { type: 'students', name: 'Student Report', description: 'List of all students with details' },
    { type: 'teachers', name: 'Teacher Report', description: 'List of all teachers with details' },
    { type: 'classes', name: 'Class Report', description: 'Class information and enrollment' },
    { type: 'payments', name: 'Payment Report', description: 'Payment history and summaries' },
    { type: 'grades', name: 'Grade Report', description: 'Student grades and performance' },
  ];

  const handleGenerateReport = async (reportType: string) => {
    setGenerateLoading(reportType);
    // Simulate API call
    setTimeout(() => {
      setGenerateLoading(null);
      toast({
        title: 'Success',
        description: `${reportType} report generated successfully`,
      });
    }, 2000);
  };

  const handleDownloadReport = async (reportType: string) => {
    setDownloadLoading(reportType);
    // Simulate API call
    setTimeout(() => {
      setDownloadLoading(null);
      toast({
        title: 'Success',
        description: `${reportType} report downloaded successfully`,
      });
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-gray-500">Generate and download school reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.type} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{report.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{report.description}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGenerateReport(report.type)}
                    className="flex-1"
                    disabled={generateLoading === report.type}
                  >
                    {generateLoading === report.type ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Generate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadReport(report.type)}
                    className="flex-1"
                    disabled={downloadLoading === report.type}
                  >
                    {downloadLoading === report.type ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
