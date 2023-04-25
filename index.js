const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

let persons = [
          { 
            "name": "Arto Hellas", 
            "number": "040-123456",
            "id": 1
          },
          { 
            "name": "Ada Lovelace", 
            "number": "39-44-5323523",
            "id": 2
          },
          { 
            "name": "Dan Abramov", 
            "number": "12-43-234345",
            "id": 3
          },
          { 
            "name": "Mary Poppendieck", 
            "number": "39-23-6423122",
            "id": 4
          } 
]

morgan.token('body', req => {
  return JSON.stringify(req.body)
})

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (req, res) => {
    console.log(persons)
    res.json(persons)
})

app.get('/info', (req, res) => {
    const timeStamp = new Date;
    timeStamp.toUTCString()
    res.send(`
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${timeStamp}</p>
    `)

    res.send(timeStamp)
    
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    
    if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }

})

app.post('/api/persons', (req, res) => {
  const person = req.body
  const id = Math.floor(Math.random() * 10000)
  person.id = id
  let uniqueName = true
  persons.forEach(i => {
    if(i.name==person.name) {
      uniqueName = false
    }
  })
  if (!person.name || !person.number) {
    return res.status(400).json({error: 'content missing'})
  } else if (!uniqueName) {
    return res.status(400).json({error: 'person already exists'})
  } else {
    res.json(person)
  }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})