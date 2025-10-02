"use client"
import { HeroSection } from "@/components/hero-section"
import { RoomSearch } from "@/components/room-search-new"
import { FeaturedRooms } from "@/components/featured-rooms"
import { ServicesSection } from "@/components/services-section"
import { NearbyAttractions } from "@/components/nearby-attractions"
import { Footer } from "@/components/footer"

export default function MikoHotelHome() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <RoomSearch />
        <FeaturedRooms />
        <section className="py-12 md:py-16 lg:py-20">
          <ServicesSection />
        </section>
        <NearbyAttractions />
      </main>
      <Footer />
    </div>
  )
}
