// src/components/OfferRide.tsx
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Car, MapPin, Clock, Users, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createRide } from "@/integrations/hopin-backend/driver";

interface RideFormState {
  startLocation: string;
  endLocation: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  startLat: number | null;
  startLng: number | null;
  endLat: number | null;
  endLng: number | null;
}

export default function OfferRide() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rideData, setRideData] = useState<RideFormState>({
    startLocation: "",
    endLocation: "",
    departureDate: "",
    departureTime: "",
    availableSeats: 1,
    pricePerSeat: 0,
    startLat: null,
    startLng: null,
    endLat: null,
    endLng: null,
  });

  const startInputRef = useRef<HTMLInputElement | null>(null);
  const endInputRef = useRef<HTMLInputElement | null>(null);

  // Attach Google Autocomplete
  useEffect(() => {
    if (!window.google?.maps?.places) return;

    const attach = (
      ref: HTMLInputElement | null,
      onSelect: (loc: string, lat: number, lng: number) => void
    ) => {
      if (!ref) return;
      const ac = new google.maps.places.Autocomplete(ref, {
        types: ["geocode"],
        componentRestrictions: { country: "us" },
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place?.geometry) return;
        onSelect(
          place.formatted_address || place.name || ref.value,
          place.geometry.location.lat(),
          place.geometry.location.lng()
        );
      });
    };

    attach(startInputRef.current, (location, lat, lng) =>
      setRideData((p) => ({ ...p, startLocation: location, startLat: lat, startLng: lng }))
    );
    attach(endInputRef.current, (location, lat, lng) =>
      setRideData((p) => ({ ...p, endLocation: location, endLat: lat, endLng: lng }))
    );
  }, []);

  const updateField = (field: keyof RideFormState, value: any) =>
    setRideData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const iso = new Date(
      `${rideData.departureDate}T${rideData.departureTime}`
    ).toISOString();

    if (
      rideData.startLat == null ||
      rideData.startLng == null ||
      rideData.endLat == null ||
      rideData.endLng == null
    ) {
      toast({
        title: "Please pick from suggestions",
        description: "We need precise coordinates.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await createRide({
        startLocation: rideData.startLocation,
        endLocation: rideData.endLocation,
        departureTime: iso,
        availableSeats: rideData.availableSeats,
        pricePerSeat: rideData.pricePerSeat,
        startLat: rideData.startLat,
        startLng: rideData.startLng,
        endLat: rideData.endLat,
        endLng: rideData.endLng,
        status: "available",
      });

      toast({
        title: "Ride Offered Successfully!",
        description: "Your ride has been posted.",
      });

      setRideData({
        startLocation: "",
        endLocation: "",
        departureDate: "",
        departureTime: "",
        availableSeats: 1,
        pricePerSeat: 0,
        startLat: null,
        startLng: null,
        endLat: null,
        endLng: null,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error Offering Ride",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="h-5 w-5" />
            <span>Offer a Ride</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Route Details</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="startLocation">Pickup</Label>
                  <Input
                    id="startLocation"
                    ref={startInputRef}
                    placeholder="Cal Poly Library"
                    value={rideData.startLocation}
                    onChange={(e) => updateField("startLocation", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endLocation">Destination</Label>
                  <Input
                    id="endLocation"
                    ref={endInputRef}
                    placeholder="Downtown SLO"
                    value={rideData.endLocation}
                    onChange={(e) => updateField("endLocation", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Departure</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="departureDate">Date</Label>
                  <Input
                    id="departureDate"
                    type="date"
                    value={rideData.departureDate}
                    onChange={(e) => updateField("departureDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="departureTime">Time</Label>
                  <Input
                    id="departureTime"
                    type="time"
                    value={rideData.departureTime}
                    onChange={(e) => updateField("departureTime", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Pricing */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Seats & Price</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="availableSeats">Seats</Label>
                  <Input
                    id="availableSeats"
                    type="number"
                    min={1}
                    max={7}
                    value={rideData.availableSeats}
                    onChange={(e) =>
                      updateField("availableSeats", parseInt(e.target.value) || 1)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerSeat">Price ($)</Label>
                  <Input
                    id="pricePerSeat"
                    type="number"
                    min={0}
                    step={0.5}
                    value={rideData.pricePerSeat}
                    onChange={(e) =>
                      updateField("pricePerSeat", parseFloat(e.target.value) || 0)
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Posting Ride...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Offer This Ride
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}