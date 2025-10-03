"use client";

import { Instagram, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-gray-50 border-t border-gray-200 mt-8 md:mt-12'>
      <div className='max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-12'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8'>
          {/* Soporte */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-2 md:mb-4 text-sm md:text-base'>Soporte</h3>
            <ul className='space-y-2 md:space-y-3'>
              <li>
                <a
                  href='#'
                  className='text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm'
                >
                  Centro de ayuda
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm'
                >
                  Información de seguridad
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm'
                >
                  Contáctanos
                </a>
              </li>
            </ul>
          </div>

          {/* Expertos */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-2 md:mb-4 text-sm md:text-base'>Expertos</h3>
            <ul className='space-y-2 md:space-y-3'>
              <li>
                <a
                  href='#'
                  className='text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm'
                >
                  Convertite en experto
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-600 hover:text-gray-900 transition-colors text-xs md:text-sm'
                >
                  Centro de recursos
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Section - Mobile */}
        <div className='md:hidden flex justify-center py-4 border-b border-gray-200'>
          <div className='flex items-center space-x-4'>
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

        {/* Bottom Section */}
        <div className='border-t border-gray-200 md:border-t-0 pt-4 md:pt-8'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0'>
            {/* Left side - Legal links */}
            <div className='flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 text-xs md:text-sm text-gray-600'>
              <span>© {currentYear} Experto Cerca, Inc.</span>
              <span className='hidden md:inline'>·</span>
              <a href='#' className='hover:text-gray-900 transition-colors'>
                Privacidad
              </a>
              <span className='hidden md:inline'>·</span>
              <a href='#' className='hover:text-gray-900 transition-colors'>
                Términos
              </a>
              <span className='hidden md:inline'>·</span>
              <a href='#' className='hover:text-gray-900 transition-colors'>
                Mapa del sitio
              </a>
            </div>

            {/* Right side - Social and Contact (Desktop only) */}
            <div className='hidden md:flex items-center justify-end'>
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
