import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Users, MapPin, Shield, Clock, DollarSign, LogIn } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Car,
      title: "Share Rides",
      description: "Offer rides to fellow Cal Poly students and split costs"
    },
    {
      icon: MapPin,
      title: "Find Rides",
      description: "Search for rides to campus, airport, or anywhere in SLO"
    },
    {
      icon: Users,
      title: "Student Community",
      description: "Connect with verified Cal Poly students only"
    },
    {
      icon: Shield,
      title: "Safe & Trusted",
      description: "Ratings and reviews keep our community safe"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Welcome to{" "}
              <span className="text-primary">Hopin SLO</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              The rideshare app built for Cal Poly students
            </p>
            
            <div className="relative max-w-2xl mx-auto mb-8">
              <img 
                src={heroImage}
                alt="Cal Poly students sharing rides"
                className="w-full rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className={`transition-all duration-300 hover:shadow-lg cursor-pointer ${
                    currentFeature === index 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">1,200+</div>
              <div className="text-sm text-muted-foreground">Rides Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">4.8★</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>

          {/* How It Works */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-center mb-6">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary-foreground">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Search or Offer</h3>
                  <p className="text-sm text-muted-foreground">
                    Find a ride that matches your route or offer seats in your car
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-secondary-foreground">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Connect & Confirm</h3>
                  <p className="text-sm text-muted-foreground">
                    Message your driver or riders to coordinate pickup details
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-success-foreground">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Ride & Rate</h3>
                  <p className="text-sm text-muted-foreground">
                    Enjoy your ride and rate your experience to help the community
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                <Car className="h-5 w-5 mr-2" />
                Get Started
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Join the Cal Poly rideshare community today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}