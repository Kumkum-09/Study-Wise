'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpenCheck,
  CalendarCheck,
  Home,
  ListTodo,
  User as UserIcon,
} from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/layout/header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useUser, useAuth, initiateAnonymousSignIn } from '@/firebase';
import { signOut } from 'firebase/auth';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/planner', icon: CalendarCheck, label: 'AI Planner' },
  { href: '/profile', icon: UserIcon, label: 'Profile' },
];

export const AppLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (auth && !isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="size-8 text-primary" />
            <span className="text-lg font-semibold">StudyWise</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto w-full justify-start p-2"
              >
                <div className="flex w-full items-center gap-2">
                  <Avatar className="size-8">
                    {user?.photoURL ? (
                      <AvatarImage
                        src={user.photoURL}
                        alt={user.displayName || 'User avatar'}
                      />
                    ) : (
                      userAvatar && (
                        <AvatarImage
                          src={userAvatar.imageUrl}
                          alt={userAvatar.description}
                          data-ai-hint={userAvatar.imageHint}
                        />
                      )
                    )}
                    <AvatarFallback>
                      {user?.displayName?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase() ||
                        'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start truncate">
                    <span className="font-medium">
                      {user?.displayName ||
                        (user?.isAnonymous ? 'Anonymous User' : 'User')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email || ''}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" side="top">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

const NavItem = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) => {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isActive = pathname === href;

  return (
    <SidebarMenuItem>
      <Link href={href}>
        <SidebarMenuButton
          isActive={isActive}
          className={cn(state === 'collapsed' && 'p-2')}
          tooltip={label}
        >
          <Icon />
          <span>{label}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
};
