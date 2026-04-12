import { NextResponse } from 'next/server';
import { getAllStyles } from '@/lib/supabase-styles';

export async function GET() {
  try {
    const styles = await getAllStyles();
    return NextResponse.json({ styles });
  } catch (e) {
    console.error('GET /api/styles:', e);
    return NextResponse.json({ styles: [] });
  }
}
