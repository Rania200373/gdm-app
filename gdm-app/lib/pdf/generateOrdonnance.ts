import jsPDF from 'jspdf'

interface OrdonnanceData {
  id: string
  date_prescription: string
  patient: {
    profile: {
      first_name: string
      last_name: string
    }
    date_naissance?: string
  }
  medecin: {
    profile: {
      first_name: string
      last_name: string
    }
    specialite: string
    adresse_cabinet?: string
    ville?: string
    telephone?: string
  }
  medicaments: Array<{
    nom: string
    dosage: string
    duree: string
    instructions: string
  }>
  diagnostic?: string
  notes?: string
}

export function generateOrdonnancePDF(data: OrdonnanceData) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let yPos = 20

  // En-tête médecin
  doc.setFillColor(59, 130, 246) // blue-600
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(`Dr. ${data.medecin.profile.first_name} ${data.medecin.profile.last_name}`, margin, 20)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(data.medecin.specialite, margin, 30)
  
  if (data.medecin.adresse_cabinet) {
    doc.setFontSize(10)
    doc.text(data.medecin.adresse_cabinet, margin, 38)
    if (data.medecin.ville) {
      doc.text(data.medecin.ville, margin, 44)
    }
  }
  
  if (data.medecin.telephone) {
    doc.text(`Tél: ${data.medecin.telephone}`, pageWidth - margin - 50, 38)
  }

  yPos = 70
  doc.setTextColor(0, 0, 0)

  // Titre
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('ORDONNANCE MÉDICALE', pageWidth / 2, yPos, { align: 'center' })
  yPos += 15

  // Date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const dateStr = new Date(data.date_prescription).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  doc.text(`Date: ${dateStr}`, pageWidth - margin - 60, yPos)
  yPos += 10

  // Informations patient
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Patient(e):', margin, yPos)
  yPos += 8
  
  doc.setFont('helvetica', 'normal')
  doc.text(`${data.patient.profile.first_name} ${data.patient.profile.last_name}`, margin + 5, yPos)
  
  if (data.patient.date_naissance) {
    const age = new Date().getFullYear() - new Date(data.patient.date_naissance).getFullYear()
    yPos += 6
    doc.text(`Âge: ${age} ans`, margin + 5, yPos)
  }
  
  yPos += 15

  // Diagnostic (si présent)
  if (data.diagnostic) {
    doc.setFont('helvetica', 'bold')
    doc.text('Diagnostic:', margin, yPos)
    yPos += 8
    
    doc.setFont('helvetica', 'normal')
    const diagnosticLines = doc.splitTextToSize(data.diagnostic, pageWidth - 2 * margin - 10)
    doc.text(diagnosticLines, margin + 5, yPos)
    yPos += diagnosticLines.length * 6 + 10
  }

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // Titre médicaments
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PRESCRIPTION', margin, yPos)
  yPos += 10

  // Liste des médicaments
  doc.setFontSize(11)
  data.medicaments.forEach((med, index) => {
    // Vérifier si on a assez d'espace, sinon nouvelle page
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    // Numéro et nom du médicament
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${med.nom}`, margin + 5, yPos)
    yPos += 7

    // Dosage
    doc.setFont('helvetica', 'normal')
    doc.text(`   Dosage: ${med.dosage}`, margin + 5, yPos)
    yPos += 6

    // Durée
    doc.text(`   Durée: ${med.duree}`, margin + 5, yPos)
    yPos += 6

    // Instructions
    if (med.instructions) {
      const instrLines = doc.splitTextToSize(`   ${med.instructions}`, pageWidth - 2 * margin - 15)
      doc.text(instrLines, margin + 5, yPos)
      yPos += instrLines.length * 6
    }

    yPos += 8
  })

  // Notes additionnelles
  if (data.notes) {
    yPos += 5
    
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.text('Notes:', margin, yPos)
    yPos += 8
    
    doc.setFont('helvetica', 'normal')
    const notesLines = doc.splitTextToSize(data.notes, pageWidth - 2 * margin - 10)
    doc.text(notesLines, margin + 5, yPos)
    yPos += notesLines.length * 6
  }

  // Signature
  yPos = doc.internal.pageSize.getHeight() - 40
  
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(10)
  doc.text('Signature et cachet du médecin:', pageWidth - margin - 70, yPos)
  
  // Ligne pour signature
  doc.line(pageWidth - margin - 70, yPos + 20, pageWidth - margin, yPos + 20)

  // Pied de page
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text(
    'Cette ordonnance est valable pour une durée de 3 mois à compter de la date de prescription.',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  )

  // Générer le nom du fichier
  const fileName = `Ordonnance_${data.patient.profile.last_name}_${dateStr.replace(/\s/g, '_')}.pdf`
  
  // Télécharger le PDF
  doc.save(fileName)
}
