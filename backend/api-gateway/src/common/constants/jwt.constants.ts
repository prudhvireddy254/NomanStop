if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. Add it to your .env file.');
}

export const JWT_SECRET: string = process.env.JWT_SECRET;
