import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

function isValidInteger(id: string): boolean {
  return /^\d+$/.test(id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || !isValidInteger(id)) {
      return NextResponse.json(
        { error: 'Valid integer is required for notification ID', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { 
          error: "User ID cannot be provided in request body",
          code: "USER_ID_NOT_ALLOWED" 
        },
        { status: 400 }
      );
    }

    const { isRead } = body;

    if (isRead !== undefined && typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'isRead must be a boolean value', code: 'INVALID_FIELD_TYPE' },
        { status: 400 }
      );
    }

    const existingNotification = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, parseInt(id)), eq(notifications.userId, authenticatedUser.id)))
      .limit(1);

    if (existingNotification.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updated = await db
      .update(notifications)
      .set({
        isRead: isRead !== undefined ? isRead : existingNotification[0].isRead,
      })
      .where(and(eq(notifications.id, parseInt(id)), eq(notifications.userId, authenticatedUser.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || !isValidInteger(id)) {
      return NextResponse.json(
        { error: 'Valid integer is required for notification ID', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingNotification = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, parseInt(id)), eq(notifications.userId, authenticatedUser.id)))
      .limit(1);

    if (existingNotification.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(notifications)
      .where(and(eq(notifications.id, parseInt(id)), eq(notifications.userId, authenticatedUser.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Notification deleted successfully',
        notification: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}