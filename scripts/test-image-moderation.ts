/**
 * Script para probar la moderación de imágenes localmente
 * 
 * Uso: npx tsx scripts/test-image-moderation.ts
 */

// URLs de prueba (imágenes seguras de ejemplo)
const testImages = [
  {
    name: 'Imagen segura - Herramientas',
    url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800',
  },
  {
    name: 'Imagen segura - Construcción',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
  },
  {
    name: 'Imagen segura - Plomería',
    url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800',
  },
];

async function testModeration() {
  console.log('🧪 Probando moderación de imágenes con Google Cloud Vision\n');

  for (const image of testImages) {
    console.log(`📸 Probando: ${image.name}`);
    console.log(`   URL: ${image.url}`);

    try {
      const response = await fetch('http://localhost:3000/api/test-moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: image.url }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`   ✅ ${data.message}`);
        console.log(`   📊 Detalles:`, {
          adult: data.result.adult,
          violence: data.result.violence,
          racy: data.result.racy,
        });
      } else {
        console.log(`   ❌ Error:`, data.error);
      }
    } catch (error: any) {
      console.log(`   ❌ Error de conexión:`, error.message);
    }

    console.log('');
  }
}

testModeration();
