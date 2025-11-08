import { db } from '@/db';
import { capsuleCollaborators, users, capsules } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('🔍 Starting capsule collaborators seeder...');

    // Query existing users
    console.log('📋 Fetching existing users...');
    const existingUsers = await db.select({
        id: users.id,
        email: users.email
    }).from(users).orderBy(users.email);

    console.log(`✓ Found ${existingUsers.length} users:`, existingUsers);

    if (existingUsers.length === 0) {
        console.error('❌ No users found in database. Please run users seeder first.');
        return;
    }

    // Query existing capsules
    console.log('📋 Fetching existing capsules...');
    const existingCapsules = await db.select({
        id: capsules.id,
        title: capsules.title
    }).from(capsules).orderBy(capsules.title);

    console.log(`✓ Found ${existingCapsules.length} capsules:`, existingCapsules);

    if (existingCapsules.length === 0) {
        console.error('❌ No capsules found in database. Please run capsules seeder first.');
        return;
    }

    // Find specific users
    const johnDoe = existingUsers.find(u => u.email === 'john.doe@example.com');
    const sarahSmith = existingUsers.find(u => u.email === 'sarah.smith@family.com');
    const drMichael = existingUsers.find(u => u.email === 'dr.michael.johnson@hospital.com');

    console.log('👤 User IDs found:');
    console.log('  John Doe:', johnDoe?.id || 'NOT FOUND');
    console.log('  Sarah Smith:', sarahSmith?.id || 'NOT FOUND');
    console.log('  Dr. Michael:', drMichael?.id || 'NOT FOUND');

    // Find specific capsules
    const weddingCapsule = existingCapsules.find(c => c.title === 'Our Wedding Day - 2024');
    const vacationCapsule = existingCapsules.find(c => c.title === 'Summer Vacation 2024');
    const healthCapsule = existingCapsules.find(c => c.title === 'Family Medical History');
    const birthdayCapsule = existingCapsules.find(c => c.title === "Emma's 1st Birthday");

    console.log('📦 Capsule IDs found:');
    console.log('  Wedding:', weddingCapsule?.id || 'NOT FOUND');
    console.log('  Vacation:', vacationCapsule?.id || 'NOT FOUND');
    console.log('  Health:', healthCapsule?.id || 'NOT FOUND');
    console.log('  Birthday:', birthdayCapsule?.id || 'NOT FOUND');

    // Verify all required entities exist
    if (!johnDoe || !sarahSmith || !drMichael) {
        console.error('❌ Required users not found. Missing:', {
            johnDoe: !johnDoe,
            sarahSmith: !sarahSmith,
            drMichael: !drMichael
        });
        return;
    }

    if (!weddingCapsule || !vacationCapsule || !healthCapsule || !birthdayCapsule) {
        console.error('❌ Required capsules not found. Missing:', {
            wedding: !weddingCapsule,
            vacation: !vacationCapsule,
            health: !healthCapsule,
            birthday: !birthdayCapsule
        });
        return;
    }

    // Calculate dates
    const now = new Date();
    const fiveMonthsAgo = new Date(now.getTime() - (5 * 30 * 24 * 60 * 60 * 1000));
    const fourMonthsAgo = new Date(now.getTime() - (4 * 30 * 24 * 60 * 60 * 1000));
    const twoMonthsAgo = new Date(now.getTime() - (2 * 30 * 24 * 60 * 60 * 1000));
    const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const threeWeeksAgo = new Date(now.getTime() - (21 * 24 * 60 * 60 * 1000));
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Prepare collaborator data
    const sampleCollaborators = [
        {
            id: 'collab_sarah_wedding_001',
            capsuleId: weddingCapsule.id,
            userId: sarahSmith.id,
            permission: 'view',
            invitedBy: johnDoe.id,
            acceptedAt: fourMonthsAgo.toISOString(),
            createdAt: fiveMonthsAgo.toISOString(),
        },
        {
            id: 'collab_john_vacation_002',
            capsuleId: vacationCapsule.id,
            userId: johnDoe.id,
            permission: 'edit',
            invitedBy: sarahSmith.id,
            acceptedAt: threeWeeksAgo.toISOString(),
            createdAt: oneMonthAgo.toISOString(),
        },
        {
            id: 'collab_doctor_health_003',
            capsuleId: healthCapsule.id,
            userId: drMichael.id,
            permission: 'admin',
            invitedBy: sarahSmith.id,
            acceptedAt: oneMonthAgo.toISOString(),
            createdAt: twoMonthsAgo.toISOString(),
        },
        {
            id: 'collab_doctor_birthday_004',
            capsuleId: birthdayCapsule.id,
            userId: drMichael.id,
            permission: 'view',
            invitedBy: johnDoe.id,
            acceptedAt: null,
            createdAt: oneWeekAgo.toISOString(),
        }
    ];

    console.log('\n📝 Prepared collaborator data:');
    sampleCollaborators.forEach((collab, index) => {
        console.log(`  ${index + 1}. ${collab.id}`);
        console.log(`     Capsule: ${collab.capsuleId}`);
        console.log(`     User: ${collab.userId}`);
        console.log(`     Permission: ${collab.permission}`);
        console.log(`     Invited By: ${collab.invitedBy}`);
        console.log(`     Accepted: ${collab.acceptedAt ? 'Yes' : 'Pending'}`);
    });

    // Insert data
    console.log('\n💾 Inserting capsule collaborators...');
    try {
        await db.insert(capsuleCollaborators).values(sampleCollaborators);
        console.log('✓ Collaborators inserted successfully');
    } catch (error) {
        console.error('❌ Failed to insert collaborators:', error);
        throw error;
    }

    // Verify insertion
    console.log('\n🔍 Verifying inserted data...');
    const insertedCollaborators = await db.select().from(capsuleCollaborators);
    console.log(`✓ Total collaborators in database: ${insertedCollaborators.length}`);

    insertedCollaborators.forEach((collab, index) => {
        console.log(`  ${index + 1}. ${collab.id} - Permission: ${collab.permission}, Accepted: ${collab.acceptedAt ? 'Yes' : 'Pending'}`);
    });

    console.log('\n✅ Capsule collaborators seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
});