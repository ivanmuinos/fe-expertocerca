import postgres from 'postgres';

const connectionString = 'postgresql://postgres.fqbzkljtlghztpkovkte:Jamesbond007.@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function addColumn() {
  console.log('🚀 Connecting to database...\n');

  const sql = postgres(connectionString);

  try {
    console.log('Adding main_portfolio_image column...');

    await sql`
      ALTER TABLE professional_profiles
      ADD COLUMN IF NOT EXISTS main_portfolio_image text
    `;

    console.log('✅ Column added successfully!\n');

    console.log('Creating index...');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_professional_profiles_main_portfolio_image
      ON professional_profiles(main_portfolio_image)
    `;

    console.log('✅ Index created successfully!\n');

    console.log('Updating existing records with first portfolio photo...');

    const result = await sql`
      UPDATE professional_profiles pp
      SET main_portfolio_image = (
        SELECT pf.image_url
        FROM portfolio_photos pf
        WHERE pf.professional_profile_id = pp.id
        ORDER BY pf.created_at ASC
        LIMIT 1
      )
      WHERE pp.main_portfolio_image IS NULL
    `;

    console.log(`✅ Updated ${result.count} profiles!\n`);

    console.log('✨ Migration completed successfully!');

    await sql.end();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    await sql.end();
    process.exit(1);
  }
}

addColumn();
