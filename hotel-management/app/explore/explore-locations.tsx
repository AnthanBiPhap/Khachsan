"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star } from "lucide-react";
import Image from "next/image";

type Location = {
  _id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  images: string[];
  ratingAvg: number;
};

export function ExploreLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/locations');
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu địa điểm');
        }
        const data = await response.json();
        setLocations(data.data.locations);
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải dữ liệu');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <div className="flex items-center">
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Khám phá xung quanh
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Những địa điểm tham quan hấp dẫn gần khách sạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location) => (
            <Card key={location._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image
                  src={location.images[0] || '/placeholder-location.jpg'}
                  alt={location.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{location.name}</CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {location.address}
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(location.ratingAvg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    ({location.ratingAvg.toFixed(1)})
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3">{location.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
