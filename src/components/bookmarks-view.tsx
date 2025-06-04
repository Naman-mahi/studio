
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBookmarks, removeBookmark, type BookmarkedMessage } from "@/lib/bookmarks";
import { Bookmark, BookmarkCheck, Trash2, MessageSquare, User, GraduationCap, NewspaperIcon, HelpCircleIcon } from "lucide-react";
import { format, parseISO } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";

const getSourceIcon = (source: BookmarkedMessage['source']) => {
  switch (source) {
    case 'AI Q&A Chat':
      return <HelpCircleIcon className="h-5 w-5 text-blue-500" />;
    case 'Topic AI Tutor':
      return <GraduationCap className="h-5 w-5 text-purple-500" />;
    case 'Chat Support (General)':
      return <MessageSquare className="h-5 w-5 text-green-500" />;
    default:
      return <Bookmark className="h-5 w-5 text-gray-500" />;
  }
};

export default function BookmarksView() {
  const [bookmarks, setBookmarks] = useState<BookmarkedMessage[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setBookmarks(getBookmarks());
    }
  }, []);

  const handleRemoveBookmark = (bookmarkId: string) => {
    const updatedBookmarks = removeBookmark(bookmarkId);
    setBookmarks(updatedBookmarks);
    toast.success("Bookmark removed!");
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-headline font-bold">My Bookmarks</h1>
        </div>
        <p className="text-muted-foreground">Loading bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookmarkCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold">My Bookmarks</h1>
      </div>

      {bookmarks.length === 0 ? (
        <Card className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
          <CardContent className="pt-6 text-center">
            <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No bookmarks yet.</p>
            <p className="text-sm text-muted-foreground">
              You can bookmark helpful AI responses from the chat sections.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookmarks.sort((a,b) => parseISO(b.bookmarkedAt).getTime() - parseISO(a.bookmarkedAt).getTime()).map((bookmark) => (
            <Card key={bookmark.bookmarkId} className="shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out overflow-hidden">
              <CardHeader className="bg-muted/30 dark:bg-muted/20 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                      {getSourceIcon(bookmark.source)}
                      {bookmark.source}
                      {bookmark.context?.topic && (
                        <span className="text-sm font-normal text-muted-foreground">
                          ({bookmark.context.subject} - {bookmark.context.topic})
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Bookmarked on: {format(parseISO(bookmark.bookmarkedAt), "MMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </div>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Bookmark?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this bookmark? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveBookmark(bookmark.bookmarkId)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <User size={16} /> You asked:
                  </p>
                  <p className="text-sm pl-5 italic whitespace-pre-wrap bg-secondary/30 p-2 rounded-md">{bookmark.userPrompt}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                     {getSourceIcon(bookmark.source)} AI Responded:
                  </p>
                  <p className="text-sm pl-5 whitespace-pre-wrap bg-primary/5 p-2 rounded-md">{bookmark.assistantResponse}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
