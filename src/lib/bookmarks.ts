
'use client';

export interface BookmarkedMessage {
  bookmarkId: string; // Unique ID for the bookmark itself
  originalMessageId: string; // ID of the message from the chat
  assistantResponse: string; // Assistant's message content
  userPrompt: string; // The user's message/question that prompted this response
  source: 'AI Q&A Chat' | 'Topic AI Tutor' | 'Chat Support (General)';
  context?: { // Optional context, e.g., for Topic Tutor
    subject?: string;
    topic?: string;
  };
  bookmarkedAt: string; // ISO string timestamp
}

const BOOKMARKS_KEY = 'prepPalAiBookmarks';

export function getBookmarks(): BookmarkedMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const storedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
    return storedBookmarks ? JSON.parse(storedBookmarks) : [];
  } catch (error) {
    console.error("Error parsing bookmarks from localStorage:", error);
    return [];
  }
}

export function addBookmark(
  assistantMessage: { id: string; content: string },
  userMessagesHistory: Array<{ id: string; role: 'user' | 'assistant'; content: string }>,
  source: BookmarkedMessage['source'],
  context?: BookmarkedMessage['context']
): BookmarkedMessage[] {
  const bookmarks = getBookmarks();
  
  let userPrompt = "User's question context not found.";
  // Find the user message that immediately preceded the assistant's response in the current session
  const assistantMessageIndex = userMessagesHistory.findIndex(msg => msg.id === assistantMessage.id && msg.role === 'assistant');
  if (assistantMessageIndex > 0) {
    for (let i = assistantMessageIndex - 1; i >= 0; i--) {
      if (userMessagesHistory[i].role === 'user') {
        userPrompt = userMessagesHistory[i].content;
        break;
      }
    }
  }

  const newBookmark: BookmarkedMessage = {
    bookmarkId: `bookmark_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    originalMessageId: assistantMessage.id,
    assistantResponse: assistantMessage.content,
    userPrompt,
    source,
    context,
    bookmarkedAt: new Date().toISOString(),
  };

  // Prevent duplicate bookmarks based on originalMessageId and source effectively
  if (bookmarks.some(b => b.originalMessageId === newBookmark.originalMessageId && b.source === newBookmark.source && b.assistantResponse === newBookmark.assistantResponse)) {
    return bookmarks; // Already bookmarked
  }

  const updatedBookmarks = [...bookmarks, newBookmark];
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
  return updatedBookmarks;
}

export function removeBookmark(bookmarkIdToRemove: string): BookmarkedMessage[] {
  let bookmarks = getBookmarks();
  bookmarks = bookmarks.filter(b => b.bookmarkId !== bookmarkIdToRemove);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  return bookmarks;
}

// This function helps find a bookmarkId if we only have the original message details
export function findBookmarkId(originalMessageId: string, source: BookmarkedMessage['source']): string | undefined {
    const bookmarks = getBookmarks();
    const foundBookmark = bookmarks.find(b => b.originalMessageId === originalMessageId && b.source === source);
    return foundBookmark?.bookmarkId;
}

export function isMessageBookmarked(originalMessageId: string, source: BookmarkedMessage['source']): boolean {
  return !!findBookmarkId(originalMessageId, source);
}
