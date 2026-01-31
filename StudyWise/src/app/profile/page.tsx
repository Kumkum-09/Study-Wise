'use client';

import { useUser } from '@/firebase';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <PageHeader title="Profile" description="Manage your account details." />
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="size-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader title="Profile" description="Manage your account details." />
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName || 'User avatar'} />
              ) : (
                userAvatar && (
                  <AvatarImage
                    src={userAvatar.imageUrl}
                    alt={userAvatar.description}
                    data-ai-hint={userAvatar.imageHint}
                  />
                )
              )}
              <AvatarFallback className="text-3xl">
                {user?.displayName?.charAt(0).toUpperCase() ||
                  user?.email?.charAt(0).toUpperCase() ||
                  'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user?.displayName || (user?.isAnonymous ? 'Anonymous User' : 'User')}</h2>
              <p className="text-muted-foreground">{user?.email || 'No email provided'}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">User ID</label>
            <p className="font-mono text-sm bg-muted rounded p-2 mt-1 break-all">{user?.uid}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Authentication Method</label>
            <p className="text-sm mt-1">{user?.isAnonymous ? 'Anonymous' : 'Email/Password or Social Provider'}</p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
