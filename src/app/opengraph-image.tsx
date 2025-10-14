import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Experto Cerca - Encuentra Profesionales';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #0166cb 0%, #014a94 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        Experto Cerca
      </div>
    ),
    {
      ...size,
    }
  );
}
