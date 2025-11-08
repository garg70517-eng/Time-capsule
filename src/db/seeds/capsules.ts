import { db } from '@/db';
import { capsules, users } from '@/db/schema';

async function main() {
    // First, query the database to get actual user IDs
    const existingUsers = await db.select({ id: users.id, email: users.email }).from(users);
    
    // Find specific users by email
    const johnDoe = existingUsers.find(u => u.email === 'john.doe@example.com');
    const sarahSmith = existingUsers.find(u => u.email === 'sarah.smith@family.com');
    const drMichael = existingUsers.find(u => u.email === 'dr.michael.johnson@hospital.com');
    
    // Validate that users exist
    if (!johnDoe || !sarahSmith || !drMichael) {
        throw new Error('Required users not found in database. Please run users seeder first.');
    }
    
    // Calculate dates
    const now = new Date();
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const seventeenYearsFromNow = new Date(now.getTime() + 17 * 365 * 24 * 60 * 60 * 1000);
    const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
    const twoYearsFromNow = new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);
    const tenYearsFromNow = new Date(now.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);
    
    const fiveMonthsAgo = new Date(now.getTime() - 5 * 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const sampleCapsules = [
        {
            id: 'capsule_wedding_2024_001',
            userId: johnDoe.id,
            title: 'Our Wedding Day - 2024',
            description: 'Beautiful memories from our special day. Photos, videos, and heartfelt messages from family and friends.',
            unlockDate: oneYearFromNow.toISOString(),
            isLocked: true,
            isEmergencyAccessible: false,
            emergencyQrCode: null,
            theme: 'wedding',
            status: 'sealed',
            createdAt: fiveMonthsAgo.toISOString(),
            updatedAt: fiveMonthsAgo.toISOString(),
        },
        {
            id: 'capsule_birthday_emma_001',
            userId: johnDoe.id,
            title: "Emma's 1st Birthday",
            description: 'First year memories of our baby girl. Messages for her to read when she turns 18.',
            unlockDate: seventeenYearsFromNow.toISOString(),
            isLocked: true,
            isEmergencyAccessible: false,
            emergencyQrCode: null,
            theme: 'birthday',
            status: 'sealed',
            createdAt: threeMonthsAgo.toISOString(),
            updatedAt: threeMonthsAgo.toISOString(),
        },
        {
            id: 'capsule_health_records_001',
            userId: sarahSmith.id,
            title: 'Family Medical History',
            description: 'Important health documents and medical records for family reference.',
            unlockDate: sixMonthsFromNow.toISOString(),
            isLocked: true,
            isEmergencyAccessible: true,
            emergencyQrCode: 'EMG-HEALTH-2024-ABCD1234',
            theme: 'health',
            status: 'sealed',
            createdAt: twoMonthsAgo.toISOString(),
            updatedAt: twoMonthsAgo.toISOString(),
        },
        {
            id: 'capsule_vacation_hawaii_001',
            userId: sarahSmith.id,
            title: 'Summer Vacation 2024',
            description: 'Photos and videos from our amazing trip to Hawaii. Memories to cherish forever!',
            unlockDate: twoYearsFromNow.toISOString(),
            isLocked: true,
            isEmergencyAccessible: false,
            emergencyQrCode: null,
            theme: 'travel',
            status: 'sealed',
            createdAt: oneMonthAgo.toISOString(),
            updatedAt: oneMonthAgo.toISOString(),
        },
        {
            id: 'capsule_future_self_001',
            userId: drMichael.id,
            title: 'Letter to My Future Self',
            description: 'My goals, dreams, and aspirations. To be opened on my 50th birthday.',
            unlockDate: tenYearsFromNow.toISOString(),
            isLocked: true,
            isEmergencyAccessible: false,
            emergencyQrCode: null,
            theme: 'personal',
            status: 'draft',
            createdAt: twoWeeksAgo.toISOString(),
            updatedAt: twoWeeksAgo.toISOString(),
        },
    ];

    await db.insert(capsules).values(sampleCapsules);
    
    console.log('✅ Capsules seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});