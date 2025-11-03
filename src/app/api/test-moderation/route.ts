import { NextRequest, NextResponse } from 'next/server';
import { imageModerationService } from '@/src/shared/lib/image-moderation';

/**
 * Endpoint de prueba para moderación de imágenes
 * 
 * Uso:
 * POST /api/test-moderation
 * Body: { "imageUrl": "https://ejemplo.com/imagen.jpg" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl es requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 Moderando imagen:', imageUrl);

    const result = await imageModerationService.moderateImage(imageUrl);

    console.log('✅ Resultado de moderación:', result);

    return NextResponse.json({
      success: true,
      result,
      message: result.isSafe
        ? '✅ Imagen aprobada'
        : `❌ Imagen rechazada: ${result.reasons.join(', ')}`,
    });
  } catch (error: any) {
    console.error('❌ Error en test-moderation:', error);
    return NextResponse.json(
      {
        error: 'Error al moderar imagen',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint GET para probar con URLs de ejemplo
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({
      message: 'Endpoint de prueba de moderación de imágenes',
      usage: 'POST /api/test-moderation con body: { "imageUrl": "..." }',
      example: 'GET /api/test-moderation?url=https://ejemplo.com/imagen.jpg',
    });
  }

  try {
    const result = await imageModerationService.moderateImage(imageUrl);

    return NextResponse.json({
      success: true,
      result,
      message: result.isSafe
        ? '✅ Imagen aprobada'
        : `❌ Imagen rechazada: ${result.reasons.join(', ')}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Error al moderar imagen',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
