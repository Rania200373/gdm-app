'use client'

import { generateOrdonnancePDF } from '@/lib/pdf/generateOrdonnance'

interface OrdonnancePDFButtonProps {
  ordonnance: any
}

export default function OrdonnancePDFButton({ ordonnance }: OrdonnancePDFButtonProps) {
  const handleDownload = () => {
    try {
      generateOrdonnancePDF(ordonnance)
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      alert('Erreur lors de la génération du PDF')
    }
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
      <span>Télécharger PDF</span>
    </button>
  )
}
