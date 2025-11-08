import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { capsuleFiles, capsules, user, capsuleCollaborators } from '@/db/schema';
import { eq, like, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authenticatedUser = await getCurrentUser(request);
    if (!authenticatedUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const capsuleId = searchParams.get('capsuleId');

    // Single file by ID
    if (id) {
      const file = await db.select()
        .from(capsuleFiles)
        .where(eq(capsuleFiles.id, id))
        .limit(1);

      if (file.length === 0) {
        return NextResponse.json({ 
          error: 'File not found',
          code: 'FILE_NOT_FOUND' 
        }, { status: 404 });
      }

      // Verify user has access to the capsule
      const capsule = await db.select()
        .from(capsules)
        .where(eq(capsules.id, file[0].capsuleId))
        .limit(1);

      if (capsule.length === 0) {
        return NextResponse.json({ 
          error: 'Capsule not found',
          code: 'CAPSULE_NOT_FOUND' 
        }, { status: 404 });
      }

      // Check if user owns capsule or is a collaborator
      const isOwner = capsule[0].userId === authenticatedUser.id;
      const isCollaborator = await db.select()
        .from(capsuleCollaborators)
        .where(and(
          eq(capsuleCollaborators.capsuleId, file[0].capsuleId),
          eq(capsuleCollaborators.userId, authenticatedUser.id)
        ))
        .limit(1);

      if (!isOwner && isCollaborator.length === 0) {
        return NextResponse.json({ 
          error: 'Access denied to this capsule',
          code: 'ACCESS_DENIED' 
        }, { status: 403 });
      }

      return NextResponse.json(file[0], { status: 200 });
    }

    // List files with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const uploadedBy = searchParams.get('uploadedBy');

    // If capsuleId is provided, verify user has access
    if (capsuleId) {
      const capsule = await db.select()
        .from(capsules)
        .where(eq(capsules.id, capsuleId))
        .limit(1);

      if (capsule.length === 0) {
        return NextResponse.json({ 
          error: 'Capsule not found',
          code: 'CAPSULE_NOT_FOUND' 
        }, { status: 404 });
      }

      // Check if user owns capsule or is a collaborator
      const isOwner = capsule[0].userId === authenticatedUser.id;
      const isCollaborator = await db.select()
        .from(capsuleCollaborators)
        .where(and(
          eq(capsuleCollaborators.capsuleId, capsuleId),
          eq(capsuleCollaborators.userId, authenticatedUser.id)
        ))
        .limit(1);

      if (!isOwner && isCollaborator.length === 0) {
        return NextResponse.json({ 
          error: 'Access denied to this capsule',
          code: 'ACCESS_DENIED' 
        }, { status: 403 });
      }
    }

    let query = db.select().from(capsuleFiles);

    // Build WHERE conditions
    const conditions = [];

    if (capsuleId) {
      conditions.push(eq(capsuleFiles.capsuleId, capsuleId));
    }

    if (uploadedBy) {
      conditions.push(eq(capsuleFiles.uploadedBy, uploadedBy));
    }

    if (search) {
      conditions.push(like(capsuleFiles.fileName, `%${search}%`));
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
    const { capsuleId, fileName, fileType, fileSize, fileUrl, thumbnailUrl, uploadedBy } = body;

    // Validate required fields
    if (!capsuleId) {
      return NextResponse.json({ 
        error: 'capsuleId is required',
        code: 'MISSING_CAPSULE_ID' 
      }, { status: 400 });
    }

    if (!fileName || fileName.trim() === '') {
      return NextResponse.json({ 
        error: 'fileName is required and cannot be empty',
        code: 'MISSING_FILE_NAME' 
      }, { status: 400 });
    }

    if (!fileType || fileType.trim() === '') {
      return NextResponse.json({ 
        error: 'fileType is required and cannot be empty',
        code: 'MISSING_FILE_TYPE' 
      }, { status: 400 });
    }

    if (!fileSize) {
      return NextResponse.json({ 
        error: 'fileSize is required',
        code: 'MISSING_FILE_SIZE' 
      }, { status: 400 });
    }

    if (!Number.isInteger(fileSize) || fileSize <= 0) {
      return NextResponse.json({ 
        error: 'fileSize must be a positive integer',
        code: 'INVALID_FILE_SIZE' 
      }, { status: 400 });
    }

    if (!fileUrl || fileUrl.trim() === '') {
      return NextResponse.json({ 
        error: 'fileUrl is required and cannot be empty',
        code: 'MISSING_FILE_URL' 
      }, { status: 400 });
    }

    if (!uploadedBy || typeof uploadedBy !== 'string' || uploadedBy.trim() === '') {
      return NextResponse.json({ 
        error: 'uploadedBy is required and must be a valid user ID',
        code: 'MISSING_UPLOADED_BY' 
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

    // Validate uploadedBy exists in user table (better-auth table)
    const userExists = await db.select()
      .from(user)
      .where(eq(user.id, uploadedBy.trim()))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 400 });
    }

    // Create file record
    const newFile = await db.insert(capsuleFiles)
      .values({
        id: randomUUID(),
        capsuleId: capsuleId.trim(),
        fileName: fileName.trim(),
        fileType: fileType.trim(),
        fileSize,
        fileUrl: fileUrl.trim(),
        thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : null,
        uploadedBy: uploadedBy.trim(),
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newFile[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: 'ID is required',
        code: 'MISSING_ID' 
      }, { status: 400 });
    }

    // Check if file exists
    const existingFile = await db.select()
      .from(capsuleFiles)
      .where(eq(capsuleFiles.id, id))
      .limit(1);

    if (existingFile.length === 0) {
      return NextResponse.json({ 
        error: 'File not found',
        code: 'FILE_NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { fileName, thumbnailUrl } = body;

    // Validate fileName if provided
    if (fileName !== undefined && (typeof fileName !== 'string' || fileName.trim() === '')) {
      return NextResponse.json({ 
        error: 'fileName cannot be empty if provided',
        code: 'INVALID_FILE_NAME' 
      }, { status: 400 });
    }

    // Build update object
    const updates: any = {};

    if (fileName !== undefined) {
      updates.fileName = fileName.trim();
    }

    if (thumbnailUrl !== undefined) {
      updates.thumbnailUrl = thumbnailUrl ? thumbnailUrl.trim() : null;
    }

    // Update file
    const updated = await db.update(capsuleFiles)
      .set(updates)
      .where(eq(capsuleFiles.id, id))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
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
        error: 'ID is required',
        code: 'MISSING_ID' 
      }, { status: 400 });
    }

    // Check if file exists
    const existingFile = await db.select()
      .from(capsuleFiles)
      .where(eq(capsuleFiles.id, id))
      .limit(1);

    if (existingFile.length === 0) {
      return NextResponse.json({ 
        error: 'File not found',
        code: 'FILE_NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete file
    const deleted = await db.delete(capsuleFiles)
      .where(eq(capsuleFiles.id, id))
      .returning();

    return NextResponse.json({ 
      message: 'File deleted successfully',
      file: deleted[0] 
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}