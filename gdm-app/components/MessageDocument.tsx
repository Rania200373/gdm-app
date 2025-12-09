'use client'

import Link from 'next/link'

interface MessageDocumentProps {
  message: any
  isCurrentUser: boolean
}

export default function MessageDocument({ message, isCurrentUser }: MessageDocumentProps) {
  if (message.type_message === 'ordonnance') {
    return (
      <div
        className={`max-w-[70%] rounded-2xl overflow-hidden shadow-lg ${
          isCurrentUser
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
            : 'bg-white text-gray-900'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">📋</span>
            <span className="font-semibold">Ordonnance médicale</span>
          </div>
          
          <p className={`text-sm mb-3 ${isCurrentUser ? 'text-blue-100' : 'text-gray-600'}`}>
            Prescrit le {new Date(message.document_data?.date_prescription).toLocaleDateString('fr-FR')}
          </p>

          {message.document_data?.diagnostic && (
            <div className={`p-3 rounded-lg mb-3 ${isCurrentUser ? 'bg-white/10' : 'bg-blue-50'}`}>
              <p className={`text-xs font-medium mb-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                Diagnostic
              </p>
              <p className={`text-sm ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
                {message.document_data.diagnostic}
              </p>
            </div>
          )}

          {message.document_data?.medicaments && message.document_data.medicaments.length > 0 && (
            <div className={`p-3 rounded-lg mb-3 ${isCurrentUser ? 'bg-white/10' : 'bg-purple-50'}`}>
              <p className={`text-xs font-medium mb-2 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                Médicaments ({message.document_data.medicaments.length})
              </p>
              <div className="space-y-1">
                {message.document_data.medicaments.slice(0, 3).map((med: any, idx: number) => (
                  <p key={idx} className={`text-sm ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
                    • {med.nom}
                  </p>
                ))}
                {message.document_data.medicaments.length > 3 && (
                  <p className={`text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                    ... et {message.document_data.medicaments.length - 3} autre(s)
                  </p>
                )}
              </div>
            </div>
          )}

          <Link
            href={`/dashboard/ordonnances/${message.document_id}`}
            className={`block text-center py-2 px-4 rounded-lg font-semibold transition-colors ${
              isCurrentUser
                ? 'bg-white text-blue-600 hover:bg-blue-50'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Voir l'ordonnance complète →
          </Link>
        </div>

        <div className={`px-4 py-2 text-xs ${isCurrentUser ? 'bg-white/10 text-blue-100' : 'bg-gray-50 text-gray-400'}`}>
          {new Date(message.created_at).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    )
  }

  if (message.type_message === 'examen') {
    return (
      <div
        className={`max-w-[70%] rounded-2xl overflow-hidden shadow-lg ${
          isCurrentUser
            ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
            : 'bg-white text-gray-900'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">🔬</span>
            <span className="font-semibold">Résultat d'examen</span>
          </div>
          
          <p className={`text-lg font-bold mb-2 ${isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
            {message.document_data?.type_examen}
          </p>

          <p className={`text-sm mb-3 ${isCurrentUser ? 'text-green-100' : 'text-gray-600'}`}>
            Date: {new Date(message.document_data?.date_examen).toLocaleDateString('fr-FR')}
          </p>

          {message.document_data?.resultat && (
            <div className={`p-3 rounded-lg mb-3 ${isCurrentUser ? 'bg-white/10' : 'bg-green-50'}`}>
              <p className={`text-xs font-medium mb-1 ${isCurrentUser ? 'text-green-100' : 'text-gray-500'}`}>
                Résultat
              </p>
              <p className={`text-sm line-clamp-4 ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
                {message.document_data.resultat}
              </p>
            </div>
          )}

          <div className={`text-center py-2 px-4 rounded-lg font-semibold ${
            isCurrentUser
              ? 'bg-white text-green-600'
              : 'bg-green-600 text-white'
          }`}>
            Résultat partagé
          </div>
        </div>

        <div className={`px-4 py-2 text-xs ${isCurrentUser ? 'bg-white/10 text-green-100' : 'bg-gray-50 text-gray-400'}`}>
          {new Date(message.created_at).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    )
  }

  // Message texte normal
  return (
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
        isCurrentUser
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
          : 'bg-white shadow-md text-gray-900'
      }`}
    >
      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
      <p
        className={`text-xs mt-1 ${
          isCurrentUser ? 'text-blue-100' : 'text-gray-400'
        }`}
      >
        {new Date(message.created_at).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  )
}
