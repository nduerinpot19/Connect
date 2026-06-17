'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  translated?: string
}

function getBrowserLang(): string {
  const lang = navigator.language?.split('-')[0] ?? 'it'
  const supported = ['it','en','es','fr','de','pt','ru','zh','ar','ja','ko','hi','tr','pl','nl']
  return supported.includes(lang) ? lang : 'en'
}

async function translateText(text: string, target: string): Promise<string> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source: 'auto', target }),
    })
    const data = await res.json()
    return data.translatedText ?? text
  } catch { return text }
}

export default function ChatWindow({
  currentUserId,
  otherUserId,
  otherUsername,
  otherLang,
}: {
  currentUserId: string
  otherUserId: string
  otherUsername: string
  otherLang: string | null
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const myLang = getBrowserLang()

  useEffect(() => {
    const supabase = createClient()

    // Carica messaggi esistenti
    supabase
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(async ({ data }) => {
        if (!data) return

        // Traduce automaticamente i messaggi in arrivo
        const translated = await Promise.all(
          data.map(async (msg) => {
            if (msg.sender_id === currentUserId) return msg
            const translatedContent = await translateText(msg.content, myLang)
            return { ...msg, translated: translatedContent !== msg.content ? translatedContent : undefined }
          })
        )
        setMessages(translated)

        // Segna come letti
        const unreadIds = data
          .filter(m => m.sender_id === otherUserId && !m.is_read)
          .map(m => m.id)
        if (unreadIds.length > 0) {
          await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .in('id', unreadIds)
        }
      })

    // Realtime: nuovi messaggi
    const channel = supabase
      .channel(`chat:${currentUserId}:${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const msg = payload.new as Message
          if (msg.sender_id !== otherUserId) return

          // Traduce automaticamente
          const translatedContent = await translateText(msg.content, myLang)
          const enriched = {
            ...msg,
            translated: translatedContent !== msg.content ? translatedContent : undefined,
          }
          setMessages(prev => [...prev, enriched])

          // Segna come letto
          await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('id', msg.id)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUserId, otherUserId, myLang])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    setSending(true)

    const supabase = createClient()

    // Se le lingue sono diverse, traduciamo automaticamente
    let contentToSend = input.trim()
    if (otherLang && otherLang !== myLang) {
      contentToSend = await translateText(input.trim(), otherLang)
    }

    const { data: msg } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: contentToSend,
      })
      .select()
      .single()

    if (msg) {
      setMessages(prev => [...prev, {
        ...msg,
        content: contentToSend,
        translated: contentToSend !== input.trim() ? `Originale: ${input.trim()}` : undefined,
      }])
    }

    setInput('')
    setSending(false)
  }

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col h-full">
      {/* Header chat */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
        <Link href="/chat" className="text-neutral-500 hover:text-white">←</Link>
        <div className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-lime-400">
          {otherUsername.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">@{otherUsername}</p>
          <p className="text-[10px] text-neutral-500">Traduzione automatica attiva</p>
        </div>
      </div>

      {/* Messaggi */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? 'bg-lime-400 text-black rounded-br-sm'
                    : 'bg-neutral-800 text-white rounded-bl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.translated && (
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-black/60' : 'text-neutral-500'}`}>
                    {msg.translated}
                  </p>
                )}
                <p className={`text-[10px] mt-1 ${isMine ? 'text-black/50' : 'text-neutral-600'} text-right`}>
                  {formatTime(msg.created_at)}
                  {isMine && <span className="ml-1">{msg.is_read ? '✓✓' : '✓'}</span>}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 flex gap-2 px-4 py-3 border-t border-neutral-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Scrivi un messaggio..."
          className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-lime-400"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50 hover:bg-lime-300 transition"
        >
          →
        </button>
      </div>
    </div>
  )
}
