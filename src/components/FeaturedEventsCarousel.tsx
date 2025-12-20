'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Event } from '@/types';
import { Button } from './ui/button';

interface FeaturedEventsCarouselProps {
    events: Event[];
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

export function FeaturedEventsCarousel({ events }: FeaturedEventsCarouselProps) {
    const [activeSlide, setActiveSlide] = useState(0);
    const featuredEvents = events.slice(0, 5); // Limit to top 5

    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 6000); // Increased duration slightly for better readability
        return () => clearInterval(interval);
    }, [activeSlide]);

    if (featuredEvents.length === 0) return null;

    const handleNext = () => {
        setActiveSlide((prev) => (prev + 1) % featuredEvents.length);
    };

    const handlePrev = () => {
        setActiveSlide((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
    };

    const activeEvent = featuredEvents[activeSlide];

    return (
        <div className="relative w-full min-h-[800px] md:min-h-[600px] h-auto overflow-hidden rounded-[2rem] font-sans group flex flex-col md:flex-row bg-transparent">

            {/* 
                CONTENT GRID
            */}
            <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center gap-8 md:gap-12 p-6 md:p-12">

                {/* --- LEFT COLUMN: INFO (Order 2 on mobile to show image first? No, Title first is usually better for context) --- */}
                {/* Actually, let's keep text top on mobile as originally intended, but ensure no overlap */}
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6 md:space-y-8 z-20 pt-4 md:pt-0 shrink-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeEvent.id + "-info"}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="space-y-4 md:space-y-6"
                        >
                            <div className="flex flex-wrap gap-3 mb-2">
                                {/* Status Badge */}
                                <div className={cn(
                                    "inline-flex items-center gap-2 px-3 py-1 rounded-full border w-fit",
                                    activeSlide === 0
                                        ? "bg-red-500/10 border-red-500/20 text-red-200"
                                        : "bg-purple-500/10 border-purple-500/20 text-purple-200"
                                )}>
                                    <span className="relative flex h-2 w-2">
                                        <span className={cn(
                                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                                            activeSlide === 0 ? "bg-red-400" : "bg-purple-400"
                                        )}></span>
                                        <span className={cn(
                                            "relative inline-flex rounded-full h-2 w-2",
                                            activeSlide === 0 ? "bg-red-500" : "bg-purple-500"
                                        )}></span>
                                    </span>
                                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">
                                        {activeSlide === 0 ? 'Nearest Event' : 'Upcoming Event'}
                                    </span>
                                </div>

                                {/* Countdown/Timing Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">
                                        {(() => {
                                            if (!activeEvent.date) return 'Date TBA';
                                            const eventDate = toMalaysiaTime(activeEvent.date.toDate());
                                            const now = toMalaysiaTime(new Date());

                                            const daysDiff = differenceInDays(eventDate, now);
                                            const hoursDiff = differenceInHours(eventDate, now);

                                            if (hoursDiff <= 0) return 'Happening Now';
                                            if (daysDiff === 0) {
                                                return `In ${hoursDiff} Hours`;
                                            }
                                            if (daysDiff === 1) return 'Tomorrow';
                                            return `In ${daysDiff} Days`;
                                        })()}
                                    </span>
                                </div>


                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                                {activeEvent.title}
                            </h1>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs md:text-sm border-l-2 border-purple-500 pl-4">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2 text-purple-400 font-bold">
                                        <Calendar className="w-3 h-3 md:w-4 md:h-4" /> Date
                                    </div>
                                    <p className="text-gray-100 font-medium">
                                        {activeEvent.date ? format(toMalaysiaTime(activeEvent.date.toDate()), 'MMM d, yyyy') : 'TBA'}
                                    </p>
                                </div>

                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2 text-purple-400 font-bold">
                                        <Clock className="w-3 h-3 md:w-4 md:h-4" /> Time
                                    </div>
                                    <p className="text-gray-100 font-medium">
                                        {formatTime(activeEvent.startTime)}
                                    </p>
                                </div>

                                <div className="space-y-0.5 col-span-2">
                                    <div className="flex items-center gap-2 text-purple-400 font-bold">
                                        <MapPin className="w-3 h-3 md:w-4 md:h-4" /> Location
                                    </div>
                                    <p className="text-gray-100 font-medium truncate">
                                        {activeEvent.location}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm md:text-base text-gray-400 leading-relaxed line-clamp-3 md:line-clamp-4 max-w-lg">
                                {activeEvent.description}
                            </p>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link href={`/event/${activeEvent.id}`} className="flex-1 sm:flex-none">
                                    <Button className="w-full h-12 px-6 rounded-full bg-white text-black hover:bg-gray-100 font-bold text-sm md:text-base">
                                        Register Now <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrev}
                                        className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center text-white bg-black/20 hover:bg-white/10 backdrop-blur-md"
                                        aria-label="Previous Slide"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center text-white bg-black/20 hover:bg-white/10 backdrop-blur-md"
                                        aria-label="Next Slide"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* --- RIGHT COLUMN: VISUALS (Cards) --- */}
                {/* Explicit height on mobile to ensure cards are visible */}
                <div className="w-full md:w-1/2 h-[350px] md:h-full relative flex items-center justify-center perspective-[2000px] mt-4 md:mt-0">
                    <AnimatePresence initial={false}>
                        {featuredEvents.map((event, index) => {
                            // Calculate cyclically
                            let offset = index - activeSlide;
                            if (offset < 0) offset += featuredEvents.length;

                            // Only render relevant cards
                            if (offset > 2) return null;

                            return (
                                <motion.div
                                    key={event.id}
                                    className={cn(
                                        "absolute top-1/2 left-1/2 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900 origin-bottom",
                                        // Mobile: Smaller cards | Desktop: Larger
                                        "w-[260px] h-[340px] md:w-[380px] md:h-[480px]"
                                    )}
                                    // Adjust initial/animate states to center properly
                                    initial={{
                                        scale: 0.9,
                                        x: "-50%",
                                        y: "-50%",
                                        opacity: 0,
                                        rotateX: 10
                                    }}
                                    animate={{
                                        scale: offset === 0 ? 1 : 1 - (offset * 0.1),
                                        x: `calc(-50% + ${offset * 30}px)`, // Tighter stacking
                                        y: `calc(-50% - ${offset * 10}px)`,
                                        rotateZ: offset * 3,
                                        rotateX: 0,
                                        opacity: offset === 0 ? 1 : 0.6 - (offset * 0.1),
                                        zIndex: 50 - offset,
                                        filter: offset === 0 ? 'brightness(1)' : 'brightness(0.5) blur(1px)'
                                    }}
                                    exit={{
                                        scale: 1.1,
                                        x: "-150%",
                                        opacity: 0,
                                        transition: { duration: 0.5 }
                                    }}
                                    transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                                >
                                    <Image
                                        src={event.imageUrl}
                                        alt={event.title}
                                        fill
                                        className="object-cover"
                                        priority={offset === 0}
                                    />

                                    {offset === 0 && (
                                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                            <span className="bg-white/95 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                {event.isFree ? 'FREE' : `RM ${event.price}`}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>


        </div>
    );
}
