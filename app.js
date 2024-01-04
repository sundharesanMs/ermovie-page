const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

// all movies in the table - 1
function converting(eachObj) {
  return {movieName: eachObj.movie_name}
}
app.get('/movies/', async (request, response) => {
  const getMovies = `SELECT movie_name FROM movie `

  const movieArray = await db.all(getMovies)
  response.send(movieArray.map(eachObj => converting(eachObj)))
})

// add movie tag(Second) - 2
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMoviesQuery = `INSERT INTO movie (director_id, movie_name, lead_actor)
  VALUES 
  (
    '${directorId}', 
    '${movieName}', 
    '${leadActor}');`
  const dbResponse = await db.run(addMoviesQuery)
  response.send('movie sucessfully added')
})

// ((Returns a movie based on the movie ID third tag)) -3

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMoviesQuery = `select 
  movie_id as movieId, 
  director_id as directorId, 
  movie_name as movieName, 
  lead_actor as leadactor
  from movie where movie_id = ${movieId}; `
  const movie = await db.get(getMoviesQuery)
  response.send(movie)
})

// fourth tag - Updates the details of a movie in the movie table based on the movie ID
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, leadActor, movieName} = movieDetails
  const updateMovie = `UPDATE movie
    SET
     director_id = ${directorId},
     movie_name = '${movieName}',
     lead_actor = '${leadActor}'
     WHERE movie_id = ${movieId};`
  await db.run(updateMovie)
  response.send('movie details updated successfully')
})
module.exports = app
