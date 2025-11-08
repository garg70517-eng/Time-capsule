import { db } from '@/db';
import { capsuleFiles, users, capsules } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // Query users to get actual IDs
    const allUsers = await db.select({ id: users.id, email: users.email }).from(users);
    const johnDoe = allUsers.find(u => u.email === 'john.doe@example.com');
    const sarahSmith = allUsers.find(u => u.email === 'sarah.smith@family.com');
    const drJohnson = allUsers.find(u => u.email === 'dr.michael.johnson@hospital.com');

    if (!johnDoe || !sarahSmith || !drJohnson) {
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
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const sampleFiles = [
        {
            id: 'file_wedding_ceremony_001',
            capsuleId: weddingCapsule.id,
            fileName: 'ceremony_entrance.mp4',
            fileType: 'video/mp4',
            fileSize: 45678900,
            fileUrl: 'https://storage.example.com/capsules/wedding/ceremony_entrance.mp4',
            thumbnailUrl: 'https://storage.example.com/capsules/wedding/thumbs/ceremony_entrance.jpg',
            uploadedBy: johnDoe.id,
            createdAt: fiveMonthsAgo.toISOString(),
        },
        {
            id: 'file_wedding_portrait_002',
            capsuleId: weddingCapsule.id,
            fileName: 'bride_and_groom_portrait.jpg',
            fileType: 'image/jpeg',
            fileSize: 3456780,
            fileUrl: 'https://storage.example.com/capsules/wedding/bride_and_groom_portrait.jpg',
            thumbnailUrl: 'https://storage.example.com/capsules/wedding/thumbs/bride_and_groom_portrait.jpg',
            uploadedBy: johnDoe.id,
            createdAt: fiveMonthsAgo.toISOString(),
        },
        {
            id: 'file_birthday_steps_003',
            capsuleId: birthdayCapsule.id,
            fileName: 'emma_first_steps.mov',
            fileType: 'video/quicktime',
            fileSize: 23456700,
            fileUrl: 'https://storage.example.com/capsules/birthday/emma_first_steps.mov',
            thumbnailUrl: 'https://storage.example.com/capsules/birthday/thumbs/emma_first_steps.jpg',
            uploadedBy: johnDoe.id,
            createdAt: threeMonthsAgo.toISOString(),
        },
        {
            id: 'file_birthday_cake_004',
            capsuleId: birthdayCapsule.id,
            fileName: 'birthday_cake_smash.jpg',
            fileType: 'image/jpeg',
            fileSize: 2345670,
            fileUrl: 'https://storage.example.com/capsules/birthday/birthday_cake_smash.jpg',
            thumbnailUrl: 'https://storage.example.com/capsules/birthday/thumbs/birthday_cake_smash.jpg',
            uploadedBy: johnDoe.id,
            createdAt: threeMonthsAgo.toISOString(),
        },
        {
            id: 'file_health_history_005',
            capsuleId: healthCapsule.id,
            fileName: 'medical_history_2024.pdf',
            fileType: 'application/pdf',
            fileSize: 1234560,
            fileUrl: 'https://storage.example.com/capsules/health/medical_history_2024.pdf',
            thumbnailUrl: null,
            uploadedBy: sarahSmith.id,
            createdAt: twoMonthsAgo.toISOString(),
        },
        {
            id: 'file_health_vaccination_006',
            capsuleId: healthCapsule.id,
            fileName: 'vaccination_records.pdf',
            fileType: 'application/pdf',
            fileSize: 876540,
            fileUrl: 'https://storage.example.com/capsules/health/vaccination_records.pdf',
            thumbnailUrl: null,
            uploadedBy: sarahSmith.id,
            createdAt: twoMonthsAgo.toISOString(),
        },
        {
            id: 'file_travel_sunset_007',
            capsuleId: vacationCapsule.id,
            fileName: 'hawaii_beach_sunset.jpg',
            fileType: 'image/jpeg',
            fileSize: 4567890,
            fileUrl: 'https://storage.example.com/capsules/travel/hawaii_beach_sunset.jpg',
            thumbnailUrl: 'https://storage.example.com/capsules/travel/thumbs/hawaii_beach_sunset.jpg',
            uploadedBy: sarahSmith.id,
            createdAt: oneMonthAgo.toISOString(),
        },
        {
            id: 'file_travel_snorkeling_008',
            capsuleId: vacationCapsule.id,
            fileName: 'snorkeling_adventure.mp4',
            fileType: 'video/mp4',
            fileSize: 78901230,
            fileUrl: 'https://storage.example.com/capsules/travel/snorkeling_adventure.mp4',
            thumbnailUrl: 'https://storage.example.com/capsules/travel/thumbs/snorkeling_adventure.jpg',
            uploadedBy: sarahSmith.id,
            createdAt: oneMonthAgo.toISOString(),
        },
        {
            id: 'file_personal_letter_009',
            capsuleId: letterCapsule.id,
            fileName: 'letter_to_future_self.pdf',
            fileType: 'application/pdf',
            fileSize: 234567,
            fileUrl: 'https://storage.example.com/capsules/personal/letter_to_future_self.pdf',
            thumbnailUrl: null,
            uploadedBy: drJohnson.id,
            createdAt: twoWeeksAgo.toISOString(),
        },
        {
            id: 'file_personal_goals_010',
            capsuleId: letterCapsule.id,
            fileName: 'life_goals_2024.docx',
            fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileSize: 123456,
            fileUrl: 'https://storage.example.com/capsules/personal/life_goals_2024.docx',
            thumbnailUrl: null,
            uploadedBy: drJohnson.id,
            createdAt: twoWeeksAgo.toISOString(),
        },
    ];

    await db.insert(capsuleFiles).values(sampleFiles);
    
    console.log('✅ Capsule files seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});