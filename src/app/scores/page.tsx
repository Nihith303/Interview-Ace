'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/dashboard/header';
import { useAuth } from '@/auth/context';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { format } from 'date-fns';

type Report = {
  id: string;
  role: string;
  company: string;
  confidence: number;
  correctness: number;
  depthOfKnowledge: number;
  roleFit: number;
  createdAt: Timestamp;
};

export default function ScoresPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchReports = async () => {
      if (user) {
        setIsLoadingReports(true);
        const reportsRef = collection(db, 'reports');
        const q = query(
          reportsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedReports = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Report[];
        setReports(fetchedReports);
        setIsLoadingReports(false);
      }
    };
    fetchReports();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 sm:p-8">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Interview History
            </CardTitle>
            <CardDescription>
              Review your past interview performances and track your progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingReports ? (
              <p>Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                You haven&apos;t completed any interviews yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-center">Confidence</TableHead>
                    <TableHead className="text-center">Correctness</TableHead>
                    <TableHead className="text-center">Depth</TableHead>
                    <TableHead className="text-center">Role Fit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {format(report.createdAt.toDate(), 'PPP')}
                      </TableCell>
                      <TableCell>{report.role}</TableCell>
                      <TableCell>{report.company}</TableCell>
                      <TableCell className="text-center">
                        {report.confidence}
                      </TableCell>
                      <TableCell className="text-center">
                        {report.correctness}
                      </TableCell>
                      <TableCell className="text-center">
                        {report.depthOfKnowledge}
                      </TableCell>
                      <TableCell className="text-center">
                        {report.roleFit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
