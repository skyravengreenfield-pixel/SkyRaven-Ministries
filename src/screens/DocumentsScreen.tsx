import { FileText, Download, Calendar, FileCheck, ArrowLeft } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string;
  date: string;
  url: string;
  size: string;
  category: 'financial' | 'policy' | 'report' | 'other';
}

interface DocumentsScreenProps {
  onBack?: () => void;
}

export function DocumentsScreen({ onBack }: DocumentsScreenProps) {
  // Add your documents here
  const documents: Document[] = [
    {
      id: '1',
      title: 'Certificate of Incorporation',
      description: 'Official state certificate of incorporation for SkyRaven Ministries',
      date: 'Filed 2021',
      url: '/documents/Cert. of Incorporation.jpg',
      size: '475 KB',
      category: 'policy'
    },
    {
      id: '2',
      title: 'SkyRaven ByLaws',
      description: 'Official organizational bylaws and governance structure',
      date: 'Adopted 2021',
      url: '/documents/SkyRaven ByLaws.pdf',
      size: 'PDF',
      category: 'policy'
    },
    {
      id: '3',
      title: 'Conflict of Interest Policy',
      description: 'Official conflict of interest policy and procedures',
      date: 'Adopted 2021',
      url: '/documents/Conflict of Interest Policy.pdf',
      size: 'PDF',
      category: 'policy'
    },
    {
      id: '4',
      title: 'Form 1023-EZ',
      description: 'IRS tax-exempt status application - Filed yet Pending',
      date: 'Filed 2024',
      url: '#',
      size: 'Pending',
      category: 'other'
    },
    {
      id: '5',
      title: 'Ministry Guidelines',
      description: 'Official ministry policies and operational guidelines',
      date: 'December 2023',
      url: '/documents/ministry-guidelines.pdf',
      size: '1.8 MB',
      category: 'policy'
    },
    // Add more documents as needed
  ];

  const getCategoryColor = (category: Document['category']) => {
    switch (category) {
      case 'financial':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'policy':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'report':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getCategoryIcon = (category: Document['category']) => {
    switch (category) {
      case 'financial':
        return <FileCheck size={16} />;
      case 'policy':
        return <FileText size={16} />;
      case 'report':
        return <FileText size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={18} className="text-slate-400" />
          </button>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">Ministry Documents</h2>
          <p className="text-slate-400">Access financial reports, policies, and official ministry documents</p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 hover:bg-slate-800 transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-slate-600 transition-colors">
                <FileText size={24} className="text-sky-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{doc.title}</h3>
                    <p className="text-sm text-slate-400">{doc.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 whitespace-nowrap ${getCategoryColor(doc.category)}`}>
                    {getCategoryIcon(doc.category)}
                    {doc.category}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {doc.date}
                  </span>
                  <span>•</span>
                  <span>{doc.size}</span>
                </div>

                {/* Download Button or Pending Status */}
                {doc.url === '#' || doc.size === 'Pending' ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-400 rounded-lg text-sm font-medium">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    Pending IRS Approval
                  </div>
                ) : (
                  <a
                    href={doc.url}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download size={16} />
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (if no documents) */}
      {documents.length === 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Documents Available</h3>
          <p className="text-slate-400">Documents will appear here when they are uploaded.</p>
        </div>
      )}
    </div>
  );
}
