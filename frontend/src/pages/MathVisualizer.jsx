import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader, Share, Download } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MathVisualizer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [mathText, setMathText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError('');
      } else {
        setError('Please select an image file');
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    } else {
      setError('Please drop an image file');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setProcessingStatus('Processing your input...');
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      setProcessingStatus('Generating video...');
      setTimeout(() => {
        setIsProcessing(false);
        setVideoUrl('/api/placeholder/640/360');
      }, 2000);
    }, 2000);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Math Visualization Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
                <TabsTrigger value="text">Enter Text</TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {!previewUrl ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                      <div>
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                        >
                          Select Image
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        or drag and drop your image here
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleClearFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="text">
                <textarea
                  className="w-full h-40 p-4 border rounded-lg resize-none"
                  placeholder="Enter your mathematical expression or equation here..."
                  value={mathText}
                  onChange={(e) => setMathText(e.target.value)}
                />
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6">
              <Button
                onClick={handleSubmit}
                disabled={isProcessing || (!selectedFile && !mathText)}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    {processingStatus}
                  </>
                ) : (
                  'Generate Visualization'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {videoUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <img
                  src={videoUrl}
                  alt="Generated visualization"
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MathVisualizer;