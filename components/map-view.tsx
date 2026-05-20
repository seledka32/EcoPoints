'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useLanguage } from '@/hooks/use-language'

export type WasteType = 'plastic' | 'paper' | 'glass' | 'metal' | 'electronics' | 'organic'

export interface DropoffPoint {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  types: WasteType[]
  hours: string
  pointsPerKg: number
}

const TYPE_COLORS: Record<WasteType, string> = {
  plastic: '#3b82f6',
  paper: '#f59e0b',
  glass: '#10b981',
  metal: '#6b7280',
  electronics: '#8b5cf6',
  organic: '#22c55e',
}

const TYPE_EMOJI: Record<WasteType, string> = {
  plastic: '♻️',
  paper: '📄',
  glass: '🫙',
  metal: '🔩',
  electronics: '📱',
  organic: '🌱',
}

function createMarkerIcon(types: WasteType[], isActive: boolean) {
  const color = TYPE_COLORS[types[0]] ?? '#10b981'
  const s = isActive ? 18 : 13
  return L.divIcon({
    className: '',
    html: `<div style="width:${s * 2}px;height:${s * 2}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.35);${isActive ? `outline:3px solid ${color};outline-offset:3px;` : ''}"></div>`,
    iconSize: [s * 2, s * 2],
    iconAnchor: [s, s],
    popupAnchor: [0, -s - 4],
  })
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1.2 })
  }, [map, lat, lng])
  return null
}

interface MapViewProps {
  points: DropoffPoint[]
  activePointId?: string | null
  userLocation?: [number, number] | null
  onPointClick: (id: string) => void
}

export default function MapView({ points, activePointId, userLocation, onPointClick }: MapViewProps) {
  const { t } = useLanguage()
  const center: [number, number] = userLocation ?? [42.8746, 74.5698]

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />

      {userLocation && <FlyTo lat={userLocation[0]} lng={userLocation[1]} />}

      {userLocation && (
        <CircleMarker
          center={userLocation}
          radius={11}
          pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.85, weight: 3 }}
        >
          <Popup>{t('map-you-are-here')}</Popup>
        </CircleMarker>
      )}

      {points.map(point => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={createMarkerIcon(point.types, point.id === activePointId)}
          eventHandlers={{ click: () => onPointClick(point.id) }}
        >
          <Popup minWidth={220}>
            <strong style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>{point.name}</strong>
            <span style={{ color: '#6b7280', fontSize: 12 }}>{point.address}</span>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {point.types.map(type => (
                <span
                  key={type}
                  style={{
                    background: TYPE_COLORS[type] + '22',
                    color: TYPE_COLORS[type],
                    border: `1px solid ${TYPE_COLORS[type]}55`,
                    borderRadius: 4,
                    padding: '2px 7px',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {TYPE_EMOJI[type]} {t(`waste-${type}`)}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
              <div>🕐 {point.hours}</div>
              <div>⚡ {point.pointsPerKg} {t('map-pts-per-kg')}</div>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: 10,
                padding: '5px 12px',
                background: '#10b981',
                color: 'white',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {t('map-route')} →
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
