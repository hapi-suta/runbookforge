import { NextResponse } from 'next/server';

const TEMPLATES = {
  technical_course: {
    name: 'Technical Course',
    sections: ['Learn', 'Practice', 'Assess', 'Resources', 'Career']
  },
  workshop: {
    name: 'Workshop/Bootcamp',
    sections: ['Learn', 'Practice', 'Resources']
  },
  interview_prep: {
    name: 'Interview Prep',
    sections: ['Study Materials', 'Interview Practice']
  },
  certification: {
    name: 'Certification Prep',
    sections: ['Study Guide', 'Practice Tests', 'Resources']
  },
  custom: {
    name: 'Custom',
    sections: []
  }
};

export async function GET() {
  return NextResponse.json(TEMPLATES);
}
