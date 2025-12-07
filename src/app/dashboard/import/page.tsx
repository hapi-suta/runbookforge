'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Loader2,
  CheckCircle,
  ArrowRight,
  Wand2
} from "lucide-react";

export default function AIImportPage() {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock result
    setResult({
      title: 'Detected Runbook',
      sections: 2,
      steps: 5,
      codeBlocks: 3,
      warnings: 1,
    });
    setIsProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
          <Sparkles className="text-violet-400" />
          AI Import
        </h1>
        <p className="text-slate-400">
          Paste your text, notes, or documentation and let AI structure it into a runbook.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
        >
          <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center gap-2">
            <FileText size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Paste Your Text</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Paste your technical documentation here...

Example:
First install postgresql on all servers using apt.
Run sudo apt update then install postgresql-16.

Configure patroni at /etc/patroni/patroni.yml

Warning: ports 5432 and 8008 must be open`}
            rows={16}
            className="w-full p-4 bg-transparent text-white placeholder-slate-600 focus:outline-none resize-none font-mono text-sm"
          />
          <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {text.length} characters
            </span>
            <button
              onClick={handleImport}
              disabled={!text.trim() || isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg text-white font-semibold hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Convert to Runbook
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Output Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
        >
          <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center gap-2">
            <Sparkles size={18} className="text-violet-400" />
            <span className="text-sm font-medium text-slate-300">AI Analysis</span>
          </div>
          
          <div className="p-4">
            {!result && !isProcessing && (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <Sparkles size={28} className="text-slate-600" />
                </div>
                <p className="text-slate-400 mb-2">Paste text and click convert</p>
                <p className="text-sm text-slate-500">AI will detect sections, code blocks, warnings, and more</p>
              </div>
            )}

            {isProcessing && (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <Loader2 size={40} className="text-violet-400 animate-spin mb-4" />
                <p className="text-slate-300 mb-2">Analyzing your text...</p>
                <p className="text-sm text-slate-500">Detecting structure and formatting</p>
              </div>
            )}

            {result && !isProcessing && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-4">
                  <CheckCircle size={20} />
                  <span className="font-medium">Analysis Complete!</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-white">{result.sections}</p>
                    <p className="text-sm text-slate-400">Sections</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-white">{result.steps}</p>
                    <p className="text-sm text-slate-400">Steps</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-white">{result.codeBlocks}</p>
                    <p className="text-sm text-slate-400">Code Blocks</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-white">{result.warnings}</p>
                    <p className="text-sm text-slate-400">Warnings</p>
                  </div>
                </div>

                <button className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all">
                  Continue to Editor
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl"
      >
        <h3 className="text-lg font-semibold text-white mb-4">💡 Tips for best results</h3>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-teal-400 mt-0.5 flex-shrink-0" />
            Include clear step numbers or bullet points
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-teal-400 mt-0.5 flex-shrink-0" />
            Add "Warning:" or "Note:" for important callouts
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-teal-400 mt-0.5 flex-shrink-0" />
            Wrap code in backticks or indent it
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-teal-400 mt-0.5 flex-shrink-0" />
            Mention server roles (Primary, Replica, etc.)
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
