import { ContentModerator, ModerationResult, ModerationLevel } from './types';

// Google Cloud Vision API implementation
export class GoogleVisionModerator implements ContentModerator {
  private apiKey?: string;
  private credentials?: any;
  private endpoint = 'https://vision.googleapis.com/v1/images:annotate';
  private tokenEndpoint = 'https://oauth2.googleapis.com/token';

  constructor(apiKey?: string, credentialsJson?: string) {
    if (!apiKey && !credentialsJson) {
      throw new Error('Either API key or Service Account credentials are required');
    }
    
    this.apiKey = apiKey;
    
    if (credentialsJson) {
      try {
        this.credentials = JSON.parse(credentialsJson);
      } catch (error) {
        throw new Error('Invalid Google Cloud credentials JSON');
      }
    }
  }

  /**
   * Obtiene un access token usando Service Account credentials
   */
  private async getAccessToken(): Promise<string> {
    if (!this.credentials) {
      throw new Error('No credentials available for token generation');
    }

    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // Token válido por 1 hora

    // Crear JWT
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const claimSet = {
      iss: this.credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-vision',
      aud: this.tokenEndpoint,
      exp: expiry,
      iat: now,
    };

    // Importar crypto para firmar el JWT
    const crypto = await import('crypto');
    
    const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const claimSetBase64 = Buffer.from(JSON.stringify(claimSet)).toString('base64url');
    const signatureInput = `${headerBase64}.${claimSetBase64}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    sign.end();
    
    const signature = sign.sign(this.credentials.private_key, 'base64url');
    const jwt = `${signatureInput}.${signature}`;

    // Intercambiar JWT por access token
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get access token: ${error.error_description || response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async moderateImage(imageBuffer: Buffer): Promise<ModerationResult> {
    try {
      const base64Image = imageBuffer.toString('base64');

      let url = this.endpoint;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Usar API Key o Service Account según lo que esté disponible
      if (this.apiKey) {
        url = `${this.endpoint}?key=${this.apiKey}`;
      } else if (this.credentials) {
        const accessToken = await this.getAccessToken();
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'SAFE_SEARCH_DETECTION',
                  maxResults: 1,
                },
                {
                  type: 'OBJECT_LOCALIZATION',
                  maxResults: 10,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Google Vision API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      const safeSearch = data.responses?.[0]?.safeSearchAnnotation;
      const objects = data.responses?.[0]?.localizedObjectAnnotations || [];

      if (!safeSearch) {
        throw new Error('No safe search annotation in response');
      }

      // Detectar objetos peligrosos (armas, cuchillos, etc.)
      const dangerousObjects = [
        'gun', 'weapon', 'firearm', 'rifle', 'pistol', 'handgun',
        'knife', 'sword', 'blade', 'dagger',
      ];

      let hasWeapon = false;
      const detectedWeapons: string[] = [];

      objects.forEach((obj: any) => {
        const objectName = obj.name?.toLowerCase() || '';
        const confidence = obj.score || 0;

        // Solo considerar detecciones con confianza > 50%
        if (confidence > 0.5) {
          if (dangerousObjects.some(weapon => objectName.includes(weapon))) {
            hasWeapon = true;
            detectedWeapons.push(`${obj.name} (${Math.round(confidence * 100)}%)`);
          }
        }
      });

      if (hasWeapon) {
        console.log('[GoogleVisionModerator] Weapons detected:', detectedWeapons);
      }

      // Si detectamos armas, elevar el nivel de violencia a VERY_LIKELY
      const violenceLevel = hasWeapon 
        ? ModerationLevel.VERY_LIKELY 
        : (safeSearch.violence as ModerationLevel);

      return {
        adult: safeSearch.adult as ModerationLevel,
        violence: violenceLevel,
        racy: safeSearch.racy as ModerationLevel,
        spoof: safeSearch.spoof as ModerationLevel,
        medical: safeSearch.medical as ModerationLevel,
      };
    } catch (error) {
      console.error('[GoogleVisionModerator] Error:', error);
      throw error;
    }
  }
}
