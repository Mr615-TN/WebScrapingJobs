import React, { useState } from 'react';
import { Search, Briefcase, MapPin, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchJobs = async () => {
    if (!searchTerm) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/jobs/${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError('Failed to fetch job listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Entry Level Job Search</CardTitle>
          <CardDescription>
            Search for entry level positions across multiple job boards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchJobs()}
              className="flex-1"
            />
            <Button onClick={searchJobs} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {jobs.map((job, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.company}</span>
                    <MapPin className="w-4 h-4 ml-2" />
                    <span>{job.location}</span>
                  </div>
                </div>
                {job.salary_range && (
                  <div className="flex items-center text-green-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salary_range}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{job.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Posted: {job.date_posted}
                </span>
                <Button
                  variant="outline"
                  onClick={() => window.open(job.url, '_blank')}
                >
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobSearch;
