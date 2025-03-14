'use client';

import { Image as ImageIcon } from 'lucide-react';

interface NoImagePlaceholderProps {
  className?: string;
  variant?: 'product' | 'user';
}

export default function NoImagePlaceholder({ 
  className = "w-full h-full",
  variant = 'product'
}: NoImagePlaceholderProps) {
  return (
    <div className={`${className} relative bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
      <div className="relative flex flex-col items-center justify-center text-gray-400 p-4">
        <ImageIcon className="w-12 h-12 mb-2" />
        <p className="text-base font-medium text-center">Fără imagine disponibilă</p>
      </div>
    </div>
  );
} 