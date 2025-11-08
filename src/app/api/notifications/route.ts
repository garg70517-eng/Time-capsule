import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications, user, capsules } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_NOTIFICATION_TYPES = [
  'unlock_reminder',
  'capsule_unlocked',
  'collaborator_added',
  'emergency_access'
] as const;

export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const isReadParam = searchParams.get('isRead');
    const type = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (userId !== authenticatedUser.id) {
      return NextResponse.json(
        { error: 'Cannot access notifications for other users', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const conditions = [eq(notifications.userId, userId)];

    if (isReadParam !== null) {
      const isRead = isReadParam === 'true';
      conditions.push(eq(notifications.isRead, isRead));
    }

    if (type) {
      if (!VALID_NOTIFICATION_TYPES.includes(type as any)) {
        return NextResponse.json(
          { error: 'Invalid notification type', code: 'INVALID_TYPE' },
          { status: 400 }
        );
      }
      conditions.push(eq(notifications.type, type));
    }

    const results = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, type, title, message, capsuleId, scheduledFor } = body;

    if ('id' in body) {
      return NextResponse.json(
        { error: 'ID cannot be provided in request body', code: 'ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'type is required', code: 'MISSING_TYPE' },
        { status: 400 }
      );
    }

    if (!VALID_NOTIFICATION_TYPES.includes(type as any)) {
      return NextResponse.json(
        { 
          error: `Invalid type. Must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`, 
          code: 'INVALID_TYPE' 
        },
        { status: 400 }
      );
    }

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'title is required and cannot be empty', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'message is required and cannot be empty', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    const userExists = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (capsuleId) {
      const capsuleExists = await db
        .select()
        .from(capsules)
        .where(eq(capsules.id, capsuleId))
        .limit(1);

      if (capsuleExists.length === 0) {
        return NextResponse.json(
          { error: 'Capsule not found', code: 'CAPSULE_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid scheduledFor timestamp', code: 'INVALID_TIMESTAMP' },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    const newNotification = await db
      .insert(notifications)
      .values({
        userId: userId.trim(),
        capsuleId: capsuleId ? capsuleId.trim() : null,
        type: type.trim(),
        title: title.trim(),
        message: message.trim(),
        isRead: false,
        createdAt: now,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      })
      .returning();

    return NextResponse.json(newNotification[0], { status: 201 });
  } catch (error) {
    console.error('POST notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}