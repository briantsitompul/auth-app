import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() })
})

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(401).json({ error: error.message })
    }

    res.json({
      message: 'Login successful',
      user: data.user,
      session: data.session,
    })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json({
      message: 'Registration successful. Check your email to confirm.',
      user: data.user,
    })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader) {
      const token = authHeader.split(' ')[1]
      await supabase.auth.admin.signOut(token)
    }
    res.json({ message: 'Logout successful' })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error) {
      return res.status(401).json({ error: error.message })
    }

    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`)
  console.log(`📝 Health check: http://localhost:${PORT}/health`)
  console.log(`🔐 Frontend connected to: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`)
})
