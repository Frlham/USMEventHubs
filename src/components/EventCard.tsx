'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Laptop, MapPin, Users, Clock, UserCheck } from 'lucide-react';
import type { Event } from '@/types';
import { Badge } from './ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GlowEffect } from './GlowEffect';
import Tilt from 'react-parallax-tilt';


interface EventCardProps {
  event: Event;
}

const toMalaysiaTime = (date: Date) => {
  return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
};

const formatTime = (timeString: string) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');

  const malaysianDate = toMalaysiaTime(new Date());
  malaysianDate.setHours(parseInt(hours, 10));
  malaysianDate.setMinutes(parseInt(minutes, 10));

  return format(malaysianDate, 'p');
};


export default function EventCard({ event }: EventCardProps) {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (user && event.id) {
      const registrationRef = doc(db, 'events', event.id, 'registrations', user.uid);
      const unsubscribe = onSnapshot(registrationRef, (doc) => {
        setIsRegistered(doc.exists());
      }, (error) => {
        // This will likely be a permission error if rules are not set correctly
        // for non-admins. We can safely ignore it and assume not registered.
        setIsRegistered(false);
      });
      return () => unsubscribe();
    } else {
      // Ensure that if user is logged out, we reset the registered state.
      setIsRegistered(false);
    }
  }, [user, event.id]);

  return (
    <div className="relative h-full">
      <Link href={`/event/${event.id}`} className="flex h-full block">
        <GlowEffect hover intensity="medium" className="flex-1 h-full">
          <Tilt
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            perspective={1000}
            scale={1.05}
            transitionSpeed={1000}
            className="h-full w-full"
          >
            <Card className={cn(
              "flex flex-col overflow-hidden h-[500px] transition-all hover:shadow-xl w-full relative",
              isRegistered && "border-accent ring-2 ring-accent"
            )}>
              <div className="relative aspect-video w-full">
                <Image src={event.imageUrl} alt={event.title} fill style={{ objectFit: 'cover' }} />
                <div className="absolute top-2 right-2 flex gap-2">
                  {isRegistered && (
                    <Badge variant="secondary" className="text-sm bg-accent/90 text-accent-foreground">
                      <UserCheck className="h-3 w-3 mr-1.5" />
                      Registered
                    </Badge>
                  )}
                  {event.isFree ? (
                    <Badge variant="secondary" className="text-sm backdrop-blur-md bg-white/80">Free</Badge>
                  ) : event.price ? (
                    <Badge variant="secondary" className="text-sm backdrop-blur-md bg-white/80">RM{event.price.toFixed(2)}</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-sm backdrop-blur-md bg-white/80">Paid</Badge>
                  )}
                  <Badge variant="outline" className="text-sm bg-background/80 backdrop-blur-sm capitalize border-none">
                    {event.eventType === 'online' ? (
                      <Laptop className="h-3 w-3 mr-1.5" />
                    ) : (
                      <Users className="h-3 w-3 mr-1.5" />
                    )}
                    {event.eventType}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-xl line-clamp-1">{event.title}</CardTitle>
                <CardDescription className="flex items-center pt-1 text-sm">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{event.date ? format(toMalaysiaTime(event.date.toDate()), 'EEEE, MMMM d, yyyy') : 'Date not set'}</span>
                </CardDescription>
                <CardDescription className="flex items-center pt-1 text-sm">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                </CardDescription>
                <CardDescription className="flex items-center pt-1 text-sm">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{event.description}</p>
              </CardContent>
              <CardFooter className="mt-auto">
                <span className="text-sm font-semibold text-primary">Read More</span>
              </CardFooter>
            </Card>
          </Tilt>
        </GlowEffect>
      </Link>
    </div>
  );
}
