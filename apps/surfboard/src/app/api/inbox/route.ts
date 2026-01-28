import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const INBOX_PATH = '/Users/mattia/Projects/Onde/agents/betting/inbox.json';

interface InboxMessage {
  id: string;
  content: string;
  type: 'message' | 'link' | 'command';
  timestamp: string;
  processed: boolean;
}

interface InboxData {
  messages: InboxMessage[];
  lastUpdated: string;
}

async function getInbox(): Promise<InboxData> {
  try {
    if (existsSync(INBOX_PATH)) {
      const data = await readFile(INBOX_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading inbox:', error);
  }
  return { messages: [], lastUpdated: new Date().toISOString() };
}

async function saveInbox(inbox: InboxData): Promise<void> {
  await writeFile(INBOX_PATH, JSON.stringify(inbox, null, 2), 'utf-8');
}

// GET - Retrieve inbox messages
export async function GET() {
  try {
    const inbox = await getInbox();
    return NextResponse.json(inbox);
  } catch (error) {
    console.error('GET inbox error:', error);
    return NextResponse.json(
      { error: 'Failed to read inbox' },
      { status: 500 }
    );
  }
}

// POST - Add new message to inbox
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const inbox = await getInbox();
    
    // Detect message type
    let type: InboxMessage['type'] = 'message';
    if (content.includes('twitter.com') || content.includes('x.com')) {
      type = 'link';
    } else if (content.startsWith('/') || content.startsWith('!')) {
      type = 'command';
    }

    const newMessage: InboxMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      type,
      timestamp: new Date().toISOString(),
      processed: false
    };

    inbox.messages.unshift(newMessage); // Add to beginning
    inbox.lastUpdated = new Date().toISOString();

    // Keep only last 100 messages
    if (inbox.messages.length > 100) {
      inbox.messages = inbox.messages.slice(0, 100);
    }

    await saveInbox(inbox);

    return NextResponse.json({ 
      success: true, 
      message: newMessage 
    });
  } catch (error) {
    console.error('POST inbox error:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

// DELETE - Mark message as processed or delete
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID required' },
        { status: 400 }
      );
    }

    const inbox = await getInbox();
    const messageIndex = inbox.messages.findIndex(m => m.id === id);

    if (messageIndex === -1) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    inbox.messages.splice(messageIndex, 1);
    inbox.lastUpdated = new Date().toISOString();

    await saveInbox(inbox);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE inbox error:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
