import { db } from '@/db';
import { capsuleActivities, users, capsules } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // Query users to get actual IDs
    const allUsers = await db.select({ id: users.id, email: users.email }).from(users);
    const johnDoe = allUsers.find(u => u.email === 'john.doe@example.com');
    const sarahSmith = allUsers.find(u => u.email === 'sarah.smith@family.com');
    const drMichael = allUsers.find(u => u.email === 'dr.michael.johnson@hospital.com');

    if (!johnDoe || !sarahSmith || !drMichael) {
        throw new Error('Required users not found in database');
    }

    // Query capsules to get actual IDs
    const allCapsules = await db.select({ id: capsules.id, title: capsules.title }).from(capsules);
    const weddingCapsule = allCapsules.find(c => c.title === 'Our Wedding Day - 2024');
    const birthdayCapsule = allCapsules.find(c => c.title === "Emma's 1st Birthday");
    const healthCapsule = allCapsules.find(c => c.title === 'Family Medical History');
    const vacationCapsule = allCapsules.find(c => c.title === 'Summer Vacation 2024');
    const letterCapsule = allCapsules.find(c => c.title === 'Letter to My Future Self');

    if (!weddingCapsule || !birthdayCapsule || !healthCapsule || !vacationCapsule || !letterCapsule) {
        throw new Error('Required capsules not found in database');
    }

    // Calculate dates
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const sampleActivities = [
        {
            id: 'activity_wedding_created_001',
            capsuleId: weddingCapsule.id,
            userId: johnDoe.id,
            activityType: 'created',
            description: "Created wedding capsule 'Our Wedding Day - 2024'",
            createdAt: fiveMonthsAgo.toISOString(),
        },
        {
            id: 'activity_wedding_file_002',
            capsuleId: weddingCapsule.id,
            userId: johnDoe.id,
            activityType: 'file_added',
            description: "Added video file 'ceremony_entrance.mp4'",
            createdAt: fiveMonthsAgo.toISOString(),
        },
        {
            id: 'activity_wedding_sealed_003',
            capsuleId: weddingCapsule.id,
            userId: johnDoe.id,
            activityType: 'sealed',
            description: 'Sealed wedding capsule until unlock date',
            createdAt: fourMonthsAgo.toISOString(),
        },
        {
            id: 'activity_birthday_created_004',
            capsuleId: birthdayCapsule.id,
            userId: johnDoe.id,
            activityType: 'created',
            description: "Created birthday capsule 'Emma's 1st Birthday'",
            createdAt: threeMonthsAgo.toISOString(),
        },
        {
            id: 'activity_birthday_file_005',
            capsuleId: birthdayCapsule.id,
            userId: johnDoe.id,
            activityType: 'file_added',
            description: "Added video file 'emma_first_steps.mov'",
            createdAt: threeMonthsAgo.toISOString(),
        },
        {
            id: 'activity_health_created_006',
            capsuleId: healthCapsule.id,
            userId: sarahSmith.id,
            activityType: 'created',
            description: "Created health records capsule 'Family Medical History'",
            createdAt: twoMonthsAgo.toISOString(),
        },
        {
            id: 'activity_health_shared_007',
            capsuleId: healthCapsule.id,
            userId: sarahSmith.id,
            activityType: 'shared',
            description: 'Shared health records capsule with Dr. Michael Johnson (admin access)',
            createdAt: twoMonthsAgo.toISOString(),
        },
        {
            id: 'activity_vacation_created_008',
            capsuleId: vacationCapsule.id,
            userId: sarahSmith.id,
            activityType: 'created',
            description: "Created travel capsule 'Summer Vacation 2024'",
            createdAt: oneMonthAgo.toISOString(),
        },
        {
            id: 'activity_vacation_file_009',
            capsuleId: vacationCapsule.id,
            userId: sarahSmith.id,
            activityType: 'file_added',
            description: "Added photo 'hawaii_beach_sunset.jpg'",
            createdAt: oneMonthAgo.toISOString(),
        },
        {
            id: 'activity_vacation_shared_010',
            capsuleId: vacationCapsule.id,
            userId: sarahSmith.id,
            activityType: 'shared',
            description: 'Shared vacation capsule with John Doe (edit access)',
            createdAt: oneMonthAgo.toISOString(),
        },
        {
            id: 'activity_personal_created_011',
            capsuleId: letterCapsule.id,
            userId: drMichael.id,
            activityType: 'created',
            description: "Created personal capsule 'Letter to My Future Self'",
            createdAt: twoWeeksAgo.toISOString(),
        },
        {
            id: 'activity_personal_updated_012',
            capsuleId: letterCapsule.id,
            userId: drMichael.id,
            activityType: 'updated',
            description: 'Updated capsule description and added life goals document',
            createdAt: oneWeekAgo.toISOString(),
        },
    ];

    await db.insert(capsuleActivities).values(sampleActivities);
    
    console.log('✅ Capsule activities seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});