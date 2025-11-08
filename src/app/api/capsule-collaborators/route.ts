import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { capsuleCollaborators, capsules, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const VALID_PERMISSIONS = ['view', 'edit', 'admin'] as const;
type Permission = typeof VALID_PERMISSIONS[number];

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function isValidPermission(permission: string): permission is Permission {
  return VALID_PERMISSIONS.includes(permission as Permission);
}

function isValidISODate(date: string): boolean {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!isoRegex.test(date)) return false;
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      if (!isValidUUID(id)) {
        return NextResponse.json({
          error: 'Invalid UUID format for id',
          code: 'INVALID_UUID'
        }, { status: 400 });
      }

      const collaborator = await db.select()
        .from(capsuleCollaborators)
        .where(eq(capsuleCollaborators.id, id))
        .limit(1);

      if (collaborator.length === 0) {
        return NextResponse.json({
          error: 'Collaborator not found',
          code: 'NOT_FOUND'
        }, { status: 404 });
      }

      return NextResponse.json(collaborator[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const capsuleId = searchParams.get('capsuleId');
    const userId = searchParams.get('userId');
    const permission = searchParams.get('permission');

    let query = db.select().from(capsuleCollaborators);

    const conditions = [];

    if (capsuleId) {
      if (!isValidUUID(capsuleId)) {
        return NextResponse.json({
          error: 'Invalid UUID format for capsuleId',
          code: 'INVALID_UUID'
        }, { status: 400 });
      }
      conditions.push(eq(capsuleCollaborators.capsuleId, capsuleId));
    }

    if (userId) {
      if (!isValidUUID(userId)) {
        return NextResponse.json({
          error: 'Invalid UUID format for userId',
          code: 'INVALID_UUID'
        }, { status: 400 });
      }
      conditions.push(eq(capsuleCollaborators.userId, userId));
    }

    if (permission) {
      if (!isValidPermission(permission)) {
        return NextResponse.json({
          error: 'Invalid permission. Must be one of: view, edit, admin',
          code: 'INVALID_PERMISSION'
        }, { status: 400 });
      }
      conditions.push(eq(capsuleCollaborators.permission, permission));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { capsuleId, userId, permission, invitedBy } = body;

    if (!capsuleId) {
      return NextResponse.json({
        error: 'capsuleId is required',
        code: 'MISSING_CAPSULE_ID'
      }, { status: 400 });
    }

    if (!isValidUUID(capsuleId)) {
      return NextResponse.json({
        error: 'Invalid UUID format for capsuleId',
        code: 'INVALID_UUID'
      }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({
        error: 'userId is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    if (!isValidUUID(userId)) {
      return NextResponse.json({
        error: 'Invalid UUID format for userId',
        code: 'INVALID_UUID'
      }, { status: 400 });
    }

    if (!invitedBy) {
      return NextResponse.json({
        error: 'invitedBy is required',
        code: 'MISSING_INVITED_BY'
      }, { status: 400 });
    }

    if (!isValidUUID(invitedBy)) {
      return NextResponse.json({
        error: 'Invalid UUID format for invitedBy',
        code: 'INVALID_UUID'
      }, { status: 400 });
    }

    const permissionValue = permission || 'view';
    if (!isValidPermission(permissionValue)) {
      return NextResponse.json({
        error: 'Invalid permission. Must be one of: view, edit, admin',
        code: 'INVALID_PERMISSION'
      }, { status: 400 });
    }

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

    const inviterExists = await db.select()
      .from(users)
      .where(eq(users.id, invitedBy))
      .limit(1);

    if (inviterExists.length === 0) {
      return NextResponse.json({
        error: 'Inviter not found',
        code: 'INVITER_NOT_FOUND'
      }, { status: 400 });
    }

    const newCollaborator = await db.insert(capsuleCollaborators)
      .values({
        id: randomUUID(),
        capsuleId,
        userId,
        permission: permissionValue,
        invitedBy,
        acceptedAt: null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newCollaborator[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: 'id is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    if (!isValidUUID(id)) {
      return NextResponse.json({
        error: 'Invalid UUID format for id',
        code: 'INVALID_UUID'
      }, { status: 400 });
    }

    const existingCollaborator = await db.select()
      .from(capsuleCollaborators)
      .where(eq(capsuleCollaborators.id, id))
      .limit(1);

    if (existingCollaborator.length === 0) {
      return NextResponse.json({
        error: 'Collaborator not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    const body = await request.json();
    const { permission, acceptedAt } = body;

    const updates: Partial<typeof capsuleCollaborators.$inferInsert> = {};

    if (permission !== undefined) {
      if (!isValidPermission(permission)) {
        return NextResponse.json({
          error: 'Invalid permission. Must be one of: view, edit, admin',
          code: 'INVALID_PERMISSION'
        }, { status: 400 });
      }
      updates.permission = permission;
    }

    if (acceptedAt !== undefined) {
      if (acceptedAt !== null && !isValidISODate(acceptedAt)) {
        return NextResponse.json({
          error: 'Invalid ISO date format for acceptedAt',
          code: 'INVALID_DATE_FORMAT'
        }, { status: 400 });
      }
      updates.acceptedAt = acceptedAt;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existingCollaborator[0], { status: 200 });
    }

    const updated = await db.update(capsuleCollaborators)
      .set(updates)
      .where(eq(capsuleCollaborators.id, id))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: 'id is required',
        code: 'MISSING_ID'
      }, { status: 400 });
    }

    if (!isValidUUID(id)) {
      return NextResponse.json({
        error: 'Invalid UUID format for id',
        code: 'INVALID_UUID'
      }, { status: 400 });
    }

    const existingCollaborator = await db.select()
      .from(capsuleCollaborators)
      .where(eq(capsuleCollaborators.id, id))
      .limit(1);

    if (existingCollaborator.length === 0) {
      return NextResponse.json({
        error: 'Collaborator not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    const deleted = await db.delete(capsuleCollaborators)
      .where(eq(capsuleCollaborators.id, id))
      .returning();

    return NextResponse.json({
      message: 'Collaborator deleted successfully',
      collaborator: deleted[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}