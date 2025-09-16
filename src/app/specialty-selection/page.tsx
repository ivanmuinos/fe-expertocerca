'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SPECIALTIES = [
  'Plomería',
  'Electricidad',
  'Carpintería',
  'Pintura',
  'Jardinería',
  'Limpieza',
  'Albañilería',
  'Techado',
  'Cerrajería',
  'Aire Acondicionado',
];

export default function SpecialtySelectionPage() {
  const router = useRouter();
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const handleContinue = () => {
    if (selectedSpecialty) {
      router.push('/professional-intro');
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Selecciona tu Especialidad</h1>
        <p className="text-gray-600 mb-8">
          Elige la especialidad que mejor describe tu profesión principal.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {SPECIALTIES.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                selectedSpecialty === specialty
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Atrás
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedSpecialty}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}