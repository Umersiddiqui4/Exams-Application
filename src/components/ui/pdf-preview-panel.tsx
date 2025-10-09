import { useState, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { 
  X, 
  Download, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  FileImage,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

interface PDFPreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  applicationData: any;
  onDownloadPDF: () => void;
  onDetailView: () => void;
  isLoading?: boolean;
}

interface AttachmentPreviewItemProps {
  attachment: any;
  index: number;
}

function AttachmentPreviewItem({ attachment, index }: AttachmentPreviewItemProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getDocumentName = (fileName: string) => {
    switch (fileName) {
      case 'passport-image': return 'Passport Photo';
      case 'signature': return 'Signature';
      case 'passport_bio_page': return 'Passport Bio Page';
      case 'passport_bio_page': return 'Passport Bio Page';
      case 'medical_license': return 'Medical License';
      case 'part_1_passing_email': return 'Part 1 Passing Email';
      default: return `Document ${index + 1}`;
    }
  };

  const handlePreview = () => {
    setIsZoomed(false); // Reset zoom when opening preview
    setPosition({ x: 0, y: 0 });
    if (attachment.fileType === 'document' && attachment.base64Data) {
      setIsPreviewOpen(true);
      // If it's already an array of images (processed PDF), use it directly
      if (Array.isArray(attachment.base64Data)) {
        setPdfPages(attachment.base64Data);
      } else {
        // If it's a single base64 string, convert to array
        setPdfPages([attachment.base64Data]);
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
      <div className="flex items-center justify-between p-2 bg-slate-700 dark:bg-slate-800 rounded text-xs hover:bg-slate-600 dark:hover:bg-slate-700 transition-colors">
        <div className="flex items-center space-x-2 flex-1">
          {isImage && (
            <img
              src={attachment.base64Data}
              alt={getDocumentName(attachment.fileName)}
              className="w-8 h-8 object-cover rounded border border-slate-600"
            />
          )}
          {isPdf && (
            <div className="w-8 h-8 bg-red-900/30 rounded border border-red-700 flex items-center justify-center">
              <FileText className="h-4 w-4 text-red-400" />
            </div>
          )}
          {!hasPreview && (
            <div className="w-8 h-8 bg-slate-600 rounded border border-slate-500 flex items-center justify-center">
              <FileText className="h-4 w-4 text-slate-400" />
            </div>
          )}
          <span className="text-slate-300 truncate">
            {getDocumentName(attachment.fileName)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
            {attachment.fileType === "document" ? "PDF" : attachment.fileType === "image" ? "Image" : "Unknown"}
          </Badge>
          {hasPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreview}
              className="text-xs h-6 px-2 text-slate-300 hover:text-slate-100 hover:bg-slate-600"
            >
              View
            </Button>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              {getDocumentName(attachment.fileName)}
            </DialogTitle>
          </DialogHeader>
          
          {isImage ? (
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
                  src={attachment.base64Data}
                  alt={getDocumentName(attachment.fileName)}
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

export function PDFPreviewPanel({ 
  isOpen, 
  onClose, 
  applicationData, 
  onDownloadPDF, 
  onDetailView,
  isLoading = false
}: PDFPreviewPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [passportImage, setPassportImage] = useState<string | null>(null);

  useEffect(() => {
    if (applicationData && applicationData.attachments) {
      const passportAttachment = applicationData.attachments.find(
        (att: any) => att.fileName === "passport-image" && att.base64Data
      );
      if (passportAttachment) {
        setPassportImage(passportAttachment.base64Data);
      } else {
        setPassportImage(null);
      }
    } else {
      // Clear passport image when applicationData is null or doesn't have attachments
      setPassportImage(null);
    }
  }, [applicationData]);

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
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'UNDER_REVIEW': return 'Under Review';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'SUBMITTED': return 'Submitted';
      default: return status;
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-slate-900 dark:bg-slate-950 border-l border-slate-700 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 dark:bg-slate-900">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-200">PDF Preview</h2>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b border-slate-700 bg-slate-800 dark:bg-slate-900">
        <div className="flex space-x-2">
          <Button
            onClick={handleDownloadPDF}
            disabled={isGenerating || isLoading || !applicationData}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
            onClick={onDetailView}
            disabled={isLoading || !applicationData}
            variant="outline"
            className="flex-1 border-slate-600 text-slate-600 hover:bg-slate-600"
          >
            <Eye className="h-4 w-4 mr-2" />
            Detail View
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <p className="text-slate-400 text-sm">Loading application data...</p>
          </div>
        ) : !applicationData ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <FileText className="h-12 w-12 text-slate-500" />
            <p className="text-slate-400 text-sm">No application data available</p>
          </div>
        ) : (
          <>
            {/* Passport Photo */}
            {passportImage && (
          <Card className="bg-slate-800 dark:bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300 flex items-center">
                <FileImage className="h-4 w-4 mr-2" />
                Passport Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <img
                  src={passportImage}
                  alt="Passport"
                  className="w-24 h-24 object-cover rounded border border-slate-600"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Info */}
        <Card className="bg-slate-800 dark:bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Candidate ID:</span>
              <span className="text-sm text-slate-200 font-mono">
                {applicationData?.candidateId || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Name:</span>
              <span className="text-sm text-slate-200 font-medium">
                {applicationData?.fullName || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Status:</span>
              <Badge className={`text-xs ${getStatusColor(applicationData?.status)}`}>
                {formatStatus(applicationData?.status)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Applied:</span>
              <span className="text-sm text-slate-200">
                {applicationData?.createdAt 
                  ? format(new Date(applicationData.createdAt), 'MMM dd, yyyy')
                  : 'N/A'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-slate-800 dark:bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Contact Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-2">
              <Mail className="h-3 w-3 text-slate-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm text-slate-200">{applicationData?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Phone className="h-3 w-3 text-slate-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">WhatsApp</p>
                <p className="text-sm text-slate-200">{applicationData?.personalContact || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Phone className="h-3 w-3 text-slate-400 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Emergency</p>
                <p className="text-sm text-slate-200">{applicationData?.emergencyContact || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="bg-slate-800 dark:bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-200">
              {applicationData?.streetAddress && (
                <p>{applicationData.streetAddress}</p>
              )}
              <p>
                {[applicationData?.city, applicationData?.district, applicationData?.province, applicationData?.country]
                  .filter(Boolean)
                  .join(', ') || 'No address provided'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Education/Experience */}
        <Card className="bg-slate-800 dark:bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              {applicationData?.examOccurrence?.type === 'AKT' ? 'Education' : 'Experience'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {applicationData?.examOccurrence?.type === 'AKT' ? (
              <>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">School:</span>
                  <span className="text-sm text-slate-200">
                    {applicationData?.aktDetails?.graduatingSchoolName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Location:</span>
                  <span className="text-sm text-slate-200">
                    {applicationData?.aktDetails?.graduatingSchoolLocation || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Qualified:</span>
                  <span className="text-sm text-slate-200">
                    {applicationData?.aktDetails?.dateOfQualification
                      ? format(new Date(applicationData.aktDetails.dateOfQualification), 'MMM yyyy')
                      : 'N/A'
                    }
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Country:</span>
                  <span className="text-sm text-slate-200">
                    {applicationData?.clinicalExperienceCountry || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-400">Origin:</span>
                  <span className="text-sm text-slate-200">
                    {applicationData?.originCountry || 'N/A'}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Attachments Summary */}
        {applicationData?.attachments && applicationData.attachments.length > 0 && (
          <Card className="bg-slate-800 dark:bg-slate-900 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Documents ({applicationData.attachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applicationData.attachments.map((attachment: any, index: number) => (
                  <AttachmentPreviewItem 
                    key={attachment.id || index} 
                    attachment={attachment} 
                    index={index}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800 dark:bg-slate-900">
        <p className="text-xs text-slate-400 text-center">
          Preview generated from application data
        </p>
      </div>
    </div>
  );
}
