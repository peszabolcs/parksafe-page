import React from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { X } from 'lucide-react';

function ImagePreview({ src, alt = 'Kép előnézet', onClose }) {
  if (!src) return null;

  return (
    <Dialog open={!!src} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent 
        className="p-0 border-0 bg-transparent shadow-none w-fit h-fit max-w-[90vw] max-h-[90vh]"
        style={{ zIndex: 9999 }}
      >
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-900 shadow-2xl ring-3 ring-black/20 hover:ring-black/30 transition-all hover:scale-110"
            aria-label="Bezárás"
          >
            <X className="h-3 w-5 stroke-[2.5]" />
          </button>

          {/* Image */}
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImagePreview;


