import { db } from '@/db';
import { notifications, user } from '@/db/schema';

async function main() {
    const existingUsers = await db.select({ id: user.id }).from(user);
    
    if (existingUsers.length === 0) {
        console.error('❌ No users found in database. Please seed users first.');
        return;
    }

    const userIds = existingUsers.map(u => u.id);
    const getUserId = (index: number) => userIds[index % userIds.length];

    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const today = new Date();

    const sampleNotifications = [
        {
            userId: getUserId(0),
            capsuleId: null,
            type: 'unlock_reminder',
            title: 'Welcome to Time Capsule!',
            message: 'Welcome to Time Capsule! Start creating your first capsule to preserve your memories.',
            isRead: true,
            scheduledFor: null,
            createdAt: threeMonthsAgo.toISOString(),
        },
        {
            userId: getUserId(1),
            capsuleId: null,
            type: 'capsule_unlocked',
            title: 'Account Activated',
            message: 'Your account has been activated. Ready to preserve memories!',
            isRead: true,
            scheduledFor: null,
            createdAt: threeMonthsAgo.toISOString(),
        },
        {
            userId: getUserId(0),
            capsuleId: null,
            type: 'collaborator_added',
            title: 'Collaboration Features',
            message: 'Discover collaboration features - share capsules with loved ones.',
            isRead: true,
            scheduledFor: null,
            createdAt: twoMonthsAgo.toISOString(),
        },
        {
            userId: getUserId(2),
            capsuleId: null,
            type: 'emergency_access',
            title: 'Emergency Access Guide',
            message: 'Learn how emergency access works for your time capsules.',
            isRead: false,
            scheduledFor: null,
            createdAt: twoMonthsAgo.toISOString(),
        },
        {
            userId: getUserId(1),
            capsuleId: null,
            type: 'unlock_reminder',
            title: 'Pro Tips',
            message: 'Pro tip: Set meaningful unlock dates for your capsules.',
            isRead: true,
            scheduledFor: null,
            createdAt: oneMonthAgo.toISOString(),
        },
        {
            userId: getUserId(3),
            capsuleId: null,
            type: 'collaborator_added',
            title: 'Collaboration Invitation',
            message: 'You can now invite family members to view and contribute to your capsules.',
            isRead: false,
            scheduledFor: null,
            createdAt: oneMonthAgo.toISOString(),
        },
        {
            userId: getUserId(0),
            capsuleId: null,
            type: 'capsule_unlocked',
            title: 'Storage Options',
            message: 'Explore different storage options for your capsule files and media.',
            isRead: true,
            scheduledFor: null,
            createdAt: twoWeeksAgo.toISOString(),
        },
        {
            userId: getUserId(2),
            capsuleId: null,
            type: 'emergency_access',
            title: 'QR Code Generated',
            message: 'Your emergency access QR code has been generated for secure capsule access.',
            isRead: false,
            scheduledFor: null,
            createdAt: twoWeeksAgo.toISOString(),
        },
        {
            userId: getUserId(1),
            capsuleId: null,
            type: 'unlock_reminder',
            title: 'Upcoming Unlock',
            message: 'Remember to check your upcoming unlock dates for your time capsules.',
            isRead: false,
            scheduledFor: null,
            createdAt: oneWeekAgo.toISOString(),
        },
        {
            userId: getUserId(3),
            capsuleId: null,
            type: 'collaborator_added',
            title: 'Permission Settings',
            message: 'Manage collaborator permissions: view, edit, or admin access levels.',
            isRead: false,
            scheduledFor: null,
            createdAt: oneWeekAgo.toISOString(),
        },
        {
            userId: getUserId(0),
            capsuleId: null,
            type: 'emergency_access',
            title: 'Emergency Contact Setup',
            message: 'Set up emergency contacts who can access your capsules in case of emergencies.',
            isRead: false,
            scheduledFor: null,
            createdAt: threeDaysAgo.toISOString(),
        },
        {
            userId: getUserId(2),
            capsuleId: null,
            type: 'capsule_unlocked',
            title: 'Media Upload Complete',
            message: 'Your photos and videos have been successfully uploaded to your capsule.',
            isRead: true,
            scheduledFor: null,
            createdAt: threeDaysAgo.toISOString(),
        },
        {
            userId: getUserId(1),
            capsuleId: null,
            type: 'unlock_reminder',
            title: 'Capsule Unlock Soon',
            message: 'One of your time capsules will unlock in 7 days. Get ready to revisit your memories!',
            isRead: false,
            scheduledFor: null,
            createdAt: yesterday.toISOString(),
        },
        {
            userId: getUserId(3),
            capsuleId: null,
            type: 'collaborator_added',
            title: 'New Collaborator Joined',
            message: 'A new collaborator has accepted your invitation and can now access shared capsules.',
            isRead: false,
            scheduledFor: null,
            createdAt: yesterday.toISOString(),
        },
        {
            userId: getUserId(0),
            capsuleId: null,
            type: 'emergency_access',
            title: 'Security Update',
            message: 'Your emergency access settings have been updated for enhanced security.',
            isRead: false,
            scheduledFor: null,
            createdAt: today.toISOString(),
        },
        {
            userId: getUserId(2),
            capsuleId: null,
            type: 'capsule_unlocked',
            title: 'Theme Customization',
            message: 'Customize your capsule themes to make each memory unique and personal.',
            isRead: false,
            scheduledFor: null,
            createdAt: today.toISOString(),
        },
        {
            userId: getUserId(1),
            capsuleId: null,
            type: 'unlock_reminder',
            title: 'Scheduled Reminder',
            message: 'This is a scheduled reminder about your capsule unlocking next month.',
            isRead: false,
            scheduledFor: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: today.toISOString(),
        },
        {
            userId: getUserId(3),
            capsuleId: null,
            type: 'collaborator_added',
            title: 'Collaboration Tips',
            message: 'Tips for effective collaboration: communicate unlock dates with your collaborators.',
            isRead: true,
            scheduledFor: null,
            createdAt: today.toISOString(),
        },
    ];

    await db.insert(notifications).values(sampleNotifications);
    
    console.log('✅ Notifications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});