import { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { 
  X, 
  Download, 
  ArrowLeft, 
  User,
  Calendar,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  History,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle} from './dialog';
import * as pdfjsLib from "pdfjs-dist/";

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface ApplicationDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  applicationData: any;
  onDownloadPDF: () => void;
  onBack: () => void;
}

interface DocumentPreviewCardProps {
  attachment: any;
  index: number;
}

function DocumentPreviewCard({ attachment, index }: DocumentPreviewCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getDocumentName = (fileName: string, category?: string) => {
    // First check category
    if (category) {
      switch (category) {
        case 'application_photo': return 'Passport Photo';
        case 'signature': return 'Signature';
        case 'passport_bio_page': return 'Passport Bio Page';
        case 'medical_license': return 'Medical License';
        case 'part_1_passing_email': return 'Part 1 Passing Email';
        case 'supporting_document': return 'Supporting Document';
        default: break;
      }
    }
    
    // Then check filename
    switch (fileName) {
      case 'passport-image': return 'Passport Photo';
      case 'signature': return 'Signature';
      case 'passport_bio_page': return 'Passport Bio Page';
      case 'medical_license': return 'Medical License';
      case 'part_1_passing_email': return 'Part 1 Passing Email';
      default: return fileName || `Document ${index + 1}`;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handlePreview = async () => {
    setIsZoomed(false); // Reset zoom when opening preview
    setPosition({ x: 0, y: 0 });
    if (attachment.fileType === 'document' && attachment.base64Data) {
      setIsLoadingPdf(true);
      setIsPreviewOpen(true);
      
      try {
        // If it's already an array of images (processed PDF), use it directly
        if (Array.isArray(attachment.base64Data)) {
          setPdfPages(attachment.base64Data);
        } else {
          // If it's a single base64 string, convert to array
          setPdfPages([attachment.base64Data]);
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        setPdfPages([]);
      } finally {
        setIsLoadingPdf(false);
      }
    } else {
      // For images, just open the preview
      setIsPreviewOpen(true);
    }
  };

  const handleDoubleClick = () => {
    if (isZoomed) {
      // Zoom out
      setIsZoomed(false);
      setPosition({ x: 0, y: 0 });
    } else {
      // Zoom in
      setIsZoomed(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isZoomed) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const isImage = attachment.fileType === 'image' && attachment.base64Data;
  const isPdf = attachment.fileType === 'document' && attachment.base64Data;
  const hasPreview = isImage || isPdf;

  return (
    <>
      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-3">
          {isImage && (
            <img
              src={attachment.base64Data || attachment.url}
              alt={getDocumentName(attachment.fileName, attachment.category)}
              className="w-12 h-12 object-cover rounded border border-slate-200 dark:border-slate-700 flex-shrink-0"
            />
          )}
          {isPdf && (
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-700 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          )}
          {!hasPreview && (
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-gray-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {getDocumentName(attachment.fileName, attachment.category)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {attachment.fileType === "document" ? "PDF" : attachment.fileType === "image" ? "Image" : "Unknown"}
              {attachment.size && ` • ${formatFileSize(attachment.size)}`}
            </p>
            {attachment.uploadedAt && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {format(new Date(attachment.uploadedAt), 'PPp')}
              </p>
            )}
          </div>
          {hasPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="text-xs flex-shrink-0"
            >
              Preview
            </Button>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getDocumentName(attachment.fileName, attachment.category)}</DialogTitle>
          </DialogHeader>
          
          {isLoadingPdf ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p className="ml-2 text-slate-400">Loading PDF...</p>
            </div>
          ) : isImage ? (
            <div className="space-y-4">
              {/* Helper Text */}
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Double-click to {isZoomed ? 'zoom out' : 'zoom in'}{isZoomed ? ' • Drag to pan' : ''}
                </p>
              </div>

              {/* Image Display with Interactive Zoom */}
              <div 
                className="flex justify-center overflow-hidden max-h-[70vh] relative"
                style={{ cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
              >
                <img
                  src={attachment.base64Data || attachment.url}
                  alt={getDocumentName(attachment.fileName, attachment.category)}
                  className="rounded border border-slate-200 dark:border-slate-700 select-none"
                  style={{ 
                    transform: `scale(${isZoomed ? 2 : 1}) translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                  onDoubleClick={handleDoubleClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  draggable={false}
                />
              </div>
            </div>
          ) : isPdf && pdfPages.length > 0 ? (
            <div className="space-y-4">
              {/* PDF Navigation and Helper Text */}
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded flex-wrap gap-2">
                {/* PDF Navigation */}
                {pdfPages.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Page {currentPage + 1} of {pdfPages.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(pdfPages.length - 1, currentPage + 1))}
                      disabled={currentPage === pdfPages.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                )}
                
                {/* Helper Text */}
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Double-click to {isZoomed ? 'zoom out' : 'zoom in'}{isZoomed ? ' • Drag to pan' : ''}
                </p>
              </div>
              
              {/* PDF Page Display with Interactive Zoom */}
              <div 
                className="flex justify-center overflow-hidden max-h-[70vh] relative"
                style={{ cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
              >
                <img
                  src={pdfPages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  className="rounded border border-slate-200 dark:border-slate-700 shadow-lg select-none"
                  style={{ 
                    transform: `scale(${isZoomed ? 2 : 1}) translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                  onDoubleClick={handleDoubleClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  draggable={false}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-400">Preview not available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ApplicationDetailView({ 
  isOpen, 
  onClose, 
  applicationData, 
  onDownloadPDF,
  onBack
}: ApplicationDetailViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await onDownloadPDF();
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'UNDER_REVIEW': return 'Under Review';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'SUBMITTED': return 'Submitted';
      case 'DRAFT': return 'Draft';
      default: return status;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATED': return <Info className="h-4 w-4 text-blue-500" />;
      case 'UPDATED': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'SUBMITTED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'UNDER_REVIEW': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 overflow-y-auto">
      {/* Full Page Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Application Details
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Candidate ID: {applicationData?.candidateId || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Application Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</label>
                    <p className="text-slate-900 dark:text-slate-100 font-medium">
                      {applicationData?.fullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Usual Forename</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.aktDetails?.usualForename || applicationData?.osceDetails?.usualForename || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Name</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.aktDetails?.lastName || applicationData?.osceDetails?.lastName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Candidate ID</label>
                    <p className="text-slate-900 dark:text-slate-100 font-mono">
                      {applicationData?.candidateId || 'N/A'}
                    </p>
                  </div>
                  {applicationData?.poBox && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">P.O. Box</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.poBox}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(applicationData?.status)}>
                        {formatStatus(applicationData?.status)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Waiting List</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.isWaiting ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400">
                          On Waiting List
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400">
                          Not Waiting
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">District</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.district || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Province</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.province || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Country</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.country || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Origin Country</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.originCountry || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Clinical Experience Country</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.clinicalExperienceCountry || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Registration Authority</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.registrationAuthority || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Registration Number</label>
                    <p className="text-slate-900 dark:text-slate-100 font-mono">
                      {applicationData?.registrationNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Registration Date</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.registrationDate 
                        ? format(new Date(applicationData.registrationDate), 'PPP')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Applied Date</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.createdAt 
                        ? format(new Date(applicationData.createdAt), 'PPP')
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Updated Date</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.updatedAt 
                        ? format(new Date(applicationData.updatedAt), 'PPP')
                        : 'N/A'
                      }
                    </p>
                  </div>
                  {applicationData?.reviewedAt && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Reviewed Date</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {format(new Date(applicationData.reviewedAt), 'PPP')}
                      </p>
                    </div>
                  )}
                  {applicationData?.reviewedBy && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Reviewed By</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.reviewedBy.firstName} {applicationData.reviewedBy.lastName}
                      </p>
                    </div>
                  )}
                  {applicationData?.candidateStatement !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Candidate Statement</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.candidateStatement ? 'Agreed' : 'Not Agreed'}
                      </p>
                    </div>
                  )}
                  {applicationData?.termsAgreed !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Terms Agreed</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.termsAgreed ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400">
                            Agreed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400">
                            Not Agreed
                          </Badge>
                        )}
                      </p>
                    </div>
                  )}
                  {applicationData?.agreementName && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Agreement Name</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.agreementName}
                      </p>
                    </div>
                  )}
                  {applicationData?.agreementDate && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Agreement Date</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {format(new Date(applicationData.agreementDate), 'PPP')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact & Address Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Personal Contact (WhatsApp)</label>
                    <p className="text-slate-900 dark:text-slate-100 font-mono">
                      {applicationData?.personalContact || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Emergency Contact</label>
                    <p className="text-slate-900 dark:text-slate-100 font-mono">
                      {applicationData?.emergencyContact || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email Address</label>
                    <p className="text-slate-900 dark:text-slate-100">
                      {applicationData?.email || 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {applicationData?.streetAddress && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Street Address</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.streetAddress}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {applicationData?.city && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">City</label>
                        <p className="text-slate-900 dark:text-slate-100">
                          {applicationData.city}
                        </p>
                      </div>
                    )}
                    {applicationData?.district && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">District</label>
                        <p className="text-slate-900 dark:text-slate-100">
                          {applicationData.district}
                        </p>
                      </div>
                    )}
                    {applicationData?.province && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Province</label>
                        <p className="text-slate-900 dark:text-slate-100">
                          {applicationData.province}
                        </p>
                      </div>
                    )}
                    {applicationData?.country && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Country</label>
                        <p className="text-slate-900 dark:text-slate-100">
                          {applicationData.country}
                        </p>
                      </div>
                    )}
                  </div>
                  {applicationData?.originCountry && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Country of Origin</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.originCountry}
                      </p>
                    </div>
                  )}
                  {applicationData?.countryOfExperience && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Country of Experience</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.countryOfExperience}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Exam Occurrence Details */}
            {applicationData?.examOccurrence && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Exam Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Exam Type</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        <Badge variant="outline" className="mt-1">
                          {applicationData.examOccurrence.type}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Exam Title</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.examOccurrence.title || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Location</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.examOccurrence.location?.join(', ') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Registration Start</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.examOccurrence.registrationStartDate 
                          ? format(new Date(applicationData.examOccurrence.registrationStartDate), 'PPP')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Registration End</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.examOccurrence.registrationEndDate 
                          ? format(new Date(applicationData.examOccurrence.registrationEndDate), 'PPP')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Application Limit</label>
                      <p className="text-slate-900 dark:text-slate-100">
                        {applicationData.examOccurrence.applicationLimit || 'N/A'}
                      </p>
                    </div>
                    {applicationData.examOccurrence.waitingListLimit !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Waiting List Limit</label>
                        <p className="text-slate-900 dark:text-slate-100">
                          {applicationData.examOccurrence.waitingListLimit}
                        </p>
                      </div>
                    )}
                    {applicationData.examOccurrence.isActive !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Exam Status</label>
                        <p className="text-slate-900 dark:text-slate-100">
                          <Badge variant="outline" className={applicationData.examOccurrence.isActive ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400'}>
                            {applicationData.examOccurrence.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </p>
                      </div>
                    )}
                    {applicationData.examOccurrence.instructions && (
                      <div className="col-span-full">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Instructions</label>
                        <p className="text-slate-900 dark:text-slate-100 text-sm mt-1">
                          {applicationData.examOccurrence.instructions}
                        </p>
                      </div>
                    )}
                    {applicationData.examOccurrence.examSlots && applicationData.examOccurrence.examSlots.length > 0 && (
                      <div className="col-span-full">
                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Exam Slots</label>
                        <div className="space-y-2">
                          {applicationData.examOccurrence.examSlots.map((slot: any, index: number) => (
                            <div key={slot.id || index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center space-x-4">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {slot.startDate && format(new Date(slot.startDate), 'PPP p')} - {slot.endDate && format(new Date(slot.endDate), 'p')}
                                  </p>
                                </div>
                              </div>
                              {slot.isActive !== undefined && (
                                <Badge variant="outline" className={slot.isActive ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400'}>
                                  {slot.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exam-Specific Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  {applicationData?.examOccurrence?.type === 'AKT' ? 'AKT Details' : 'OSCE Details'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {applicationData?.examOccurrence?.type === 'AKT' ? (
                    <>
                      {applicationData?.aktDetails?.graduatingSchoolName && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">School Name</label>
                          <p className="text-slate-900 dark:text-slate-100">
                            {applicationData.aktDetails.graduatingSchoolName}
                          </p>
                        </div>
                      )}
                      {applicationData?.aktDetails?.graduatingSchoolLocation && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">School Location</label>
                          <p className="text-slate-900 dark:text-slate-100">
                            {applicationData.aktDetails.graduatingSchoolLocation}
                          </p>
                        </div>
                      )}
                      {applicationData?.aktDetails?.dateOfQualification && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date of Qualification</label>
                          <p className="text-slate-900 dark:text-slate-100">
                            {format(new Date(applicationData.aktDetails.dateOfQualification), 'PPP')}
                          </p>
                        </div>
                      )}
                      {applicationData?.aktDetails?.previousAKTAttempts !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Previous AKT Attempts</label>
                          <p className="text-slate-900 dark:text-slate-100">
                            {applicationData.aktDetails.previousAKTAttempts}
                          </p>
                        </div>
                      )}
                      {applicationData?.aktDetails?.examinationCenterPreference && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Examination Center Preference</label>
                          <p className="text-slate-900 dark:text-slate-100">
                            {applicationData.aktDetails.examinationCenterPreference}
                          </p>
                        </div>
                      )}
                      {applicationData?.aktDetails?.examDate && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Exam Date</label>
                          <p className="text-slate-900 dark:text-slate-100">
                            {format(new Date(applicationData.aktDetails.examDate), 'PPP')}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {applicationData?.osceDetails?.aktPassingDate && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">AKT Passing Date</label>
                          <p className="text-slate-900 dark:text-slate-100">
                            {format(new Date(applicationData.osceDetails.aktPassingDate), 'PPP')}
                          </p>
                        </div>
                      )}
                      {applicationData?.osceDetails?.previousOSCEAttempts !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Previous OSCE Attempts</label>
                          <p className="text-slate-900 dark:text-slate-100">
                            {applicationData.osceDetails.previousOSCEAttempts}
                          </p>
                        </div>
                      )}
                      {applicationData?.osceDetails?.preferenceDate1 && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Preference Date 1</label>
                          <p className="text-slate-900 dark:text-slate-100">
                            {format(new Date(applicationData.osceDetails.preferenceDate1), 'PPP')}
                          </p>
                        </div>
                      )}
                      {applicationData?.osceDetails?.preferenceDate2 && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Preference Date 2</label>
                          <p className="text-slate-900 dark:text-slate-100">
                            {format(new Date(applicationData.osceDetails.preferenceDate2), 'PPP')}
                          </p>
                        </div>
                      )}
                      {applicationData?.osceDetails?.preferenceDate3 && (
                        <div>
                          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Preference Date 3</label>
                          <p className="text-slate-900 dark:text-slate-100">
                            {format(new Date(applicationData.osceDetails.preferenceDate3), 'PPP')}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Eligibility & Candidate Statements for AKT */}
            {applicationData?.examOccurrence?.type === 'AKT' && (
              applicationData?.aktDetails?.eligibilityA !== undefined || 
              applicationData?.aktDetails?.eligibilityB !== undefined || 
              applicationData?.aktDetails?.eligibilityC !== undefined ||
              applicationData?.aktDetails?.candidateStatementA !== undefined ||
              applicationData?.aktDetails?.candidateStatementB !== undefined ||
              applicationData?.aktDetails?.candidateStatementC !== undefined
            ) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Eligibility Section */}
                {(applicationData?.aktDetails?.eligibilityA !== undefined || 
                  applicationData?.aktDetails?.eligibilityB !== undefined || 
                  applicationData?.aktDetails?.eligibilityC !== undefined) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Eligibility Criteria
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {applicationData?.aktDetails?.eligibilityA !== undefined && (
                        <div className="flex items-start space-x-2">
                          <div className="mt-1">
                            {applicationData.aktDetails.eligibilityA ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              Eligibility A
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {applicationData.aktDetails.eligibilityA ? 'Confirmed' : 'Not Confirmed'}
                            </p>
                          </div>
                        </div>
                      )}
                      {applicationData?.aktDetails?.eligibilityB !== undefined && (
                        <div className="flex items-start space-x-2">
                          <div className="mt-1">
                            {applicationData.aktDetails.eligibilityB ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              Eligibility B
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {applicationData.aktDetails.eligibilityB ? 'Confirmed' : 'Not Confirmed'}
                            </p>
                          </div>
                        </div>
                      )}
                      {applicationData?.aktDetails?.eligibilityC !== undefined && (
                        <div className="flex items-start space-x-2">
                          <div className="mt-1">
                            {applicationData.aktDetails.eligibilityC ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              Eligibility C
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {applicationData.aktDetails.eligibilityC ? 'Confirmed' : 'Not Confirmed'}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Candidate Statements Section */}
                {(applicationData?.aktDetails?.candidateStatementA !== undefined || 
                  applicationData?.aktDetails?.candidateStatementB !== undefined || 
                  applicationData?.aktDetails?.candidateStatementC !== undefined) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Candidate Statements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {applicationData?.aktDetails?.candidateStatementA !== undefined && (
                        <div className="flex items-start space-x-2">
                          <div className="mt-1">
                            {applicationData.aktDetails.candidateStatementA ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              Statement A
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {applicationData.aktDetails.candidateStatementA ? 'Agreed' : 'Not Agreed'}
                            </p>
                          </div>
                        </div>
                      )}
                      {applicationData?.aktDetails?.candidateStatementB !== undefined && (
                        <div className="flex items-start space-x-2">
                          <div className="mt-1">
                            {applicationData.aktDetails.candidateStatementB ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              Statement B
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {applicationData.aktDetails.candidateStatementB ? 'Agreed' : 'Not Agreed'}
                            </p>
                          </div>
                        </div>
                      )}
                      {applicationData?.aktDetails?.candidateStatementC !== undefined && (
                        <div className="flex items-start space-x-2">
                          <div className="mt-1">
                            {applicationData.aktDetails.candidateStatementC ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              Statement C
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {applicationData.aktDetails.candidateStatementC ? 'Agreed' : 'Not Agreed'}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Admin Notes and Notes */}
            {(applicationData?.adminNotes || applicationData?.notes) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {applicationData?.adminNotes && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Admin Notes</label>
                      <p className="text-slate-900 dark:text-slate-100 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700 mt-1">
                        {applicationData.adminNotes}
                      </p>
                    </div>
                  )}
                  {applicationData?.notes && (
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Application Notes</label>
                      <p className="text-slate-900 dark:text-slate-100 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 mt-1">
                        {applicationData.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {applicationData?.attachments && applicationData.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents ({applicationData.attachments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {applicationData.attachments.map((attachment: any, index: number) => (
                      <DocumentPreviewCard 
                        key={attachment.id || index} 
                        attachment={attachment} 
                        index={index}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

           
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <History className="h-5 w-5 mr-2" />
                  Application Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <div className="space-y-6">
                  {applicationData?.history?.map((event: any, index: number) => (
                    <div key={event.id || index} className="relative">
                      {index !== applicationData.history.length - 1 && (
                        <div className="absolute left-5 top-12 w-0.5 h-full bg-slate-200 dark:bg-slate-700"></div>
                      )}
                      <div className="flex items-start space-x-5">
                        <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                          {getActionIcon(event.action)}
                        </div>
                        <div className="flex-1 min-w-0 pb-6">
                          <div className="flex flex-col space-y-2.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                                  {event.description}
                                </p>
                                <Badge variant="outline" className={`text-xs mt-1.5 ${getStatusColor(event.action)}`}>
                                  {event.action}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(event.timestamp), 'PPP - p')}
                              </div>
                              
                              {event.performedBy && (
                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                  <User className="h-3 w-3 mr-1" />
                                  <span className="font-medium">{event.performedBy.fullName}</span>
                                  <span className="mx-1">•</span>
                                  <span className="text-slate-400 dark:text-slate-500">{event.performedBy.role}</span>
                                </div>
                              )}
                            </div>

                            {event.metadata?.changedFields && event.metadata.changedFields.length > 0 && (
                              <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                                  Changed Fields:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {event.metadata.changedFields.map((field: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                                      {field}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {event.metadata?.adminNotes && (
                              <div className="mt-2 p-3.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-700/50">
                                <div className="flex items-start gap-2.5">
                                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-1.5">
                                      Admin Notes:
                                    </p>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed break-words">
                                      {event.metadata.adminNotes}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {event.metadata?.reason && (
                              <div className="mt-2 p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700/50">
                                <div className="flex items-start gap-2.5">
                                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1.5">
                                      Reason:
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed break-words">
                                      {event.metadata.reason}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {event.metadata?.previousStatus && event.metadata?.newStatus && (
                              <div className="mt-2 flex items-center space-x-2 text-xs">
                                <Badge className={getStatusColor(event.metadata.previousStatus)}>
                                  {event.metadata.previousStatus}
                                </Badge>
                                <span className="text-slate-400">→</span>
                                <Badge className={getStatusColor(event.metadata.newStatus)}>
                                  {event.metadata.newStatus}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
