import { supabaseAdmin } from './supabase';

/**
 * Creates required database functions for schema validation
 */
export async function createRequiredFunctions() {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available');
    return false;
  }
  
  try {
    // Create a function to list tables
    const { error: fnTablesError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION get_tables()
        RETURNS TABLE (name text) LANGUAGE plpgsql AS $$
        BEGIN
          RETURN QUERY SELECT tablename::text FROM pg_tables 
          WHERE schemaname = 'public';
        END; $$;
      `
    });
    
    if (fnTablesError) {
      console.error('Error creating get_tables function:', fnTablesError);
      return false;
    }
    
    // Create a function to list columns in a table
    const { error: fnColumnsError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION get_columns(table_name text)
        RETURNS TABLE (name text, data_type text) LANGUAGE plpgsql AS $$
        BEGIN
          RETURN QUERY SELECT column_name::text, data_type::text 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1;
        END; $$;
      `
    });
    
    if (fnColumnsError) {
      console.error('Error creating get_columns function:', fnColumnsError);
      return false;
    }

    // Create function to execute SQL (if it doesn't already exist)
    const { error: fnExecuteSqlError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION execute_sql(sql text)
        RETURNS void LANGUAGE plpgsql AS $$
        BEGIN
          EXECUTE sql;
        END; $$;
      `
    });
    
    if (fnExecuteSqlError) {
      // If the function doesn't exist, we need to create it directly using a different approach
      // This is a catch-22 situation, since we need execute_sql to create it
      console.error('Error creating execute_sql function. This may be expected if it doesn\'t exist yet.');
      
      // Try creating it using a direct SQL query if available
      try {
        await supabaseAdmin.from('_sql').select('*').eq('query', `
          CREATE OR REPLACE FUNCTION execute_sql(sql text)
          RETURNS void LANGUAGE plpgsql AS $$
          BEGIN
            EXECUTE sql;
          END; $$;
        `);
      } catch (directError) {
        console.error('Error creating execute_sql function directly:', directError);
        // Return true anyway, since other methods may work
      }
    }
    
    // Create a function to create profiles table
    const { error: fnCreateProfilesError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION create_profiles_table()
        RETURNS void LANGUAGE plpgsql AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID,
            username TEXT UNIQUE,
            display_name TEXT,
            email TEXT,
            bio TEXT,
            avatar_url TEXT,
            experience_level TEXT DEFAULT 'beginner',
            main_game TEXT,
            country TEXT,
            state TEXT,
            city TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );

          -- Enable Row Level Security
          ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

          -- Create policies for Row Level Security
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policy WHERE policyname = 'Allow users to read all profiles'
            ) THEN
              CREATE POLICY "Allow users to read all profiles" 
              ON profiles FOR SELECT 
              USING (true);
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM pg_policy WHERE policyname = 'Allow users to update own profile'
            ) THEN
              CREATE POLICY "Allow users to update own profile" 
              ON profiles FOR UPDATE 
              USING (auth.uid() = user_id)
              WITH CHECK (auth.uid() = user_id);
            END IF;
          END $$;
        END; $$;
      `
    });
    
    if (fnCreateProfilesError) {
      console.error('Error creating create_profiles_table function:', fnCreateProfilesError);
      return false;
    }
    
    // Create a function to create tournaments table
    const { error: fnCreateTournamentsError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION create_tournaments_table()
        RETURNS void LANGUAGE plpgsql AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS tournaments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            game TEXT NOT NULL,
            format TEXT,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            max_teams INTEGER NOT NULL,
            current_teams INTEGER DEFAULT 0,
            registration_fee INTEGER DEFAULT 0,
            prize_pool TEXT NOT NULL,
            status TEXT DEFAULT 'upcoming',
            location TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );

          -- Enable Row Level Security
          ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

          -- Create policies for Row Level Security
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policy WHERE policyname = 'Allow users to read all tournaments'
            ) THEN
              CREATE POLICY "Allow users to read all tournaments" 
              ON tournaments FOR SELECT 
              USING (true);
            END IF;
          END $$;
        END; $$;
      `
    });
    
    if (fnCreateTournamentsError) {
      console.error('Error creating create_tournaments_table function:', fnCreateTournamentsError);
      return false;
    }
    
    // Create a function to create tournament_registrations table
    const { error: fnCreateRegistrationsError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION create_tournament_registrations_table()
        RETURNS void LANGUAGE plpgsql AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS tournament_registrations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
            user_id UUID,
            player_id UUID,
            team_name TEXT NOT NULL,
            team_members JSONB DEFAULT '[]'::jsonb,
            status TEXT DEFAULT 'registered',
            payment_status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );

          -- Enable Row Level Security
          ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

          -- Create policies for Row Level Security
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policy WHERE policyname = 'Allow users to read all registrations'
            ) THEN
              CREATE POLICY "Allow users to read all registrations" 
              ON tournament_registrations FOR SELECT 
              USING (true);
            END IF;

            IF NOT EXISTS (
              SELECT 1 FROM pg_policy WHERE policyname = 'Allow users to update own registrations'
            ) THEN
              CREATE POLICY "Allow users to update own registrations" 
              ON tournament_registrations FOR UPDATE 
              USING (auth.uid() = user_id)
              WITH CHECK (auth.uid() = user_id);
            END IF;
          END $$;
        END; $$;
      `
    });
    
    if (fnCreateRegistrationsError) {
      console.error('Error creating create_tournament_registrations_table function:', fnCreateRegistrationsError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating required functions:', error);
    return false;
  }
}

