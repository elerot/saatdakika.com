import React from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface IframeModalProps {
  url: string;
  onClose: () => void;
}

const IframeModal: React.FC<IframeModalProps> = ({ url, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full h-full max-w-4xl max-h-[90vh] rounded-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Haber Detayı</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex-grow">
          <iframe src={url} className="w-full h-full border-0" title="Haber Detayı"></iframe>
        </div>
      </div>
    </div>
  );
};

export default IframeModal;

