import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const fileName = `tournament-${timestamp}.${fileExtension}`;

    // Try Supabase Storage first (works on Vercel)
    try {
      if (!supabaseAdmin) throw new Error('Supabase admin client not available');

      // Ensure bucket exists
      const bucket = 'tournament-banners';
      const { data: buckets } = await (supabaseAdmin as any).storage.listBuckets();
      const exists = (buckets || []).some((b: any) => b.name === bucket);
      if (!exists) {
        await (supabaseAdmin as any).storage.createBucket(bucket, { public: true });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePathInBucket = `${new Date().getFullYear()}/${fileName}`;

      const { error: uploadError } = await (supabaseAdmin as any).storage
        .from(bucket)
        .upload(filePathInBucket, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = (supabaseAdmin as any).storage
        .from(bucket)
        .getPublicUrl(filePathInBucket);

      return NextResponse.json({
        success: true,
        url: publicUrlData.publicUrl,
        filename: fileName,
        storage: 'supabase'
      });
    } catch (cloudErr) {
      // Fallback to local filesystem for dev/local
      console.warn('Supabase Storage upload failed, falling back to local FS:', cloudErr);

      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch {}

      const filePath = join(uploadsDir, fileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${fileName}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: fileName,
        storage: 'local'
      });
    }
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
