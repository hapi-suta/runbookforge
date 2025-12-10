'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Loader2, Sparkles } from 'lucide-react';

interface CertificateGeneratorProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName?: string;
  achievements?: string[];
}

export default function CertificateGenerator({
  studentName,
  courseName,
  completionDate,
  instructorName = 'Course Instructor',
  achievements = []
}: CertificateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateText, setCertificateText] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  const generateCertificate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'certificate_text',
          studentName,
          courseName,
          completionDate,
          instructorName,
          achievements
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCertificateText(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificateRef.current) return;
    
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${studentName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f5f5f5;
              font-family: 'Inter', sans-serif;
            }
            
            .certificate {
              width: 800px;
              padding: 60px;
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              border: 3px solid #14b8a6;
              border-radius: 12px;
              color: white;
              position: relative;
              overflow: hidden;
            }
            
            .certificate::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314b8a6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            }
            
            .content { position: relative; z-index: 1; text-align: center; }
            
            .logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 24px;
              background: linear-gradient(135deg, #14b8a6, #10b981);
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 36px;
            }
            
            .header {
              font-family: 'Playfair Display', serif;
              font-size: 14px;
              letter-spacing: 4px;
              text-transform: uppercase;
              color: #14b8a6;
              margin-bottom: 8px;
            }
            
            .title {
              font-family: 'Playfair Display', serif;
              font-size: 42px;
              font-weight: 700;
              margin-bottom: 32px;
              background: linear-gradient(135deg, #14b8a6, #10b981);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            
            .recipient-label {
              font-size: 12px;
              color: #94a3b8;
              margin-bottom: 8px;
            }
            
            .recipient-name {
              font-family: 'Playfair Display', serif;
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 32px;
            }
            
            .description {
              font-size: 14px;
              color: #cbd5e1;
              line-height: 1.8;
              max-width: 500px;
              margin: 0 auto 32px;
            }
            
            .course-name {
              font-size: 18px;
              font-weight: 500;
              color: #14b8a6;
              margin-bottom: 32px;
            }
            
            .details {
              display: flex;
              justify-content: center;
              gap: 48px;
              margin-top: 40px;
              padding-top: 32px;
              border-top: 1px solid rgba(255,255,255,0.1);
            }
            
            .detail-item {
              text-align: center;
            }
            
            .detail-label {
              font-size: 10px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 4px;
            }
            
            .detail-value {
              font-size: 14px;
              color: #e2e8f0;
            }
            
            .signature {
              font-family: 'Playfair Display', serif;
              font-style: italic;
              font-size: 18px;
            }
            
            @media print {
              body { background: white; }
              .certificate { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="content">
              <div class="logo">🏆</div>
              <div class="header">Certificate of Completion</div>
              <div class="title">Certificate of Achievement</div>
              <div class="recipient-label">This is to certify that</div>
              <div class="recipient-name">${studentName}</div>
              <div class="description">
                has successfully completed all requirements and demonstrated proficiency in
              </div>
              <div class="course-name">${courseName}</div>
              ${achievements.length > 0 ? `
                <div class="description">
                  With distinction in: ${achievements.join(', ')}
                </div>
              ` : ''}
              <div class="details">
                <div class="detail-item">
                  <div class="detail-label">Date Completed</div>
                  <div class="detail-value">${completionDate}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Instructor</div>
                  <div class="detail-value signature">${instructorName}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Certificate ID</div>
                  <div class="detail-value">${Date.now().toString(36).toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 to-yellow-500/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
          <Award size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Certificate of Completion</h3>
          <p className="text-xs text-slate-400">Download your achievement</p>
        </div>
      </div>

      {/* Preview */}
      <div ref={certificateRef} className="p-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center">
            <Award size={32} className="text-white" />
          </div>
          
          <p className="text-xs text-amber-400 uppercase tracking-wider mb-2">Certificate of Completion</p>
          <h2 className="text-2xl font-bold text-white mb-4">Certificate of Achievement</h2>
          
          <p className="text-sm text-slate-400 mb-2">This is to certify that</p>
          <p className="text-xl font-semibold text-white mb-4">{studentName}</p>
          
          <p className="text-sm text-slate-400 mb-2">has successfully completed</p>
          <p className="text-lg font-medium text-teal-400 mb-6">{courseName}</p>
          
          {achievements.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 justify-center">
              {achievements.map((achievement, idx) => (
                <span key={idx} className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                  {achievement}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex justify-center gap-8 pt-4 border-t border-slate-700">
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Date</p>
              <p className="text-sm text-slate-300">{completionDate}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Instructor</p>
              <p className="text-sm text-slate-300 italic">{instructorName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-800 flex gap-3">
        {!certificateText ? (
          <motion.button
            onClick={generateCertificate}
            disabled={isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate AI Text
              </>
            )}
          </motion.button>
        ) : null}
        
        <motion.button
          onClick={downloadCertificate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl"
        >
          <Download size={18} />
          Download Certificate
        </motion.button>
      </div>
    </div>
  );
}

