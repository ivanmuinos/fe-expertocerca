import vision from '@google-cloud/vision';

export interface SafeSearchResult {
  isSafe: boolean;
  adult: string;
  violence: string;
  racy: string;
  spoof: string;
  medical: string;
  reasons: string[];
}

class ImageModerationService {
  private client: vision.ImageAnnotatorClient | null = null;

  private getClient() {
    if (this.client) return this.client;

    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;
    
    if (!credentials) {
      throw new Error('GOOGLE_CLOUD_CREDENTIALS no está configurada');
    }

    try {
      const credentialsObj = JSON.parse(credentials);
      
      this.client = new vision.ImageAnnotatorClient({
        credentials: credentialsObj,
      });

      return this.client;
    } catch (error) {
      console.error('Error al parsear credenciales de Google Cloud:', error);
      throw new Error('Credenciales de Google Cloud inválidas');
    }
  }

  /**
   * Modera una imagen usando Google Cloud Vision Safe Search
   * @param imageUrl - URL de la imagen a moderar
   * @returns Resultado de la moderación
   */
  async moderateImage(imageUrl: string): Promise<SafeSearchResult> {
    try {
      const client = this.getClient();

      // Realizar Safe Search Detection
      const [result] = await client.safeSearchDetection(imageUrl);
      const detections = result.safeSearchAnnotation;

      if (!detections) {
        throw new Error('No se pudo analizar la imagen');
      }

      // Definir umbrales - LIKELY o VERY_LIKELY se consideran inseguros
      const isUnsafe = (level: string | null | undefined) =>
        level === 'LIKELY' || level === 'VERY_LIKELY';

      const reasons: string[] = [];
      let isSafe = true;

      // Verificar contenido adulto/sexual
      if (isUnsafe(detections.adult)) {
        isSafe = false;
        reasons.push('Contenido sexual explícito detectado');
      }

      // Verificar violencia (armas, sangre, etc.)
      if (isUnsafe(detections.violence)) {
        isSafe = false;
        reasons.push('Contenido violento detectado (armas, violencia)');
      }

      // Verificar contenido sugerente
      if (isUnsafe(detections.racy)) {
        isSafe = false;
        reasons.push('Contenido sugerente detectado');
      }

      // Opcional: También puedes ser más estricto con POSSIBLE
      // if (detections.adult === 'POSSIBLE') {
      //   isSafe = false;
      //   reasons.push('Posible contenido inapropiado');
      // }

      return {
        isSafe,
        adult: detections.adult || 'UNKNOWN',
        violence: detections.violence || 'UNKNOWN',
        racy: detections.racy || 'UNKNOWN',
        spoof: detections.spoof || 'UNKNOWN',
        medical: detections.medical || 'UNKNOWN',
        reasons,
      };
    } catch (error) {
      console.error('Error al moderar imagen con Google Vision:', error);
      
      // En caso de error, permitir la imagen pero loguear
      // Puedes cambiar esto a rechazar en producción
      return {
        isSafe: true,
        adult: 'ERROR',
        violence: 'ERROR',
        racy: 'ERROR',
        spoof: 'ERROR',
        medical: 'ERROR',
        reasons: ['Error al analizar imagen - permitida por defecto'],
      };
    }
  }

  /**
   * Modera múltiples imágenes en paralelo
   */
  async moderateImages(imageUrls: string[]): Promise<SafeSearchResult[]> {
    const promises = imageUrls.map((url) => this.moderateImage(url));
    return Promise.all(promises);
  }
}

// Exportar instancia singleton
export const imageModerationService = new ImageModerationService();
