// src/components/SearchRides.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import RideCard from "../components/searchRides/RideCard";
import { useToast } from "@/hooks/use-toast";
import {
  searchRides as backendSearchRides,
  getMyRideRequests,
} from "@/integrations/hopin-backend/rider";
import { SearchRide, Ride } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface SearchRidesProps {
  onRequestRide?: (rideId: string, message?: string) => void;
}

export default function SearchRides({ onRequestRide }: SearchRidesProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [rides, setRides] = useState<Ride[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [myRequestsMap, setMyRequestsMap] = useState<Record<string, string>>({});

  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const googleLoaded = !!window.google?.maps?.places;

  // Autocomplete
  useEffect(() => {
    if (!googleLoaded) return;
    const opts: google.maps.places.AutocompleteOptions = {
      types: ["geocode"],
      componentRestrictions: { country: "us" },
    };
    const attach = (ref: React.RefObject<HTMLInputElement>, setter: (v: string) => void) => {
      if (!ref.current) return;
      const ac = new google.maps.places.Autocomplete(ref.current, opts);
      ac.addListener("place_changed", () => {
        const p = ac.getPlace();
        setter(p.formatted_address || p.name || "");
      });
    };
    attach(fromRef, setFromText);
    attach(toRef, setToText);
  }, [googleLoaded]);

  // Fetch my existing requests
  useEffect(() => {
    getMyRideRequests()
      .then(reqs => {
        const map: Record<string, string> = {};
        reqs.forEach(r => { map[r.ride_id] = r.status; });
        setMyRequestsMap(map);
      })
      .catch(e => console.error("Could not load my ride requests", e));
  }, []);

  // Map backend SearchRide -> UI Ride
  const mapToRide = useCallback((r: SearchRide): Ride => ({
    id: r.ride_id,
    startLocation: r.start_location,
    endLocation: r.end_location,
    departureTime: r.departure_time,
    availableSeats: r.available_seats,
    pricePerSeat: r.price_per_seat,
    status: r.status,
    requests: [],
    driver: {
      name: r.driver.name,
      photo: r.driver.photo,
      rating: r.driver.rating,
      totalRides: r.driver.total_rides ?? 0,
    },
    driverId: r.driver_id,
  } as Ride), []);

  // Search handling
  const handleSearch = useCallback(async () => {
    if (!fromText || !toText) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await backendSearchRides(fromText, toText);
      const mapped = results.map(mapToRide);
      setRides(mapped);
      if (!mapped.length) {
        toast({ title: "No rides found", description: "Try different areas or times." });
      }
    } catch (err: any) {
      toast({ title: "Search failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  }, [fromText, toText, mapToRide, toast]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            <span>Find a Ride</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!googleLoaded && <p className="text-sm text-muted-foreground">Loading location autocomplete…</p>}

          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="From (e.g., Cal Poly Campus)"
              ref={fromRef}
              value={fromText}
              onChange={e => setFromText(e.target.value)}
              className="pl-10"
              disabled={!googleLoaded}
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="To (e.g., SLO Airport)"
              ref={toRef}
              value={toText}
              onChange={e => setToText(e.target.value)}
              className="pl-10"
              disabled={!googleLoaded}
            />
          </div>

          <Button onClick={handleSearch} className="w-full" disabled={isSearching || !fromText || !toText}>
            {isSearching ? "Searching..." : "Search Rides"}
          </Button>
        </CardContent>
      </Card>

      {isSearching && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Finding rides for you...</p>
        </div>
      )}

      {rides.length > 0 && !isSearching && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Found {rides.length} ride{rides.length !== 1 ? "s" : ""}
          </h2>
          <div className="space-y-4">
            {rides.map(r => (
              <RideCard
                key={r.id}
                ride={r}
                onRequestRide={onRequestRide}
                myProfileId={user?.id}
                myRequestStatus={myRequestsMap[r.id] || null}
              />
            ))}
          </div>
        </div>
      )}

      {!isSearching && hasSearched && rides.length === 0 && fromText && toText && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No rides found for your search. Try adjusting your locations or check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}