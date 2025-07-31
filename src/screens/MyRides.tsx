import { useEffect, useMemo, useState } from "react";
import { Car, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getMyDriverRides, acceptRideRequest, declineRideRequest } from "@/integrations/hopin-backend/driver";
import { getMyRideRequests } from "@/integrations/hopin-backend/rider";
import { RidesLoader } from "@/components/myRides/RidesLoader";
import { DriverRidesTab } from "@/components/myRides/DriverRidesTab";
import type { DriverRide, RideRequestItem } from "@/types";
import { RiderRidesTab } from "@/components/myRides/RiderRidesTab";

export default function MyRides() {
  const { user } = useAuth();
  const isDriver = !!user?.is_driver;
  const { toast } = useToast();

  const [driverRides, setDriverRides] = useState<DriverRide[]>([]);
  const [riderBookings, setRiderBookings] = useState<RideRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [driverData, riderData] = await Promise.all([
          isDriver ? getMyDriverRides() : Promise.resolve([]),
          getMyRideRequests(),
        ]);
        setDriverRides(driverData);
        setRiderBookings(riderData);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error Loading Rides",
          description: "Could not fetch your rides or bookings.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [isDriver, toast]);

  const handleRequestAction = async (
    requestId: string,
    action: "accepted" | "declined"
  ) => {
    try {
      await (action === "accepted"
        ? acceptRideRequest(requestId)
        : declineRideRequest(requestId));

      setDriverRides((prev) =>
        prev.map((ride) => ({
          ...ride,
          requests: ride.requests.map((r) =>
            r.id === requestId ? { ...r, status: action } : r
          ),
        }))
      );

      toast({
        title: `Request ${action}`,
        description: `You have ${action} this request.`,
      });
    } catch {
      toast({
        title: "Update Failed",
        description: `Couldn't ${action} the request.`,
        variant: "destructive",
      });
    }
  };

  const orderedDriverRides = useMemo(
    () =>
      [...driverRides].sort(
        (a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
      ),
    [driverRides]
  );

  if (loading) return <RidesLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Car className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">My Rides</h1>
      </div>

      <Tabs defaultValue={isDriver ? "driver" : "rider"}>
        <TabsList className={`grid w-full ${isDriver ? "grid-cols-2" : "grid-cols-1"}`}>
          {isDriver && <TabsTrigger value="driver">As Driver</TabsTrigger>}
          <TabsTrigger value="rider">As Rider</TabsTrigger>
        </TabsList>

        {isDriver && (
          <TabsContent value="driver">
            <DriverRidesTab driverRides={orderedDriverRides} onAction={handleRequestAction} />
          </TabsContent>
        )}
        <TabsContent value="rider">
          <RiderRidesTab rideRequests={riderBookings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}