require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person');

morgan.token('body', req => {
  return JSON.stringify(req.body)
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name == 'CastError') {
    res.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (body.name === undefined || body.number === undefined) {
    return res.status(400).json({ error: 'content missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    res.json(savedPerson)
  })
})
  
app.get('/info', (req, res) => {
    const timeStamp = new Date;
    timeStamp.toUTCString()

    Person.find({}).then(persons => {
      res.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${timeStamp}</p>
      `)
    })
    
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})


app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
      .then(response => {
        res.status(204).end()
      })
      .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})