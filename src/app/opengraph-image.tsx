import { ImageResponse } from 'next/og'
export const alt = 'Brigitta · Muzică live pentru evenimente'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#102b30',
        color: '#f2f4ee',
        width: '100%',
        height: '100%',
        padding: '65px',
      }}
    >
      <div style={{ display: 'flex', fontSize: 28, letterSpacing: 5 }}>BRIGITTA</div>
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: 92, lineHeight: 1.1 }}>
        <span>Brigitta.</span>
        <span style={{ color: '#d9ef8c' }}>Vocea unei seri.</span>
      </div>
      <div style={{ display: 'flex', fontSize: 22 }}>
        MUZICĂ LIVE · NUNȚI · CORPORATE · EVENIMENTE PRIVATE
      </div>
    </div>,
    size,
  )
}
