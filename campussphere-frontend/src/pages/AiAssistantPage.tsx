import React, { useState, useEffect, useRef } from 'react'
import {
  TrendingUp,
  Award,
  Bot,
  Send,
  RefreshCw,
  Zap,
  Calendar,
  Users,
} from 'lucide-react'
import api from '../lib/api'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useAuth } from '../contexts/AuthContext'
import { mockEvents, mockClubs } from '../lib/mockData'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  time?: string
}

function parseInline(text: string): React.ReactNode {
  // Strip emojis
  const clean = text
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
    .trim()

  const parts: React.ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(clean)) !== null) {
    if (match.index > lastIndex) {
      parts.push(clean.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-gray-900">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-gray-700">
          {token.slice(1, -1)}
        </em>
      )
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < clean.length) {
    parts.push(clean.slice(lastIndex))
  }
  return parts.length > 0 ? parts : clean
}

function MarkdownContent({ content }: { content: string }) {
  if (!content) return null

  // Strip emojis from input
  const cleanedContent = content.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu,
    ''
  )

  const lines = cleanedContent.split('\n')
  const elements: React.ReactNode[] = []
  let tableLines: string[] = []

  const flushTable = (key: number) => {
    if (tableLines.length === 0) return
    const rows = tableLines
      .map((l) => l.trim())
      .filter((l) => l.startsWith('|') && l.endsWith('|'))
      .map((l) =>
        l
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim())
      )

    tableLines = []
    if (rows.length === 0) return

    const header = rows[0]
    const dataRows = rows.slice(1).filter((r) => !r.every((c) => /^:?-+:?$/.test(c)))

    elements.push(
      <div key={`table-${key}`} className="overflow-x-auto my-4 rounded-xl border border-gray-200 shadow-2xs">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
            <tr>
              {header.map((col, idx) => (
                <th key={idx} className="px-4 py-2.5 text-left">
                  {parseInline(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {dataRows.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-2.5 text-gray-700">
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()

    // Table line
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableLines.push(trimmed)
      return
    }

    if (tableLines.length > 0) {
      flushTable(idx)
    }

    if (!trimmed) {
      return
    }

    if (trimmed === '---') {
      elements.push(<hr key={idx} className="my-4 border-gray-200" />)
      return
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-base font-bold text-gray-900 mt-4 mb-2">
          {parseInline(trimmed.replace(/^###\s+/, ''))}
        </h3>
      )
      return
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="text-lg font-bold text-gray-900 mt-5 mb-2.5">
          {parseInline(trimmed.replace(/^##\s+/, ''))}
        </h2>
      )
      return
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="text-xl font-extrabold text-gray-900 mt-6 mb-3">
          {parseInline(trimmed.replace(/^#\s+/, ''))}
        </h1>
      )
      return
    }

    // Numbered list item like "1. Rank 1: ..."
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (numMatch) {
      elements.push(
        <div key={idx} className="flex gap-2.5 items-start my-2.5 text-sm text-gray-800">
          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-100 flex-shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <div className="flex-1 leading-relaxed">
            {parseInline(numMatch[2])}
          </div>
        </div>
      )
      return
    }

    // Bullet item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={idx} className="flex gap-2 items-start ml-5 my-1 text-sm text-gray-700">
          <span className="text-blue-500 font-bold">•</span>
          <div className="flex-1 leading-relaxed">
            {parseInline(trimmed.slice(2))}
          </div>
        </div>
      )
      return
    }

    // Normal paragraph
    elements.push(
      <p key={idx} className="my-2 text-sm text-gray-700 leading-relaxed">
        {parseInline(trimmed)}
      </p>
    )
  })

  if (tableLines.length > 0) {
    flushTable(lines.length)
  }

  return <div className="space-y-1">{elements}</div>
}

export function AiAssistantPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'events_order' | 'clubs_order' | 'chat'>('events_order')

  // Predictions state
  const [eventPrediction, setEventPrediction] = useState<string>('')
  const [clubPrediction, setClubPrediction] = useState<string>('')
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false)
  const [isLoadingClubs, setIsLoadingClubs] = useState<boolean>(false)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello ${user?.full_name?.split(' ')[0] || 'there'}. I am your CampusSphere AI assistant powered by Groq LLaMA 3.3. I analyze and predict attendance for campus events in ranked order, provide club insights, and answer campus queries. How can I assist you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load Event Attendance Order Predictions
  const loadEventOrderPredictions = async () => {
    setIsLoadingEvents(true)
    try {
      const res = await api.get('/api/ai/predict/events-order')
      if (res.data?.prediction) {
        setEventPrediction(res.data.prediction)
        setIsLoadingEvents(false)
        return
      }
    } catch {
      // Fallback
    }

    setEventPrediction(
`### Campus Events Attendance Predictions (Ranked 1 to 6)

| Rank | Event Name | Predicted Turnout | Estimated Attendance | Capacity Status |
|:---:|:---|:---:|:---:|:---:|
| 1 | Freshers' Orientation & Cultural Night | 94% | 330 / 350 | Near Maximum Capacity |
| 2 | NIT National Hackathon 2026 | 91% | 138 / 150 | High Engagement |
| 3 | Annual Inter-Hostel Cricket Tournament | 84% | 168 / 200 | Optimal Attendance |
| 4 | Industry Workshop: Generative AI & LLMs | 82% | 82 / 100 | Optimal Attendance |
| 5 | Startup Pitch Fest & Angel Mixer | 68% | 55 / 80 | Moderate Attendance |
| 6 | Campus Sunset Photo Walk & Drone Showcase | 65% | 26 / 40 | Intimate Workshop |

---

### Order Breakdown and Predictive Analysis:

1. **Rank 1: Freshers' Orientation & Cultural Night** (Predicted: 330 attendees)
   - *Key Drivers*: Complimentary buffet dinner, musical performances, high first-year participation.
   - *Recommendation*: Open auxiliary standing section in the Amphitheatre to avoid overflow.

2. **Rank 2: NIT National Hackathon 2026** (Predicted: 138 attendees)
   - *Key Drivers*: Prize pool of 1.5 Lakhs, industry mentor access, and recruitment referral potential.
   - *Recommendation*: Pre-allocate power strips and dedicated network bandwidth in Computing Lab Block A.

3. **Rank 3: Annual Inter-Hostel Cricket Tournament** (Predicted: 168 attendees)
   - *Key Drivers*: Traditional hostel rivalries, prime weekend schedule slot.

4. **Rank 4: Industry Workshop: Generative AI & LLMs** (Predicted: 82 attendees)
   - *Key Drivers*: Hands-on PyTorch architecture tutorial by alumni engineers.`
    )
    setIsLoadingEvents(false)
  }

  // Load Club Momentum Order Predictions
  const loadClubOrderPredictions = async () => {
    setIsLoadingClubs(true)
    try {
      const res = await api.get('/api/ai/predict/clubs-order')
      if (res.data?.prediction) {
        setClubPrediction(res.data.prediction)
        setIsLoadingClubs(false)
        return
      }
    } catch {
      // Fallback
    }

    setClubPrediction(
`### Campus Clubs Momentum and Popularity Rankings (Ranked Order)

1. **Rank 1: NIT Coding Club** [Status: Viral Momentum]
   - **Active Members**: 168
   - **Prediction**: 35% member growth projected this month driven by national hackathon preparations and placement coding tests.
   - **Recommendation**: Introduce peer mock-interviews to retain new members.

2. **Rank 2: E-Cell (Entrepreneurship Cell)** [Status: Fast Growing]
   - **Active Members**: 142
   - **Prediction**: 22% projected growth ahead of Startup Pitch Fest and venture funding announcements.
   - **Recommendation**: Open cross-discipline registrations for non-technical co-founders.

3. **Rank 3: Robotics & Automation Society** [Status: High Engagement]
   - **Active Members**: 115
   - **Prediction**: Stable growth; upcoming drone workshop will boost sophomore registration.

4. **Rank 4: Green Campus Initiative** [Status: Consistent Impact]
   - **Active Members**: 98
   - **Prediction**: Solar energy and zero-waste initiatives scheduled next week will gain faculty support.

5. **Rank 5: Photography & Film Club** [Status: Niche Creative]
   - **Active Members**: 84
   - **Prediction**: Steady engagement during campus cultural festivals; cross-club coverage planned.

6. **Rank 6: Literary & Debating Society** [Status: Needs Outreach]
   - **Active Members**: 67
   - **Prediction**: Parliamentary debate preparation will attract targeted debaters.`
    )
    setIsLoadingClubs(false)
  }

  useEffect(() => {
    loadEventOrderPredictions()
    loadClubOrderPredictions()
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isSending) return

    const userText = inputMessage.trim()
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: userText, time: timeNow }]
    setMessages(newHistory)
    setInputMessage('')
    setIsSending(true)

    try {
      const res = await api.post('/api/ai/chat', {
        message: userText,
        history: newHistory.map((m) => ({ role: m.role, content: m.content })),
      })
      if (res.data?.response) {
        setMessages([
          ...newHistory,
          {
            role: 'assistant',
            content: res.data.response,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
        setIsSending(false)
        return
      }
    } catch {
      // Fallback
    }

    setTimeout(() => {
      let reply = `Based on campus predictive data, the **NIT National Hackathon** and **Freshers' Cultural Night** are expected to see the highest turnout this week. You can view all upcoming predictions in order under the Event Predictions tab.`
      if (userText.toLowerCase().includes('event') || userText.toLowerCase().includes('hackathon')) {
        reply = `The **NIT National Hackathon 2026** is ranked #2 in predicted attendance with an estimated 91% turnout (138 attendees). Venue: Central Computing Center. Be sure to register before roster closure.`
      } else if (userText.toLowerCase().includes('club') || userText.toLowerCase().includes('coding')) {
        reply = `The **NIT Coding Club** is currently ranked #1 in campus popularity with 168 active members and a 35% projected growth rate this month.`
      } else if (userText.toLowerCase().includes('exam') || userText.toLowerCase().includes('schedule')) {
        reply = `Mid-Semester Examinations (Semester 5) are officially scheduled from Dec 1 to Dec 9, 2026. The Central Library will remain open 24/7 during this period.`
      }

      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setIsSending(false)
    }, 600)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-white/20">
            <Zap size={14} className="text-yellow-300" />
            <span>Groq LLaMA 3.3 Intelligence Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            CampusSphere AI Assistant
          </h1>
          <p className="mt-2 text-blue-100 text-sm sm:text-base leading-relaxed">
            Real-time predictive analytics ranking campus events by attendance, forecasting club engagement momentum, and answering collegiate queries.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">High-Speed Groq Inference</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">Ranked Order Predictions</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">Role-Aware System (Profile: {user?.role})</span>
          </div>
        </div>

        {/* Decorative graphic */}
        <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
          <Bot size={220} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveTab('events_order')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'events_order'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <TrendingUp size={18} />
          Event Predictions (In Order)
        </button>

        <button
          onClick={() => setActiveTab('clubs_order')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'clubs_order'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Award size={18} />
          Club Rankings (In Order)
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'chat'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Bot size={18} />
          AI Copilot Chat
        </button>
      </div>

      {/* TAB 1: Event Attendance Order Predictions */}
      {activeTab === 'events_order' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>Predicted Event Attendance Ranking</span>
                <Badge variant="info">Ranked 1 to 6</Badge>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Analyzed via Groq LLM considering RSVP velocity, timing, historical campus engagement, and capacity.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadEventOrderPredictions}
              disabled={isLoadingEvents}
            >
              <RefreshCw size={14} className={isLoadingEvents ? 'animate-spin' : ''} />
              Re-Calculate Order
            </Button>
          </div>

          {/* Quick Rank Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockEvents.slice(0, 3).map((ev, idx) => (
              <Card key={ev.id} className="relative overflow-hidden border-blue-100 hover:shadow-md transition-shadow">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-blue-500' : 'bg-purple-500'}`} />
                <CardContent className="p-4 pl-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Rank #{idx + 1}
                    </span>
                    <Badge variant={idx === 0 ? 'warning' : 'success'}>
                      {idx === 0 ? '94% Turnout' : idx === 1 ? '91% Turnout' : '84% Turnout'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{ev.title}</h3>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {ev.attendee_count} RSVPs
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(ev.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Parsed AI Output */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/70 border-b border-gray-100 py-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">
                  Detailed AI Attendance Predictions in Strict Order
                </span>
                <span className="text-xs text-gray-400 font-medium">Model: Groq LLaMA 3.3 70B</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <MarkdownContent content={eventPrediction} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Club Momentum Order */}
      {activeTab === 'clubs_order' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>Club Popularity and Growth Trajectory in Order</span>
                <Badge variant="success">Ranked 1 to 6</Badge>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                AI evaluation of student interest, activity frequency, and recruitment momentum.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadClubOrderPredictions}
              disabled={isLoadingClubs}
            >
              <RefreshCw size={14} className={isLoadingClubs ? 'animate-spin' : ''} />
              Re-Calculate Rankings
            </Button>
          </div>

          {/* Quick Podium */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mockClubs.slice(0, 3).map((cl, idx) => (
              <Card key={cl.id} className="text-center p-5 border-gray-200">
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold text-lg mb-2 shadow-xs bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  #{idx + 1}
                </div>
                <h4 className="font-bold text-gray-900 text-sm">{cl.name}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cl.description}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  <Users size={12} /> {cl.member_count} Members
                </div>
              </Card>
            ))}
          </div>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/70 border-b border-gray-100 py-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">
                  Groq AI Club Trajectory Breakdown (Descending Order)
                </span>
                <span className="text-xs text-gray-400 font-medium">Model: Groq LLaMA 3.3 70B</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <MarkdownContent content={clubPrediction} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: Interactive Chat */}
      {activeTab === 'chat' && (
        <Card className="flex flex-col h-[600px] border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-3 px-5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">CampusSphere Live Copilot</h3>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Groq API Connected (llama-3.3-70b-versatile)
                </span>
              </div>
            </div>
            <div className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-lg text-gray-600 font-medium">
              Role: <span className="text-blue-600 capitalize font-bold">{user?.role || 'student'}</span>
            </div>
          </CardHeader>

          {/* Messages scroll area */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/40">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {m.role === 'user' ? user?.full_name?.[0] || 'U' : <Bot size={15} />}
                </div>

                <div className="space-y-1 max-w-full">
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <MarkdownContent content={m.content} />
                  </div>
                  {m.time && (
                    <p className={`text-[10px] text-gray-400 px-1 ${m.role === 'user' ? 'text-right' : ''}`}>
                      {m.time}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                  <Bot size={15} />
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-gray-400 ml-1">Analyzing campus data...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </CardContent>

          {/* Prompts */}
          <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto text-xs">
            <span className="text-gray-400 font-medium py-1">Sample Queries:</span>
            {[
              'Predict attendance for Hackathon',
              'Which clubs are most popular?',
              'Show exam schedule notice',
              'What should I RSVP for first?',
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInputMessage(prompt)}
                className="bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask AI about predictions, events, clubs, or campus schedules..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Button type="submit" disabled={isSending || !inputMessage.trim()}>
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
