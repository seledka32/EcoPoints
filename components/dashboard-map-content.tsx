'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { Loader2, Navigation, MapPin, Clock, Zap, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/dashboard-header'
import { useLanguage } from '@/hooks/use-language'
import type { DropoffPoint, WasteType } from '@/components/map-view'

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted/30">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  ),
})

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

const ALL_TYPES: WasteType[] = ['plastic', 'paper', 'glass', 'metal', 'electronics', 'organic']

const MOCK_POINTS: DropoffPoint[] = [
  { id: '1', name: 'ЭкоПункт Тверская', address: 'Тверская ул., 5', lat: 55.7600, lng: 37.6173, types: ['plastic', 'paper', 'glass'], hours: '09:00–21:00', pointsPerKg: 30 },
  { id: '2', name: 'Сбор отходов Арбат', address: 'Старый Арбат, 22', lat: 55.7517, lng: 37.5926, types: ['plastic', 'metal', 'electronics'], hours: '10:00–20:00', pointsPerKg: 40 },
  { id: '3', name: 'Зелёная точка Хамовники', address: 'Пречистенка, 10', lat: 55.7445, lng: 37.6001, types: ['paper', 'glass', 'organic'], hours: '08:00–22:00', pointsPerKg: 25 },
  { id: '4', name: 'ЭкоБокс Замоскворечье', address: 'Б. Ордынка, 15', lat: 55.7373, lng: 37.6271, types: ['plastic', 'glass', 'metal'], hours: '24/7', pointsPerKg: 35 },
  { id: '5', name: 'Пункт приёма ВДНХ', address: 'пр-т Мира, 119', lat: 55.8309, lng: 37.6355, types: ['electronics', 'metal'], hours: '10:00–19:00', pointsPerKg: 50 },
  { id: '6', name: 'ЭкоПункт Коломенское', address: 'Коломенская ул., 8', lat: 55.6694, lng: 37.6668, types: ['organic', 'paper', 'plastic'], hours: '09:00–20:00', pointsPerKg: 28 },
  { id: '7', name: 'Сортировочный центр Сокол', address: 'Балтийская ул., 3', lat: 55.8038, lng: 37.5152, types: ['plastic', 'paper', 'glass', 'metal', 'electronics'], hours: '08:00–22:00', pointsPerKg: 45 },
  { id: '8', name: 'Приёмный пункт Выхино', address: 'Выхинская ул., 30', lat: 55.7256, lng: 37.8621, types: ['plastic', 'paper'], hours: '09:00–21:00', pointsPerKg: 30 },
  { id: '9', name: 'ЭкоПункт Медведково', address: 'Полярная ул., 12', lat: 55.8740, lng: 37.6500, types: ['glass', 'metal', 'organic'], hours: '10:00–20:00', pointsPerKg: 32 },
  { id: '10', name: 'Раздельный сбор Бибирево', address: 'Бибиревская ул., 6', lat: 55.8788, lng: 37.5987, types: ['plastic', 'paper', 'glass'], hours: '08:00–22:00', pointsPerKg: 30 },
]

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

interface Props {
  user: { email?: string | null; id: string }
  pointsBalance: number
}

