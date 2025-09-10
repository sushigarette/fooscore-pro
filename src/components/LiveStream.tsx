import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Video, VideoOff, Send } from 'lucide-react'

interface LiveStreamProps {
  matchId: string
  currentUserId?: string
  currentUsername?: string
}

type ChatMessage = {
  id: string
  userId?: string
  username?: string
  text: string
  ts: number
}

const LiveStream: React.FC<LiveStreamProps> = ({ matchId, currentUserId, currentUsername }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const channel = useMemo(() => supabase.channel(`match-${matchId}-chat`), [matchId])

  const startCamera = useCallback(async () => {
    if (isCameraOn) return
    setIsJoining(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      mediaStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      // Default mic state
      stream.getAudioTracks().forEach((t) => (t.enabled = isMicOn))
      setIsCameraOn(true)
    } catch (error) {
      console.error('Failed to start camera', error)
    } finally {
      setIsJoining(false)
    }
  }, [isCameraOn, isMicOn])

  const stopCamera = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    mediaStreamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraOn(false)
  }, [])

  const toggleMic = useCallback(() => {
    const next = !isMicOn
    setIsMicOn(next)
    mediaStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next))
  }, [isMicOn])

  const sendMessage = useCallback(async () => {
    const text = message.trim()
    if (!text) return
    const payload: ChatMessage = {
      id: crypto.randomUUID(),
      userId: currentUserId,
      username: currentUsername || 'Anonyme',
      text,
      ts: Date.now(),
    }
    setMessage('')
    await channel.send({ type: 'broadcast', event: 'chat', payload })
    // Optimistic append
    setMessages((prev) => [...prev, payload])
  }, [message, currentUserId, currentUsername, channel])

  useEffect(() => {
    const sub = channel.on('broadcast', { event: 'chat' }, (e) => {
      const payload = e.payload as ChatMessage
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev
        return [...prev, payload]
      })
    }).subscribe()

    return () => {
      try { channel.unsubscribe() } catch {}
    }
  }, [channel])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live</span>
          {isCameraOn ? (
            <Badge variant="secondary">En direct</Badge>
          ) : (
            <Badge variant="outline">Hors ligne</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Preview */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative w-full aspect-video bg-black rounded overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Aperçu caméra désactivé
                </div>)
              }
            </div>
            <div className="flex items-center gap-2">
              {isCameraOn ? (
                <Button variant="destructive" onClick={stopCamera}>
                  <VideoOff className="h-4 w-4 mr-2" /> Arrêter
                </Button>
              ) : (
                <Button onClick={startCamera} disabled={isJoining}>
                  <Video className="h-4 w-4 mr-2" /> {isJoining ? 'Connexion…' : 'Démarrer la caméra'}
                </Button>
              )}
              <Button variant={isMicOn ? 'outline' : 'secondary'} onClick={toggleMic} disabled={!isCameraOn}>
                {isMicOn ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                {isMicOn ? 'Couper le micro' : 'Activer le micro'}
              </Button>
            </div>
          </div>

          {/* Chat */}
          <div className="flex flex-col h-[420px] border rounded-md">
            <div className="px-3 py-2 border-b">
              <Label className="text-sm">Tchat en direct</Label>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground">Aucun message pour l’instant.</div>
              ) : (
                messages
                  .sort((a, b) => a.ts - b.ts)
                  .map((m) => (
                    <div key={m.id} className="text-sm">
                      <span className="font-medium">{m.username || 'Anonyme'}:</span>{' '}
                      <span>{m.text}</span>
                    </div>
                  ))
              )}
            </div>
            <div className="p-3 border-t flex items-center gap-2">
              <Input
                placeholder="Votre message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
              />
              <Button onClick={sendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LiveStream


