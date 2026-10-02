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
        background: '#102b30',
        color: '#d9ef8c',
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