export function DashboardMapContent({ user }: Props) {
  const { t } = useLanguage()
  const [activeFilter, setActiveFilter] = useState<WasteType | null>(null)
  const [activePointId, setActivePointId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState(false)

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    setLocationError(false)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        setLocating(false)
      },
      () => {
        setLocationError(true)
        setLocating(false)
      },
      { timeout: 10000 }
    )
  }, [])

  const filteredPoints = activeFilter
    ? MOCK_POINTS.filter(p => p.types.includes(activeFilter))
    : MOCK_POINTS

  const sortedPoints = userLocation
    ? [...filteredPoints].sort(
        (a, b) =>
          haversine(userLocation[0], userLocation[1], a.lat, a.lng) -
          haversine(userLocation[0], userLocation[1], b.lat, b.lng)
      )
    : filteredPoints

  const nearestId = userLocation && sortedPoints.length > 0 ? sortedPoints[0].id : null

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <DashboardHeader user={user} variant="map" />

      {/* Filter bar */}
      <div className="shrink-0 border-b border-border bg-background px-4 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveFilter(null)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === null
                ? 'bg-emerald-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {t('map-all-types')}
          </button>
          {ALL_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setActiveFilter(activeFilter === type ? null : type)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeFilter === type
                  ? 'text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              style={activeFilter === type ? { background: TYPE_COLORS[type] } : undefined}
            >
              {TYPE_EMOJI[type]} {t(`waste-${type}`)}
            </button>
          ))}
          <div className="ml-auto shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleLocate}
              disabled={locating}
              className="gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
            >
              {locating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Navigation className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {locating ? t('map-locating') : t('map-use-location')}
              </span>
            </Button>
          </div>
        </div>
        {locationError && (
          <p className="mt-1.5 text-center text-xs text-red-500">{t('map-location-error')}</p>
        )}
      </div>

      {/* Main area */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar – desktop only */}
        <aside className="hidden w-80 shrink-0 flex-col overflow-y-auto border-r border-border bg-background lg:flex">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              {sortedPoints.length} {t('map-points-found')}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sortedPoints.map(point => {
              const dist = userLocation
                ? haversine(userLocation[0], userLocation[1], point.lat, point.lng)
                : null
              const isActive = point.id === activePointId
              const isNearest = point.id === nearestId

              return (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setActivePointId(isActive ? null : point.id)}
                  className={`w-full border-b border-border/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/40 ${
                    isActive ? 'bg-emerald-500/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {isNearest && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {t('map-nearest')}
                          </span>
                        )}
                        <p className="truncate text-sm font-semibold text-foreground">{point.name}</p>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {point.address}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {point.types.map(type => (
                          <span
                            key={type}
                            className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{
                              background: TYPE_COLORS[type] + '22',
                              color: TYPE_COLORS[type],
                            }}
                          >
                            {TYPE_EMOJI[type]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {dist !== null && (
                        <p className="text-xs font-semibold text-foreground">
                          {dist < 1
                            ? `${Math.round(dist * 1000)} м`
                            : `${dist.toFixed(1)} ${t('map-km')}`}
                        </p>
                      )}
                      <p className="flex items-center justify-end gap-0.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {point.hours}
                      </p>
                      <p className="flex items-center justify-end gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                        <Zap className="h-3 w-3" />
                        {point.pointsPerKg} {t('map-pts-per-kg')}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Map */}
        <div className="relative flex-1">
          <MapView
            points={sortedPoints}
            activePointId={activePointId}
            userLocation={userLocation}
            onPointClick={id => setActivePointId(prev => (prev === id ? null : id))}
          />

          {/* Mobile: point count pill */}
          <div className="absolute bottom-4 left-1/2 z-[400] -translate-x-1/2 lg:hidden">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-background/95 px-4 py-2 text-sm font-semibold text-foreground shadow-lg backdrop-blur"
              onClick={() => {
                const el = document.getElementById('mobile-list')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <MapPin className="h-4 w-4 text-emerald-500" />
              {sortedPoints.length} {t('map-points-found')}
              <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile list */}
      <div id="mobile-list" className="shrink-0 overflow-y-auto border-t border-border bg-background lg:hidden" style={{ maxHeight: '45vh' }}>
        {sortedPoints.map(point => {
          const dist = userLocation
            ? haversine(userLocation[0], userLocation[1], point.lat, point.lng)
            : null
          const isNearest = point.id === nearestId

          return (
            <button
              key={point.id}
              type="button"
              onClick={() => setActivePointId(prev => (prev === point.id ? null : point.id))}
              className={`flex w-full items-center justify-between border-b border-border/60 px-4 py-3 text-left last:border-0 hover:bg-muted/40 ${
                activePointId === point.id ? 'bg-emerald-500/10' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {isNearest && (
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {t('map-nearest')}
                    </span>
                  )}
                  <p className="truncate text-sm font-semibold text-foreground">{point.name}</p>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{point.address}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {point.types.map(type => (
                    <span key={type} style={{ color: TYPE_COLORS[type], fontSize: 14 }}>
                      {TYPE_EMOJI[type]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ml-3 shrink-0 text-right text-xs">
                {dist !== null && (
                  <p className="font-semibold text-foreground">
                    {dist < 1 ? `${Math.round(dist * 1000)} м` : `${dist.toFixed(1)} ${t('map-km')}`}
                  </p>
                )}
                <p className="text-muted-foreground">{point.hours}</p>
                <p className="text-emerald-600 dark:text-emerald-400">
                  {point.pointsPerKg} {t('map-pts-per-kg')}
                </p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="mt-1 inline-block rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400"
                >
                  {t('map-route')} →
                </a>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
