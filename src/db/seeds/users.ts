import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const sampleUsers = [
        {
            id: 'user_2k8f9x1m4n7q3w5e6r8t0y2u',
            email: 'john.doe@example.com',
            fullName: 'John Doe',
            role: 'user',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
            createdAt: sixMonthsAgo.toISOString(),
            updatedAt: sixMonthsAgo.toISOString(),
        },
        {
            id: 'user_5h3j6k8l9m2n4p7q1r5s8t0v',
            email: 'sarah.smith@family.com',
            fullName: 'Sarah Smith',
            role: 'family',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            createdAt: fourMonthsAgo.toISOString(),
            updatedAt: fourMonthsAgo.toISOString(),
        },
        {
            id: 'user_9w4e7r2t5y8u1i3o6p0a9s2d',
            email: 'dr.michael.johnson@hospital.com',
            fullName: 'Dr. Michael Johnson',
            role: 'doctor',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
            createdAt: threeMonthsAgo.toISOString(),
            updatedAt: threeMonthsAgo.toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
    console.log('Generated User IDs:');
    console.log('- John Doe:', sampleUsers[0].id);
    console.log('- Sarah Smith:', sampleUsers[1].id);
    console.log('- Dr. Michael Johnson:', sampleUsers[2].id);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});