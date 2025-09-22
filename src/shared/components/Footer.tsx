"use client";

import { Instagram, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-gray-50 border-t border-gray-200 mt-12'>
      <div className='max-w-7xl mx-auto px-6 py-12'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
          {/* Soporte */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-4'>Soporte</h3>
            <ul className='space-y-3'>
              <li>
                <a
                  href='#'
                  className='text-gray-600 hover:text-gray-900 transition-colors text-sm'
                >
                  Centro de ayuda
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-600 hover:text-gray-900 transition-colors text-sm'
                >
                  Información de seguridad
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-600 hover:text-gray-900 transition-colors text-sm'
                >
                  Contáctanos
                </a>
              </li>
            </ul>
          </div>

          {/* Expertos */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-4'>Expertos</h3>
            <ul className='space-y-3'>
              <li>
                <a
                  href='#'
                  className='text-gray-600 hover:text-gray-900 transition-colors text-sm'
                >
                  Convertite en experto
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-600 hover:text-gray-900 transition-colors text-sm'
                >
                  Centro de recursos
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='border-t border-gray-200 pt-8'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
            {/* Left side - Legal links */}
            <div className='flex flex-wrap items-center space-x-4 text-sm text-gray-600'>
              <span>© {currentYear} Experto Cerca, Inc.</span>
              <span>·</span>
              <a href='#' className='hover:text-gray-900 transition-colors'>
                Privacidad
              </a>
              <span>·</span>
              <a href='#' className='hover:text-gray-900 transition-colors'>
                Términos
              </a>
              <span>·</span>
              <a href='#' className='hover:text-gray-900 transition-colors'>
                Mapa del sitio
              </a>
            </div>

            {/* Right side - Social and Contact */}
            <div className='flex items-center space-x-4'>
              {/* Social and contact links */}
              <div className='flex items-center space-x-3'>
                <a
                  href='#'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                  aria-label='Instagram'
                >
                  <Instagram className='h-5 w-5' />
                </a>
                <a
                  href='mailto:hola@expertocerca.com'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                  aria-label='Correo electrónico'
                >
                  <Mail className='h-5 w-5' />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
