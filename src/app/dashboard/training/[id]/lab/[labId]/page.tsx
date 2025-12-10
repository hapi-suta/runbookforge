'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PracticeLabPage } from '@/components/lab';
import { Loader2 } from 'lucide-react';

// Sample lab steps - in production, fetch from database
const SAMPLE_STEPS = [
  {
    id: '1',
    number: 1,
    title: 'Check PostgreSQL Version',
    content: 'First, let\'s verify that PostgreSQL is installed and check the version.',
    command: 'psql --version',
    expectedOutput: 'psql (PostgreSQL) 15.x',
    hint: 'This command shows the PostgreSQL client version installed on the system.'
  },
  {
    id: '2',
    number: 2,
    title: 'Start PostgreSQL Service',
    content: 'Ensure the PostgreSQL service is running.',
    command: 'sudo service postgresql start',
    expectedOutput: 'Starting PostgreSQL 15 database server',
    hint: 'On some systems, you might need to use systemctl instead.'
  },
  {
    id: '3',
    number: 3,
    title: 'Connect to PostgreSQL',
    content: 'Connect to the PostgreSQL database as the postgres user.',
    command: 'sudo -u postgres psql',
    expectedOutput: 'psql (15.x)\nType "help" for help.\n\npostgres=#',
    hint: 'The postgres user is the default superuser in PostgreSQL.'
  },
  {
    id: '4',
    number: 4,
    title: 'Create a Database',
    content: 'Create a new database for our practice exercises.',
    command: 'CREATE DATABASE practice_db;',
    expectedOutput: 'CREATE DATABASE',
    hint: 'Make sure you\'re connected to psql before running this command.'
  },
  {
    id: '5',
    number: 5,
    title: 'List Databases',
    content: 'List all databases to verify our new database was created.',
    command: '\\l',
    expectedOutput: 'List of databases including practice_db',
    hint: 'The \\l command is a psql meta-command for listing databases.'
  },
  {
    id: '6',
    number: 6,
    title: 'Connect to Practice Database',
    content: 'Switch to our newly created practice database.',
    command: '\\c practice_db',
    expectedOutput: 'You are now connected to database "practice_db"',
    hint: 'The \\c command connects to a different database.'
  },
  {
    id: '7',
    number: 7,
    title: 'Create a Table',
    content: 'Create a users table with some basic columns.',
    command: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
    expectedOutput: 'CREATE TABLE',
    hint: 'SERIAL is an auto-incrementing integer type in PostgreSQL.'
  },
  {
    id: '8',
    number: 8,
    title: 'Insert Sample Data',
    content: 'Add some sample users to our table.',
    command: `INSERT INTO users (username, email) VALUES
  ('john_doe', 'john@example.com'),
  ('jane_smith', 'jane@example.com'),
  ('bob_wilson', 'bob@example.com');`,
    expectedOutput: 'INSERT 0 3',
    hint: 'This inserts 3 rows into the users table.'
  },
  {
    id: '9',
    number: 9,
    title: 'Query the Data',
    content: 'Retrieve all users from our table.',
    command: 'SELECT * FROM users;',
    expectedOutput: 'A table showing id, username, email, and created_at for 3 users',
    hint: 'SELECT * retrieves all columns from the specified table.'
  },
  {
    id: '10',
    number: 10,
    title: 'Exit PostgreSQL',
    content: 'Disconnect from the PostgreSQL shell.',
    command: '\\q',
    expectedOutput: 'Returns to the Linux command prompt',
    hint: 'You can also use exit or Ctrl+D to quit psql.'
  }
];

export default function LabPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [labData, setLabData] = useState<{
    title: string;
    description: string;
    steps: typeof SAMPLE_STEPS;
  } | null>(null);

  useEffect(() => {
    // In production, fetch lab data from database
    // For now, use sample data
    setTimeout(() => {
      setLabData({
        title: 'PostgreSQL Fundamentals Lab',
        description: 'Learn the basics of PostgreSQL by creating databases, tables, and running queries.',
        steps: SAMPLE_STEPS
      });
      setLoading(false);
    }, 500);
  }, [params.labId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-400 mx-auto mb-4" size={48} />
          <p className="text-slate-300">Loading lab...</p>
        </div>
      </div>
    );
  }

  if (!labData) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Lab not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <PracticeLabPage
      labId={params.labId as string}
      title={labData.title}
      description={labData.description}
      steps={labData.steps}
      templateSlug="postgresql"
      breadcrumbs={[
        { label: 'Training Center', href: '/dashboard/training' },
        { label: 'Batch', href: `/dashboard/training/${params.id}` },
        { label: 'Lab', href: '#' }
      ]}
    />
  );
}