/**
 * Creates or updates the profiles table to ensure it has the correct schema
 */
export async function ensureProfilesTable() {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available');
    return false;
  }
  
  try {
    // Make sure required functions exist
    await createRequiredFunctions();
    
    // Check if the profiles table exists
    const { data: tables, error: tablesError } = await supabaseAdmin.rpc('get_tables');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return false;
    }
    
    const profilesTableExists = tables.some((table: { name: string }) => table.name === 'profiles');
    
    if (!profilesTableExists) {
      console.log('Profiles table does not exist, creating one...');
      // In a real project, you would use migration scripts for this instead of raw SQL
      
      // This is just a placeholder example - in a real project you should use proper migrations
      const { error: createError } = await supabaseAdmin.rpc('create_profiles_table');
      
      if (createError) {
        console.error('Error creating profiles table:', createError);
        return false;
      }
      
      console.log('Created profiles table');
    }
    
    // Verify required columns
    const requiredColumns = [
      'id',
      'user_id',
      'username',
      'display_name',
      'email',
      'bio',
      'avatar_url',
      'experience_level',
      'main_game',
      'country',
      'state',
      'city',
      'created_at',
      'updated_at'
    ];
    
    const { data: columns, error: columnsError } = await supabaseAdmin.rpc(
      'get_columns', 
      { table_name: 'profiles' }
    );
    
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      return false;
    }
    
    const existingColumns = columns.map((col: { name: string }) => col.name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`Missing columns in profiles table: ${missingColumns.join(', ')}`);
      // In a real project, you would add these columns via migration scripts
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring profiles table exists:', error);
    return false;
  }
}

/**
 * Creates or updates the tournaments table to ensure it has the correct schema
 */
export async function ensureTournamentsTable() {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available');
    return false;
  }
  
  try {
    // Check if the tournaments table exists
    const { data: tables, error: tablesError } = await supabaseAdmin.rpc('get_tables');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return false;
    }
    
    const tournamentsTableExists = tables.some((table: { name: string }) => table.name === 'tournaments');
    
    if (!tournamentsTableExists) {
      console.log('Tournaments table does not exist, creating one...');
      // In a real project, you would use migration scripts for this
      
      // This is just a placeholder example
      const { error: createError } = await supabaseAdmin.rpc('create_tournaments_table');
      
      if (createError) {
        console.error('Error creating tournaments table:', createError);
        return false;
      }
      
      console.log('Created tournaments table');
    }
    
    // Verify required columns
    const requiredColumns = [
      'id',
      'name',
      'description',
      'game',
      'format',
      'start_date',
      'end_date',
      'max_teams',
      'current_teams',
      'registration_fee',
      'prize_pool',
      'status',
      'location',
      'created_at',
      'updated_at'
    ];
    
    const { data: columns, error: columnsError } = await supabaseAdmin.rpc(
      'get_columns', 
      { table_name: 'tournaments' }
    );
    
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      return false;
    }
    
    const existingColumns = columns.map((col: { name: string }) => col.name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`Missing columns in tournaments table: ${missingColumns.join(', ')}`);
      // In a real project, you would add these columns via migration scripts
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring tournaments table exists:', error);
    return false;
  }
}

/**
 * Creates or updates the tournament_registrations table
 */
export async function ensureTournamentRegistrationsTable() {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available');
    return false;
  }
  
  try {
    // Check if the tournament_registrations table exists
    const { data: tables, error: tablesError } = await supabaseAdmin.rpc('get_tables');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return false;
    }
    
    const registrationsTableExists = tables.some((table: { name: string }) => table.name === 'tournament_registrations');
    
    if (!registrationsTableExists) {
      console.log('Tournament registrations table does not exist, creating one...');
      // In a real project, you would use migration scripts for this
      
      // This is just a placeholder example
      const { error: createError } = await supabaseAdmin.rpc('create_tournament_registrations_table');
      
      if (createError) {
        console.error('Error creating tournament_registrations table:', createError);
        return false;
      }
      
      console.log('Created tournament_registrations table');
    }
    
    // Verify required columns
    const requiredColumns = [
      'id',
      'tournament_id',
      'user_id',
      'player_id',
      'team_name',
      'team_members',
      'status',
      'payment_status',
      'created_at',
      'updated_at'
    ];
    
    const { data: columns, error: columnsError } = await supabaseAdmin.rpc(
      'get_columns', 
      { table_name: 'tournament_registrations' }
    );
    
    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      return false;
    }
    
    const existingColumns = columns.map((col: { name: string }) => col.name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`Missing columns in tournament_registrations table: ${missingColumns.join(', ')}`);
      // In a real project, you would add these columns via migration scripts
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring tournament_registrations table exists:', error);
    return false;
  }
}

/**
 * Ensures all required tables exist with the proper schema
 */
export async function ensureSupabaseSchema() {
  console.log('Checking Supabase schema...');
  
  const profilesResult = await ensureProfilesTable();
  const tournamentsResult = await ensureTournamentsTable();
  const registrationsResult = await ensureTournamentRegistrationsTable();
  
  return {
    success: profilesResult && tournamentsResult && registrationsResult,
    profiles: profilesResult,
    tournaments: tournamentsResult,
    registrations: registrationsResult
  };
} 
 
 