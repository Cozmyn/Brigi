import { ImageResponse } from 'next/og'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#171918',
        color: '#eb593b',
        width: '100%',
        height: '100%',
        fontSize: 125,
      }}
    >
      B
    </div>,
    size,
  )
}
