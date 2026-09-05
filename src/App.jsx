import { useState, useRef, useEffect } from 'react'
import resumeData from '../sample/resume.json'
import chatLogs from '../sample/chatslogs.json'
import './App.css'

const PARSE_API_URL = 'https://myjobbuddyengine.onrender.com/parse'
const PARSE_API_PATH = '/parse'

function transformResumeData(data) {
  return data.map(item => {
    const content = item.resume_content
    const id = `resume-${item.resume_id}`

    const textParts = []
    
    if (content.name) {
      textParts.push(content.name.toUpperCase())
    }
    
    if (content.summary) {
      textParts.push(`SUMMARY\n${content.summary}`)
    }
    
    if (content.experience && content.experience.length > 0) {
      textParts.push(`EXPERIENCE\n${content.experience.join('\n')}`)
    }
    
    if (content.projects && content.projects.length > 0) {
      textParts.push(`PROJECTS\n${content.projects.join('\n')}`)
    }
    
    if (content.skills && content.skills.length > 0) {
      textParts.push(`SKILLS\n${content.skills.join(', ')}`)
    }
    
    if (content.education && content.education.length > 0) {
      textParts.push(`EDUCATION\n${content.education.join('\n')}`)
    }
    
    if (content.certifications && content.certifications.length > 0) {
      textParts.push(`CERTIFICATIONS\n${content.certifications.join('\n')}`)
    }

    return {
      id,
      name: content.name || `Resume ${item.resume_id}`,
      content: textParts.join('\n\n'),
      type: 'text'
    }
  })
}

const SAMPLE_RESUMES = transformResumeData(resumeData)

