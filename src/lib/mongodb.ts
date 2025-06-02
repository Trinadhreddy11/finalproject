// This file is meant to be used server-side only
export async function connectDB() {
  throw new Error('MongoDB operations can only be performed server-side. Please use an API endpoint to interact with the database.');
}

export async function closeDB() {
  throw new Error('MongoDB operations can only be performed server-side. Please use an API endpoint to interact with the database.');
}