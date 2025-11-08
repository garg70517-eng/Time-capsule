import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { capsuleActivities, capsules, users } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const VALID_ACTIVITY_TYPES = ['created', 'updated', 'file_added', 'file_removed', 'sealed', 'unlocked', 'shared'] as const;

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single activity fetch by ID
    if (id) {
      if (!isValidUUID(id)) {
        return NextResponse.json({ 
          error: 'Invalid UUID format for id',
          code: 'INVALID_UUID' 
        }, { status: 400 });
      }

      const activity = await db.select()
        .from(capsuleActivities)
        .where(eq(capsuleActivities.id, id))
        .limit(1);

      if (activity.length === 0) {
        return NextResponse.json({ 
          error: 'Activity not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(activity[0], { status: 200 });
    }

    // List activities with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const capsuleId = searchParams.get('capsuleId');
    const userId = searchParams.get('userId');
    const activityType = searchParams.get('activityType');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Validate UUID filters
    if (capsuleId && !isValidUUID(capsuleId)) {
      return NextResponse.json({ 
        error: 'Invalid UUID format for capsuleId',
        code: 'INVALID_UUID' 
      }, { status: 400 });
    }

    if (userId && !isValidUUID(userId)) {
      return NextResponse.json({ 
        error: 'Invalid UUID format for userId',
        code: 'INVALID_UUID' 
      }, { status: 400 });
    }

    // Validate activity type
    if (activityType && !VALID_ACTIVITY_TYPES.includes(activityType as any)) {
      return NextResponse.json({ 
        error: `Invalid activity type. Must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}`,
        code: 'INVALID_ACTIVITY_TYPE' 
      }, { status: 400 });
    }

    // Build query with filters
    let query = db.select().from(capsuleActivities);

    const conditions = [];
    if (capsuleId) {
      conditions.push(eq(capsuleActivities.capsuleId, capsuleId));
    }
    if (userId) {
      conditions.push(eq(capsuleActivities.userId, userId));
    }
    if (activityType) {
      conditions.push(eq(capsuleActivities.activityType, activityType));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const orderFn = order === 'asc' ? asc : desc;
    if (sort === 'createdAt') {
      query = query.orderBy(orderFn(capsuleActivities.createdAt));
    }

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { capsuleId, userId, activityType, description } = body;

    // Validate required fields
    if (!capsuleId) {
      return NextResponse.json({ 
        error: 'capsuleId is required',
        code: 'MISSING_CAPSULE_ID' 
      }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ 
        error: 'userId is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    if (!activityType) {
      return NextResponse.json({ 
        error: 'activityType is required',
        code: 'MISSING_ACTIVITY_TYPE' 
      }, { status: 400 });
    }

    if (!description || description.trim() === '') {
      return NextResponse.json({ 
        error: 'description is required and cannot be empty',
        code: 'MISSING_DESCRIPTION' 
      }, { status: 400 });
    }

    // Validate UUID formats
    if (!isValidUUID(capsuleId)) {
      return NextResponse.json({ 
        error: 'Invalid UUID format for capsuleId',
        code: 'INVALID_UUID' 
      }, { status: 400 });
    }

    if (!isValidUUID(userId)) {
      return NextResponse.json({ 
        error: 'Invalid UUID format for userId',
        code: 'INVALID_UUID' 
      }, { status: 400 });
    }

    // Validate activity type
    if (!VALID_ACTIVITY_TYPES.includes(activityType as any)) {
      return NextResponse.json({ 
        error: `Invalid activity type. Must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}`,
        code: 'INVALID_ACTIVITY_TYPE' 
      }, { status: 400 });
    }

    // Validate capsuleId exists
    const capsuleExists = await db.select()
      .from(capsules)
      .where(eq(capsules.id, capsuleId))
      .limit(1);

    if (capsuleExists.length === 0) {
      return NextResponse.json({ 
        error: 'Capsule not found',
        code: 'CAPSULE_NOT_FOUND' 
      }, { status: 400 });
    }

    // Validate userId exists
    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 400 });
    }

    // Create activity
    const newActivity = await db.insert(capsuleActivities)
      .values({
        id: randomUUID(),
        capsuleId: capsuleId.trim(),
        userId: userId.trim(),
        activityType: activityType.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newActivity[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: 'Activity ID is required',
        code: 'MISSING_ID' 
      }, { status: 400 });
    }

    if (!isValidUUID(id)) {
      return NextResponse.json({ 
        error: 'Invalid UUID format for id',
        code: 'INVALID_UUID' 
      }, { status: 400 });
    }

    // Check if activity exists
    const existingActivity = await db.select()
      .from(capsuleActivities)
      .where(eq(capsuleActivities.id, id))
      .limit(1);

    if (existingActivity.length === 0) {
      return NextResponse.json({ 
        error: 'Activity not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete the activity
    const deleted = await db.delete(capsuleActivities)
      .where(eq(capsuleActivities.id, id))
      .returning();

    return NextResponse.json({ 
      message: 'Activity deleted successfully',
      activity: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}