const AI_API_URL = 'https://llmping.onrender.com/chat'
const AI_API_PATH = AI_API_URL ? new URL(AI_API_URL).pathname : '/chat'

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [resumes, setResumes] = useState(SAMPLE_RESUMES)
  const [activeResumeId, setActiveResumeId] = useState(SAMPLE_RESUMES[0].id)
  const [messagesByResume, setMessagesByResume] = useState(chatLogs)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const activeResume = resumes.find(r => r.id === activeResumeId)
  const currentMessages = messagesByResume[activeResumeId] || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages])

  const getActiveMessages = () => messagesByResume[activeResumeId] || []

  const setActiveMessages = (msgsOrUpdater) => {
    setMessagesByResume(prev => {
      const currentMessages = prev[activeResumeId] || []
      const msgs = typeof msgsOrUpdater === 'function'
        ? msgsOrUpdater(currentMessages)
        : msgsOrUpdater

      return { ...prev, [activeResumeId]: msgs }
    })
  }

  const handleNewChat = () => {
    setActiveMessages([])
    setMobileMenuOpen(false)
  }

  const buildSystemPrompt = (resume) => {
    return `You are an interview preparation coach. The user has uploaded their resume and wants help preparing for interviews. Use the resume content below as context.

Resume:
${resume.content}

Guidelines:
- Be helpful, encouraging, and practical
- Give specific interview questions based on their resume
- Explain what to highlight and what to avoid
- Provide do's and don'ts for interviews
- Keep responses concise but comprehensive
- Use markdown formatting for readability`
  }

  const callLLM = async (messages, resume) => {
    if (!AI_API_URL) {
      return '[AI API unavailable] The live AI service could not be reached.'
    }

    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    const baseQuery = lastUserMessage ? lastUserMessage.content : 'Hello'

    const resumeContext = resume ? `\n\nContext from selected resume:\n${resume.content}` : ''
    const query = `${baseQuery}${resumeContext}`

    const payload = {
      query: query
    }

    const headers = {
      'Content-Type': 'application/json'
    }
    const isDev = import.meta.env.DEV
    const requestUrl = isDev ? AI_API_PATH : AI_API_URL

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('LLM API error:', response.status, errorText)
        return `[AI API error ${response.status}] ${errorText.slice(0, 200)}`
      }

      const data = await response.json()
      const answer = data?.answer
      if (!answer) {
        return '[AI API error] Unexpected response format.'
      }
      return answer
    } catch (error) {
      console.error('LLM API request failed:', error)
      const message = error?.message || 'Unknown error'
      const isCors = message.includes('Failed to fetch') || message.includes('NetworkError')
      const hint = isCors
        ? ' This looks like a CORS/network issue. Make sure the AI API is running and reachable from this origin.'
        : ''
      return `[AI request failed] ${message}.${hint}`
    }
  }

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      resumeId: activeResumeId,
      timestamp: new Date().toISOString()
    }

    const newMessages = [...getActiveMessages(), userMessage]
    setActiveMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const history = newMessages.slice(-10)
      const aiContent = await callLLM(history, activeResume)

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiContent,
        resumeId: activeResumeId,
        timestamp: new Date().toISOString()
      }
      setActiveMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI response error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `[Error] ${error.message}`,
        resumeId: activeResumeId,
        timestamp: new Date().toISOString()
      }
      setActiveMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isPdf = file.type === 'application/pdf'
    const isTxt = file.type === 'text/plain'
    
    if (!isPdf && !isTxt) {
      alert('Please upload a PDF or TXT file')
      return
    }

    const newResumeId = `resume-${Date.now()}`
    const fileName = file.name.replace(/\.(pdf|txt)$/i, '')
    
    const newResume = {
      id: newResumeId,
      name: fileName,
      content: '',
      type: file.type === 'application/pdf' ? 'pdf' : 'text'
    }

    const parsingMessage = {
      id: Date.now(),
      role: 'assistant',
      content: `Uploading and parsing "${fileName}"... This may take a moment.`,
      resumeId: newResumeId,
      timestamp: new Date().toISOString()
    }

    setResumes(prev => [...prev, newResume])
    setMessagesByResume(prev => ({ ...prev, [newResumeId]: [parsingMessage] }))
    setActiveResumeId(newResumeId)
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const requestUrl = import.meta.env.DEV ? PARSE_API_PATH : PARSE_API_URL
      const response = await fetch(requestUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Parse failed: ${response.status}`)
      }

      const data = await response.json()
      const parsedContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2)

      setResumes(prev => prev.map(r => r.id === newResumeId ? { ...r, content: parsedContent } : r))

      const successMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Successfully parsed "${fileName}"! The resume has been loaded and is ready for interview prep. You can ask me anything about this resume - experience, skills, interview questions, do's and don'ts, and more.`,
        resumeId: newResumeId,
        timestamp: new Date().toISOString()
      }
      setMessagesByResume(prev => ({ ...prev, [newResumeId]: [parsingMessage, successMessage] }))
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Failed to parse "${fileName}": ${error.message}. Please try again.`,
        resumeId: newResumeId,
        timestamp: new Date().toISOString()
      }
      setMessagesByResume(prev => ({ ...prev, [newResumeId]: [parsingMessage, errorMessage] }))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(prev => prev + transcript)
    }

    recognition.onerror = () => {
      // Silently handle errors
    }

    recognition.start()
  }

  return (
    <div className="app">
      <div 
        className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">JB</div>
            myJOBbuddy
          </div>
          <div className="sidebar-actions-row">
            <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
            <button className="new-chat-btn" onClick={handleNewChat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Chat
            </button>
          </div>
        </div>

        <div className="resume-section">
          <div className="resume-section-title">Resumes</div>
          <div className="resume-tabs">
            {resumes.map(resume => (
              <button
                key={resume.id}
                className={`resume-tab ${activeResumeId === resume.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveResumeId(resume.id)
                  setMobileMenuOpen(false)
                }}
              >
                <svg className="resume-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                {resume.name}
              </button>
            ))}
          </div>

          <button 
            className="upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Resume
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileUpload}
            className="file-input"
          />
        </div>
      </aside>

      <main className="main">
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="mobile-menu-btn icon-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <div className="chat-header-title">Interview Prep Chat</div>
              <div className="chat-header-resume">
                {activeResume ? `Preparing: ${activeResume.name}` : 'Select a resume to begin'}
              </div>
            </div>
          </div>
          <button className="new-chat-header-btn" onClick={handleNewChat}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Chat
          </button>
        </div>

        {currentMessages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="empty-state-title">Start your interview prep</div>
            <div className="empty-state-text">
              Ask questions about the selected resume. I'll help you prepare for interviews with questions, do's and don'ts, and targeted advice.
            </div>
          </div>
        ) : (
          <div className="messages">
            {currentMessages.map(msg => (
              <div key={msg.id} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>
                <div className="message-content">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message ai">
                <div className="message-avatar">AI</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="input-area">
          <div className="input-container">
            <div className="input-wrapper">
              <div className="input-actions-left">
                <button 
                  className="icon-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload resume"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
              </div>

              <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder="Ask about interview prep..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={uploading}
              />

              <div className="input-actions-right">
                <button 
                  className="icon-btn"
                  onClick={handleVoiceInput}
                  title="Voice input"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
                <button 
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || loading || uploading}
                  title="Send message"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="input-hint">
              {activeResume ? `Preparing interview for: ${activeResume.name}` : 'Upload or select a resume to start chatting'}
            </div>
            <div className="service-notice">
              Runs on free Render hosting and a free AI API, so responses may take a little longer.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
