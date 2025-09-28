import { Client, ID, Query, Databases } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

// Initializing a new appwrite client
const client = new Client();
    client 
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

// Database functionality
const database = new Databases(client);



// function that counts the amount of searches places by the users
export const updateSearchCount = async (searchTerm, movie) => { 
// 1. Use Appwrite SDK to check if the search term exists in the database
    try {
        const results = await database.listDocuments(
            DATABASE_ID, 
            COLLECTION_ID,
            [
                // handle queries
            Query.equal('searchTerm', searchTerm)
            ]
        );
        

        // 2. If it does, update the count  
        if(results.documents.length > 0) {
            const doc = results.documents[0];

            await database.updateDocument(
                DATABASE_ID, 
                COLLECTION_ID, 
                doc.$id, 
                 {
                        // data
                    count: doc.count + 1
                 }
            );
            
            // 3. If it doesn't , create a new document with the search term and count as 1

        } else {
            await database.createDocument(
                DATABASE_ID, 
                COLLECTION_ID, 
                ID.unique(), 
                {
                        // data
                    searchTerm,
                    count: 1,
                    movie_id: movie.id,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
               }
           );
        }
       
    } catch (error) {
        console.log('Appwrite error:' ,error);
    }

};


// Trending movies fn
export const getTrendingMovies = async () => {
    try {
        const results = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,

            [
                //ARRAY FOR TRENDING MOVIES
                Query.limit(5),
                Query.orderDesc('count'),
            ])
            return results.documents;
    } catch (error) {
        console.error(error);
    }
}