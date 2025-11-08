import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { capsules, users } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '@/lib/auth';

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Helper function to validate ISO timestamp
function isValidISOTimestamp(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === dateString;
}

// Helper function to validate status enum
function isValidStatus(status: string): boolean {
  return ['draft', 'sealed', 'unlocked'].includes(status);
}

// GET: List capsules - MODIFIED to filter by authenticated user
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single capsule by ID
    if (id) {
      if (!isValidUUID(id)) {
        return NextResponse.json(
          { error: 'Valid UUID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const capsule = await db
        .select()
        .from(capsules)
        .where(eq(capsules.id, id))
        .limit(1);

      if (capsule.length === 0) {
        return NextResponse.json(
          { error: 'Capsule not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(capsule[0], { status: 200 });
    }

    // List capsules with pagination and filtering - FILTER BY AUTHENTICATED USER
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const theme = searchParams.get('theme');

    let query = db.select().from(capsules);

    // Build filter conditions - ALWAYS include userId filter
    const conditions = [eq(capsules.userId, authenticatedUser.id)];

    if (search) {
      conditions.push(
        or(
          like(capsules.title, `%${search}%`),
          like(capsules.description, `%${search}%`)
        )
      );
    }

    if (status) {
      if (!isValidStatus(status)) {
        return NextResponse.json(
          { error: 'Status must be one of: draft, sealed, unlocked', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      conditions.push(eq(capsules.status, status));
    }

    if (theme) {
      conditions.push(eq(capsules.theme, theme));
    }

    query = query.where(and(...conditions));

    const results = await query
      .orderBy(desc(capsules.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

// POST: Create new capsule - MODIFIED to use authenticated user
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, unlockDate, isEmergencyAccessible, emergencyQrCode, theme } = body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'title is required and cannot be empty', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!unlockDate) {
      return NextResponse.json(
        { error: 'unlockDate is required', code: 'MISSING_UNLOCK_DATE' },
        { status: 400 }
      );
    }

    // Validate unlockDate format
    if (!isValidISOTimestamp(unlockDate)) {
      return NextResponse.json(
        { error: 'unlockDate must be a valid ISO timestamp', code: 'INVALID_UNLOCK_DATE' },
        { status: 400 }
      );
    }

    // Validate isEmergencyAccessible if provided
    if (isEmergencyAccessible !== undefined && typeof isEmergencyAccessible !== 'boolean') {
      return NextResponse.json(
        { error: 'isEmergencyAccessible must be a boolean', code: 'INVALID_EMERGENCY_ACCESS' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newCapsule = await db
      .insert(capsules)
      .values({
        id: randomUUID(),
        userId: authenticatedUser.id, // Use authenticated user ID
        title: title.trim(),
        description: description?.trim() || null,
        unlockDate,
        isLocked: true,
        isEmergencyAccessible: isEmergencyAccessible ?? false,
        emergencyQrCode: emergencyQrCode?.trim() || null,
        theme: theme?.trim() || 'default',
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newCapsule[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

// PUT: Update capsule
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Capsule ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Valid UUID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if capsule exists
    const existingCapsule = await db
      .select()
      .from(capsules)
      .where(eq(capsules.id, id))
      .limit(1);

    if (existingCapsule.length === 0) {
      return NextResponse.json(
        { error: 'Capsule not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, unlockDate, isLocked, isEmergencyAccessible, emergencyQrCode, theme, status } = body;

    // Build update object
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Validate and add fields if provided
    if (title !== undefined) {
      if (title.trim() === '') {
        return NextResponse.json(
          { error: 'title cannot be empty', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (unlockDate !== undefined) {
      if (!isValidISOTimestamp(unlockDate)) {
        return NextResponse.json(
          { error: 'unlockDate must be a valid ISO timestamp', code: 'INVALID_UNLOCK_DATE' },
          { status: 400 }
        );
      }
      updates.unlockDate = unlockDate;
    }

    if (isLocked !== undefined) {
      if (typeof isLocked !== 'boolean') {
        return NextResponse.json(
          { error: 'isLocked must be a boolean', code: 'INVALID_IS_LOCKED' },
          { status: 400 }
        );
      }
      updates.isLocked = isLocked;
    }

    if (isEmergencyAccessible !== undefined) {
      if (typeof isEmergencyAccessible !== 'boolean') {
        return NextResponse.json(
          { error: 'isEmergencyAccessible must be a boolean', code: 'INVALID_EMERGENCY_ACCESS' },
          { status: 400 }
        );
      }
      updates.isEmergencyAccessible = isEmergencyAccessible;
    }

    if (emergencyQrCode !== undefined) {
      updates.emergencyQrCode = emergencyQrCode?.trim() || null;
    }

    if (theme !== undefined) {
      updates.theme = theme.trim();
    }

    if (status !== undefined) {
      if (!isValidStatus(status)) {
        return NextResponse.json(
          { error: 'status must be one of: draft, sealed, unlocked', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    const updated = await db
      .update(capsules)
      .set(updates)
      .where(eq(capsules.id, id))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

// DELETE: Delete capsule - REMOVED (moved to [id]/route.ts)