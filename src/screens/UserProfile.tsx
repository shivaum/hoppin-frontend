import { useState, useEffect } from "react";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  User as UserIcon, 
  Star, 
  Car, 
  Users, 
  Edit, 
  Save,
  Camera,
  Phone,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import LicenseUploadForm from "../components/profile/LicenseUploadForm";

export default function UserProfile() {
  const { toast } = useToast();
  const { user: authUser, updateUserProfile } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  // Initialize user data from auth context
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setEditedUser(authUser);
    }
  }, [authUser]);

  const handleSaveProfile = async () => {
    if (!editedUser) return;
    
    try {
      await updateUserProfile(editedUser);
      setUser(editedUser);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "There was a problem updating your profile",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const updateField = (field: keyof User, value: any) => {
    setEditedUser(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <UserIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo & Basic Info */}
          <div className="flex items-start space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={editedUser?.photo || ""} alt={editedUser?.name || ""} />
                <AvatarFallback className="text-lg">{editedUser?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={editedUser?.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editedUser?.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="(805) 555-0123"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{user?.email || "Email not available"}</span>
                    </div>
                    {user?.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Driver Status */}
          {user?.is_driver ? (
            <Card className="p-4 border border-green-500 bg-green-50 text-green-700">
              <div className="text-sm font-medium">✅ You have been verified to drive</div>
            </Card>
          ) : (
            <LicenseUploadForm />
          )}
        </CardContent>
      </Card>

      {/* Stats & Ratings */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Rating & Reviews</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">{user?.rating || 0}</div>
              <div className="flex items-center justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(user?.rating || 0) 
                        ? 'text-secondary fill-secondary' 
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {user?.total_rides || 0} rides
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Ride Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Rides</span>
                <Badge variant="outline">{user?.total_rides || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">As Driver</span>
                <Badge variant="outline">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">As Rider</span>
                <Badge variant="outline">7</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="text-sm">Sep 2023</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "1",
                reviewer: "Sarah Chen",
                rating: 5,
                comment: "Great driver! Very punctual and friendly. Smooth ride to the airport.",
                date: "2 days ago"
              },
              {
                id: "2",
                reviewer: "Mike Rodriguez",
                rating: 4,
                comment: "Good ride, appreciated the flexibility with pickup location.",
                date: "1 week ago"
              },
              {
                id: "3",
                reviewer: "Emma Johnson",
                rating: 5,
                comment: "Jordan was super helpful and made the ride enjoyable. Highly recommend!",
                date: "2 weeks ago"
              }
            ].map((review) => (
              <div key={review.id} className="border-b border-border pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{review.reviewer.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{review.reviewer}</h4>
                      <div className="flex items-center space-x-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-secondary fill-secondary" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety & Verification */}
      <Card className="border-success/20 bg-success/5">
        <CardHeader>
          <CardTitle className="text-success">Safety & Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm">Cal Poly email verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm">Phone number verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <span className="text-sm text-muted-foreground">Driver's license verification (optional)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}