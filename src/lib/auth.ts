import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { db } from "@/db";
 
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {    
		enabled: true
	},
	plugins: [bearer()]
});

// Session validation helper - FIXED to properly read bearer token from request
export async function getCurrentUser(request: NextRequest) {
  try {
    // Create a Headers object from the NextRequest
    const headersList = new Headers();
    request.headers.forEach((value, key) => {
      headersList.set(key, value);
    });
    
    const session = await auth.api.getSession({ 
      headers: headersList
    });
    
    return session?.user || null;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}