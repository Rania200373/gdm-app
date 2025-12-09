import jsPDF from 'jspdf'

interface DossierMedicalData {
  patient: {
    first_name: string
    last_name: string
    date_naissance?: string
    phone?: string
  }
  antecedents: Array<{
    type: string
    titre: string
    description?: string
    date_debut: string
    date_fin?: string
  }>
  allergies: Array<{
    nom: string
    type: string
    severite: string
    reaction?: string
  }>
  examens: Array<{
    type_examen: string
    resultat: string
    date_examen: string
    medecin?: {
      profile: {
        first_name: string
        last_name: string
      }
    }
  }>
}

export function generateDossierMedicalPDF(data: DossierMedicalData) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let yPos = 20

  // En-tête
  doc.setFillColor(147, 51, 234) // purple-600
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.text('DOSSIER MÉDICAL', pageWidth / 2, 25, { align: 'center' })

  yPos = 60
  doc.setTextColor(0, 0, 0)

  // Informations patient
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Informations du patient', margin, yPos)
  yPos += 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nom: ${data.patient.first_name} ${data.patient.last_name}`, margin + 5, yPos)
  yPos += 6

  if (data.patient.date_naissance) {
    const age = new Date().getFullYear() - new Date(data.patient.date_naissance).getFullYear()
    doc.text(`Date de naissance: ${new Date(data.patient.date_naissance).toLocaleDateString('fr-FR')} (${age} ans)`, margin + 5, yPos)
    yPos += 6
  }

  if (data.patient.phone) {
    doc.text(`Téléphone: ${data.patient.phone}`, margin + 5, yPos)
    yPos += 6
  }

  doc.text(`Date d'édition: ${new Date().toLocaleDateString('fr-FR')}`, margin + 5, yPos)
  yPos += 15

  // Allergies
  if (data.allergies && data.allergies.length > 0) {
    doc.setFillColor(239, 68, 68) // red-500
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('⚠️ ALLERGIES', margin + 5, yPos)
    yPos += 12

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    data.allergies.forEach((allergie, index) => {
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }

      const severiteColor = allergie.severite === 'severe' ? 'SÉVÈRE' : 
                           allergie.severite === 'moderee' ? 'MODÉRÉE' : 'LÉGÈRE'
      
      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}. ${allergie.nom} (${severiteColor})`, margin + 5, yPos)
      yPos += 5

      doc.setFont('helvetica', 'normal')
      doc.text(`Type: ${allergie.type}`, margin + 10, yPos)
      yPos += 5

      if (allergie.reaction) {
        const reactionLines = doc.splitTextToSize(`Réaction: ${allergie.reaction}`, pageWidth - 2 * margin - 15)
        doc.text(reactionLines, margin + 10, yPos)
        yPos += reactionLines.length * 5
      }

      yPos += 3
    })

    yPos += 5
  }

  // Antécédents
  if (data.antecedents && data.antecedents.length > 0) {
    if (yPos > 220) {
      doc.addPage()
      yPos = 20
    }

    doc.setFillColor(59, 130, 246) // blue-600
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ANTÉCÉDENTS MÉDICAUX', margin + 5, yPos)
    yPos += 12

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    data.antecedents.forEach((ant, index) => {
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }

      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}. ${ant.titre}`, margin + 5, yPos)
      yPos += 5

      doc.setFont('helvetica', 'normal')
      doc.text(`Type: ${ant.type}`, margin + 10, yPos)
      yPos += 5

      doc.text(`Date: ${new Date(ant.date_debut).toLocaleDateString('fr-FR')}`, margin + 10, yPos)
      yPos += 5

      if (ant.description) {
        const descLines = doc.splitTextToSize(ant.description, pageWidth - 2 * margin - 15)
        doc.text(descLines, margin + 10, yPos)
        yPos += descLines.length * 5
      }

      yPos += 3
    })

    yPos += 5
  }

  // Examens
  if (data.examens && data.examens.length > 0) {
    if (yPos > 220) {
      doc.addPage()
      yPos = 20
    }

    doc.setFillColor(16, 185, 129) // green-500
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('EXAMENS ET RÉSULTATS', margin + 5, yPos)
    yPos += 12

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    data.examens.forEach((examen, index) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}. ${examen.type_examen}`, margin + 5, yPos)
      yPos += 5

      doc.setFont('helvetica', 'normal')
      doc.text(`Date: ${new Date(examen.date_examen).toLocaleDateString('fr-FR')}`, margin + 10, yPos)
      yPos += 5

      if (examen.medecin) {
        doc.text(`Médecin: Dr. ${examen.medecin.profile.first_name} ${examen.medecin.profile.last_name}`, margin + 10, yPos)
        yPos += 5
      }

      const resultLines = doc.splitTextToSize(`Résultat: ${examen.resultat}`, pageWidth - 2 * margin - 15)
      doc.text(resultLines, margin + 10, yPos)
      yPos += resultLines.length * 5 + 3
    })
  }

  // Pied de page
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Page ${i} sur ${totalPages} - Document confidentiel`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  const fileName = `Dossier_Medical_${data.patient.last_name}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`
  doc.save(fileName)
}
