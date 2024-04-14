// @/app/(component)/carousel.tsx
"use client"
import * as React from "react";
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay";

import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

export function CarouselPlugin() {
    const plugin = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true })
    );

    return (
        <>
            <span className="text-3xl font-semibold">{"My admin panel (view only)"}</span>
            <div className="my-4 md:my-8"></div>
            <div className="flex justify-center w-full">
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    orientation="vertical"
                    plugins={[plugin.current]}
                    className="w-full max-w-screen-lg"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                >
                    <CarouselContent className="-mt-1 h-[50vh] sm:h-[70vh] md:h-[90vh] lg:h-[100vh] xl:h-[760px]">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <CarouselItem key={index} className="pt-1">
                                <div className="p-1">
                                    <Card>
                                        <CardContent className="flex items-center justify-center p-6">
                                            <Image
                                                src={`/admin_${index + 1}.png`}
                                                alt={`Admin Dashboard ${index + 1}`}
                                                width={1388}
                                                height={937}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
            <div className="mb-4 md:mb-8"></div>
        </>
    );
}
