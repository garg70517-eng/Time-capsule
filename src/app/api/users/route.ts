import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, user, capsules, capsuleFiles, capsuleCollaborators, capsuleActivities, notifications } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '@/lib/auth';

// Validation helpers
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidRole(role: string): boolean {
  return ['user', 'family', 'doctor', 'admin'].includes(role);
}

function isValidUUID(id: string): boolean {
  // Accept both standard UUID format and better-auth ID format (alphanumeric strings)
  const standardUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const betterAuthIdRegex = /^[a-zA-Z0-9]{20,}$/;
  return standardUuidRegex.test(id) || betterAuthIdRegex.test(id);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single user by ID
    if (id) {
      if (!isValidUUID(id)) {
        return NextResponse.json({ 
          error: 'Invalid UUID format',
          code: 'INVALID_UUID' 
        }, { status: 400 });
      }

      const user = await db.select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json({ 
          error: 'User not found',
          code: 'USER_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(user[0], { status: 200 });
    }

    // List users with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const roleFilter = searchParams.get('role');

    let query = db.select().from(users);

    // Build where conditions
    const conditions = [];

    if (search) {
      const searchCondition = or(
        like(users.email, `%${search}%`),
        like(users.fullName, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    if (roleFilter) {
      if (!isValidRole(roleFilter)) {
        return NextResponse.json({ 
          error: 'Invalid role filter. Must be one of: user, family, doctor, admin',
          code: 'INVALID_ROLE_FILTER' 
        }, { status: 400 });
      }
      conditions.push(eq(users.role, roleFilter));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

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
    const { email, fullName, role, avatarUrl } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required',
        code: 'MISSING_EMAIL' 
      }, { status: 400 });
    }

    if (!fullName) {
      return NextResponse.json({ 
        error: 'Full name is required',
        code: 'MISSING_FULL_NAME' 
      }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL_FORMAT' 
      }, { status: 400 });
    }

    // Validate fullName is not empty
    if (fullName.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Full name cannot be empty',
        code: 'EMPTY_FULL_NAME' 
      }, { status: 400 });
    }

    // Validate role if provided
    const userRole = role || 'user';
    if (!isValidRole(userRole)) {
      return NextResponse.json({ 
        error: 'Invalid role. Must be one of: user, family, doctor, admin',
        code: 'INVALID_ROLE' 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ 
        error: 'Email already exists',
        code: 'EMAIL_EXISTS' 
      }, { status: 400 });
    }

    // Create new user
    const newUser = await db.insert(users)
      .values({
        id: randomUUID(),
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        role: userRole,
        avatarUrl: avatarUrl || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: 'Email already exists',
        code: 'EMAIL_EXISTS' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    if (!isValidUUID(id)) {
      return NextResponse.json({ 
        error: 'Invalid UUID format',
        code: 'INVALID_UUID' 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { email, fullName, role, avatarUrl } = body;

    // Build update object
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and add email if provided
    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return NextResponse.json({ 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL_FORMAT' 
        }, { status: 400 });
      }

      // Check if email is taken by another user
      const emailCheck = await db.select()
        .from(users)
        .where(and(
          eq(users.email, email.toLowerCase().trim()),
          eq(users.id, id)
        ))
        .limit(1);

      if (emailCheck.length === 0) {
        const emailExists = await db.select()
          .from(users)
          .where(eq(users.email, email.toLowerCase().trim()))
          .limit(1);

        if (emailExists.length > 0) {
          return NextResponse.json({ 
            error: 'Email already exists',
            code: 'EMAIL_EXISTS' 
          }, { status: 400 });
        }
      }

      updates.email = email.toLowerCase().trim();
    }

    // Validate and add fullName if provided
    if (fullName !== undefined) {
      if (fullName.trim().length === 0) {
        return NextResponse.json({ 
          error: 'Full name cannot be empty',
          code: 'EMPTY_FULL_NAME' 
        }, { status: 400 });
      }
      updates.fullName = fullName.trim();
    }

    // Validate and add role if provided
    if (role !== undefined) {
      if (!isValidRole(role)) {
        return NextResponse.json({ 
          error: 'Invalid role. Must be one of: user, family, doctor, admin',
          code: 'INVALID_ROLE' 
        }, { status: 400 });
      }
      updates.role = role;
    }

    // Add avatarUrl if provided (can be null)
    if (avatarUrl !== undefined) {
      updates.avatarUrl = avatarUrl;
    }

    // Update user
    const updatedUser = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();

    return NextResponse.json(updatedUser[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: 'Email already exists',
        code: 'EMAIL_EXISTS' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    if (!isValidUUID(id)) {
      return NextResponse.json({ 
        error: 'Invalid ID format',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    // Verify authenticated user matches the user being deleted
    if (authenticatedUser.id !== id) {
      return NextResponse.json({ 
        error: 'You can only delete your own account',
        code: 'FORBIDDEN' 
      }, { status: 403 });
    }

    // Check if user exists in Better Auth user table
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    // CASCADE DELETION: Delete all related data
    
    // 1. Get all capsules owned by this user
    const userCapsules = await db.select({ id: capsules.id })
      .from(capsules)
      .where(eq(capsules.userId, id));

    const capsuleIds = userCapsules.map(c => c.id);

    // 2. Delete capsule files for all user's capsules
    if (capsuleIds.length > 0) {
      for (const capsuleId of capsuleIds) {
        await db.delete(capsuleFiles)
          .where(eq(capsuleFiles.capsuleId, capsuleId));
      }

      // 3. Delete capsule activities for all user's capsules
      for (const capsuleId of capsuleIds) {
        await db.delete(capsuleActivities)
          .where(eq(capsuleActivities.capsuleId, capsuleId));
      }

      // 4. Delete capsule collaborators for all user's capsules
      for (const capsuleId of capsuleIds) {
        await db.delete(capsuleCollaborators)
          .where(eq(capsuleCollaborators.capsuleId, capsuleId));
      }

      // 5. Delete all capsules owned by user
      await db.delete(capsules)
        .where(eq(capsules.userId, id));
    }

    // 6. Delete collaborations where user is a collaborator (not owner)
    await db.delete(capsuleCollaborators)
      .where(eq(capsuleCollaborators.userId, id));

    // 7. Delete all notifications for this user
    await db.delete(notifications)
      .where(eq(notifications.userId, id));

    // 8. Delete activities where user performed actions (on other capsules)
    await db.delete(capsuleActivities)
      .where(eq(capsuleActivities.userId, id));

    // 9. Finally, delete the user record from Better Auth user table
    const deletedUser = await db.delete(user)
      .where(eq(user.id, id))
      .returning();

    return NextResponse.json({ 
      message: 'Account deleted successfully',
      user: deletedUser[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}