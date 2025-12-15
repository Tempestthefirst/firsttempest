import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Camera, User, Upload, Check } from 'lucide-react';
import logo from '@/assets/logo.png';

interface SignupStep3Props {
  onComplete: (photoFile: File) => void;
  onBack: () => void;
  loading: boolean;
}

export default function SignupStep3({ onComplete, onBack, loading }: SignupStep3Props) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setPhotoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photoFile) {
      toast.error('Please upload a photo of yourself');
      return;
    }

    onComplete(photoFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </motion.div>

        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <img
            src={logo}
            alt="FirstPay Logo"
            className="w-28 h-auto mx-auto mb-2"
          />
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-1 rounded-full bg-primary" />
          <div className="w-8 h-1 rounded-full bg-primary" />
          <div className="w-8 h-1 rounded-full bg-primary" />
        </div>

        {/* Identity Check card */}
        <Card className="p-8 shadow-banking-lg border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Identity Check</h1>
              <p className="text-muted-foreground text-sm">Step 3 of 3</p>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-6">
            Upload a clear photo of yourself. This helps us verify you're a real person and protects your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo upload area */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload photo"
              />

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={triggerFileInput}
                className={`
                  relative w-40 h-40 mx-auto rounded-full border-2 border-dashed cursor-pointer
                  flex items-center justify-center overflow-hidden transition-colors
                  ${photoPreview ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                `}
              >
                {photoPreview ? (
                  <>
                    <img 
                      src={photoPreview} 
                      alt="Your photo" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <User className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Tap to upload</p>
                  </div>
                )}
              </motion.div>

              {!photoPreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileInput}
                  className="w-full h-12"
                  disabled={loading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Photo
                </Button>
              )}

              {photoPreview && (
                <div className="flex items-center justify-center gap-2 text-sm text-primary">
                  <Check className="w-4 h-4" />
                  <span>Photo uploaded</span>
                </div>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-2">Photo Guidelines</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Face clearly visible, well-lit</li>
                <li>• No sunglasses or face coverings</li>
                <li>• Neutral background preferred</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium"
              disabled={loading || !photoFile}
              aria-label="Finish setup"
            >
              {loading ? 'Creating your account...' : 'Finish Setup'}
            </Button>
          </form>
        </Card>

        <motion.p
          className="text-center text-muted-foreground text-xs mt-6 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your photo is securely stored and used only for identity verification purposes.
        </motion.p>
      </motion.div>
    </div>
  );
}
