import { useEffect, useState } from 'react'
import axios from 'axios';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    axios.get('/api/movies').then((res) => {
      setMovies(res.data);
    }).catch((err) => {
      console.log(err);
    })
  })
  return (
    <>
      <h1>This is mini full stack app</h1>
      <p>MOVIES == {movies.length}</p>
      {
        movies.map((movie, index) => (
          <div key={movie.id}>
            <h1>{movie.title}</h1>
            <h2>{ movie.description}</h2>
          </div>
        ))
      }      
    </>
  )  
}

export default App
