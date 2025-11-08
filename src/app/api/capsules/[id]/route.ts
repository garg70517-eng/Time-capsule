import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { capsules, capsuleFiles, capsuleCollaborators, capsuleActivities } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Capsule ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid UUID format', code: 'INVALID_UUID' },
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

    const capsuleData = capsule[0];

    // Allow unauthenticated access for emergency-accessible capsules
    if (capsuleData.isEmergencyAccessible) {
      return NextResponse.json(capsuleData, { status: 200 });
    }

    // For non-emergency capsules, require authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const isOwner = capsuleData.userId === user.id;

    if (!isOwner) {
      const collaborator = await db
        .select()
        .from(capsuleCollaborators)
        .where(
          and(
            eq(capsuleCollaborators.capsuleId, id),
            eq(capsuleCollaborators.userId, user.id)
          )
        )
        .limit(1);

      if (collaborator.length === 0) {
        return NextResponse.json(
          { error: 'Access forbidden', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(capsuleData, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
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
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Capsule ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid UUID format', code: 'INVALID_UUID' },
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

    const capsuleData = capsule[0];

    if (capsuleData.userId !== user.id) {
      return NextResponse.json(
        { error: 'Only the owner can delete this capsule', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    await db.delete(capsuleFiles).where(eq(capsuleFiles.capsuleId, id));

    await db.delete(capsuleCollaborators).where(eq(capsuleCollaborators.capsuleId, id));

    await db.delete(capsuleActivities).where(eq(capsuleActivities.capsuleId, id));

    const deleted = await db
      .delete(capsules)
      .where(eq(capsules.id, id))
      .returning();

    return NextResponse.json(
      {
        message: 'Capsule deleted successfully',
        capsule: deleted[0],
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