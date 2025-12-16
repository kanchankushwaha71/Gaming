import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextAuthOptions } from 'next-auth';
import { supabase, supabaseAdmin } from './supabase';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔐 Attempting login for: ${credentials.email}`);
          }
          
          // Method 1: Try Supabase Auth first (for users with auth accounts)
          try {
            if (process.env.NODE_ENV === 'development') {
              console.log('📝 Trying Supabase Auth login...');
            }
            const { data, error } = await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            });
            
            if (!error && data.user) {
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ Supabase Auth login successful');
              }
              
              // Get profile data
              const { data: playerProfileData } = await supabase
                .from('player_profiles')
                .select('*')
                .eq('user_id', data.user.id)
                .single();
              
              if (playerProfileData) {
                if (process.env.NODE_ENV === 'development') {
                  console.log('✅ Found profile for Supabase Auth user');
                }
                      return {
                        id: data.user.id,
                        name: playerProfileData.display_name || playerProfileData.username || data.user.email?.split('@')[0] || 'User',
                        email: data.user.email,
                        role: playerProfileData.role || 'member',
                        image: playerProfileData.avatar_url || ''
                      };
              }
            } else {
              if (process.env.NODE_ENV === 'development') {
                console.log('🔄 Supabase Auth failed, trying fallback authentication...');
              }
            }
          } catch (authError) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔄 Supabase Auth error, trying fallback authentication...');
            }
          }
          
          // Method 2: Try fallback authentication (for users registered with fallback)
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Checking fallback user authentication...');
          }
          
          // Get user auth record
          const { data: userAuthData, error: userAuthError } = await supabaseAdmin
            .from('user_auth')
            .select('*')
            .eq('email', credentials.email)
            .single();
          
          if (userAuthError || !userAuthData) {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ No authentication record found for this email');
            }
            return null;
          }
          
          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, userAuthData.password_hash);
          
          if (!isPasswordValid) {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ Invalid password for fallback user');
            }
            return null;
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Fallback authentication successful');
          }
          
          // Get profile data using user_id
          const { data: playerProfileData, error: profileError } = await supabaseAdmin
            .from('player_profiles')
            .select('*')
            .eq('user_id', userAuthData.user_id)
            .single();
          
          if (profileError || !playerProfileData) {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ No profile found for fallback user');
            }
            return null;
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Found profile for fallback user');
          }
          return {
            id: userAuthData.user_id,
            name: playerProfileData.display_name || playerProfileData.username || credentials.email.split('@')[0] || 'User',
            email: credentials.email,
            role: playerProfileData.role || 'member',
            image: playerProfileData.avatar_url || ''
          };
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Error in credential authorization:', error);
          }
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role || 'member';
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | undefined;
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For Google OAuth, check if user has completed registration
      if (account?.provider === 'google') {
        try {
          // Check if user exists in our profile tables
          const { data: playerProfile } = await supabase
            .from('player_profiles')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (!playerProfile) {
            // User hasn't completed registration, redirect to registration
            if (process.env.NODE_ENV === 'development') {
              console.log('Google user needs to complete registration');
            }
            return '/register?oauth=google&email=' + encodeURIComponent(user.email || '');
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error checking Google user profile:', error);
          }
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Custom error page
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}; 