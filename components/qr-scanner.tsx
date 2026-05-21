'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QrScannerProps {
  onScan: (code: string) => void
  onClose: () => void
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const handleScan = useCallback(
    (text: string) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      onScan(text.trim().toUpperCase())
    },
    [onScan]
  )

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setReady(true)
        }

        if (!('BarcodeDetector' in window)) {
          setError('Сканер не поддерживается этим браузером. Введите код вручную.')
          return
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })

        const detect = async () => {
          if (cancelled || !videoRef.current) return
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const codes: any[] = await detector.detect(videoRef.current)
            if (codes.length > 0) {
              handleScan(codes[0].rawValue)
              return
            }
          } catch {
            // continue
          }
          rafRef.current = requestAnimationFrame(detect)
        }
        rafRef.current = requestAnimationFrame(detect)
      } catch {
        setError('Не удалось открыть камеру. Проверьте разрешения браузера.')
      }
    }

    start()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [handleScan])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onClose}
        className="absolute right-2 top-2 z-10 text-white hover:bg-white/20"
      >
        <X className="h-4 w-4" />
      </Button>

      {!ready && !error && (
        <div className="flex h-48 items-center justify-center gap-2 text-sm text-white/70">
          <Camera className="h-5 w-5 animate-pulse" />
          Открываем камеру...
        </div>
      )}

      {error && (
        <div className="flex h-48 items-center justify-center p-4 text-center text-sm text-red-400">
          {error}
        </div>
      )}

      <video
        ref={videoRef}
        className={`w-full rounded-2xl ${ready ? 'block' : 'hidden'}`}
        muted
        playsInline
      />

      {ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-48 rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
        </div>
      )}
    </div>
  )
}
