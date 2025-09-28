import { useEffect, useState } from 'react'
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
import Search from './components/Search.jsx'
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers:  {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`

  }

}

const 
App = () => {

const [searchTerm, setSearchTerm] = useState('');
const [errorMessage, setErrorMessage] = useState('');
const [movieList, setMovieList] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
const [trendingMovies, setTrendingMovies] = useState([]);





// debounce is used for search optimizition
useDebounce(
  // Debounce function(callback fn )
  () => setDebouncedSearchTerm(searchTerm),
  // number of milli seconds for which the search term waits before execution
  500,
  // deps
  [searchTerm]
);




// Fetch movies fn
const fetchMovies = async (query = '') => {
  setIsLoading(true);
  setErrorMessage('');

  try {
    const endpoint = query 
    ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` 
    : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
    const response = await fetch(endpoint, API_OPTIONS);
   
    if(!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    // if responce is ok
    const data = await response.json();

    if(data.response === 'false')  {
      setErrorMessage(data.Error || 'Failed to fetch movie');
      setMovieList([]);
      return;
    }
    //if data.response === true then
    setMovieList(data.results || [] );

    // Updating user search
    if(query && data.results.length > 0 ) {
      await updateSearchCount(query, data.results[0]);
    }
    

  } catch (error) {
    // catch and display error
    console.error(`Error fetching movies: ${error}`)
    setErrorMessage('Error fetching movies. Please try again later.')
  } finally{
    setIsLoading(false);
  }
}

// Trending movies fn
const loadTrendingMovies = async() => {

    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.log(`Error fetching trending movies: ${error}`)
      
    }
  };


useEffect( 
  // effect function(call back fn):
  () => {
  fetchMovies(debouncedSearchTerm);
},
// deps:
[debouncedSearchTerm]);

useEffect(
  () => {
    loadTrendingMovies();
  },  [])


  return (
   <main>
    <div className='pattern' />
      <div className='wrapper'>


        {/* header */}
      <header>  
        <img src="./hero-img.png" alt="Hero Banner" />
        <h1>Find <span className='text-gradient'>Movies</span>  You'll Enjoy Without A Hassle</h1>
        <Search  searchTerm = {searchTerm} setSearchTerm = {setSearchTerm} />
        
      </header>


      {/* Trending movies */}
      {trendingMovies.length > 0 && (
        <section className='trending'>
          <h2 className=''>Trending Movies</h2>
          
          <ul>
            {trendingMovies.map((movie, index) => ( 
              <li key={movie.$id}>
                <p>{index + 1}</p>
                <img src={movie.poster_url} alt={movie.title} />
              </li>
            ))}
          </ul>
        </section>
      )}



      {/* section */}
      <section className='all-movies'>
        <h2 className=' '>Popular</h2>
        {isLoading ? (
         <Spinner />
        ) : errorMessage ? (
          <p className='text-red-500'>{errorMessage}</p>
        ) : (
          <ul>
            {movieList.map((movie) => (
              // used brackets to avoid the return statement
                <MovieCard key={movie.id} movie = {movie}  />
            )

            )}
          </ul>
        )
        }
      </section>

    </div>
   </main>
  )
}




export default App;
