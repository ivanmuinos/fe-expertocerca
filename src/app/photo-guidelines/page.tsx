'use client';

import { useRouter } from 'next/navigation';

export default function PhotoGuidelinesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Guías para la Foto de Perfil</h1>

        <div className="space-y-4 mb-8">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">✓ Recomendado:</h3>
            <ul className="text-green-700 space-y-1">
              <li>• Foto clara y bien iluminada</li>
              <li>• Rostro visible sin obstáculos</li>
              <li>• Fondo neutro o profesional</li>
              <li>• Vestimenta apropiada para tu profesión</li>
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">✗ Evitar:</h3>
            <ul className="text-red-700 space-y-1">
              <li>• Fotos borrosas o mal iluminadas</li>
              <li>• Múltiples personas en la foto</li>
              <li>• Filtros excesivos</li>
              <li>• Contenido inapropiado</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Atrás
          </button>
          <button
            onClick={() => router.push('/photo-upload')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}