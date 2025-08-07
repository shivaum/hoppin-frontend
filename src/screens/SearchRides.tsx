// src/screens/SearchRides.tsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { searchRides, getMyRideRequests } from '../integrations/hopin-backend/rider'
import type { SearchRide as SearchRideType, Ride as RideType } from '../types'
import RideCard from '../components/searchRides/RideCard'
import LocationInput, { LatLng } from '../components/offerRides/LocationInput'
import SubmitButton from '../components/offerRides/SubmitButton'
import Constants from 'expo-constants'

export default function SearchRides() {
  const { user } = useAuth()
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey as string

  const [fromText, setFromText] = useState('')
  const [toText, setToText] = useState('')
  const [fromCoords, setFromCoords] = useState<LatLng>({ lat: 0, lng: 0 })
  const [toCoords, setToCoords] = useState<LatLng>({ lat: 0, lng: 0 })

  const [rides, setRides] = useState<RideType[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [myRequestsMap, setMyRequestsMap] = useState<Record<string, string>>({})

  // load existing requests
  useEffect(() => {
    getMyRideRequests()
      .then(reqs => {
        const m: Record<string,string> = {}
        reqs.forEach(r => { m[r.ride_id] = r.status })
        setMyRequestsMap(m)
      })
      .catch(console.warn)
  }, [])

  const mapToRide = useCallback((r: SearchRideType): RideType => ({
    id: r.ride_id,
    driverId: r.driver_id,
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
    }
  }), [])

  const handleSearch = useCallback(async () => {
    if (!fromText.trim() || !toText.trim()) return
    setHasSearched(true)
    setIsSearching(true)
    try {
      const results = await searchRides(fromText, toText)
      setRides(results.map(mapToRide))
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }, [fromText, toText, mapToRide])

  const reloadRequests = () =>
    getMyRideRequests()
      .then(reqs => {
        const m: Record<string,string> = {}
        reqs.forEach(r => { m[r.ride_id] = r.status })
        setMyRequestsMap(m)
      })
      .catch(console.warn)

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.form}>
        <LocationInput
          ref={null}
          label="From"
          apiKey={apiKey}
          value={fromText}
          onChange={setFromText}
          onSelect={(loc, coords) => {
            setFromText(loc)
            setFromCoords(coords)
          }}
        />
        <LocationInput
          ref={null}
          label="To"
          apiKey={apiKey}
          value={toText}
          onChange={setToText}
          onSelect={(loc, coords) => {
            setToText(loc)
            setToCoords(coords)
          }}
        />
        <SubmitButton
          title={isSearching ? 'Searching…' : 'Search Rides'}
          onPress={handleSearch}
          disabled={!fromText.trim() || !toText.trim() || isSearching}
        />
      </View>

      {isSearching && <ActivityIndicator style={styles.loader} size="large" />}

      {!isSearching && rides.length > 0 && (
        <>
          <Text style={styles.header}>
            Found {rides.length} ride{rides.length > 1 ? 's' : ''}
          </Text>
          <FlatList
            data={rides}
            keyExtractor={r => r.id}
            renderItem={({ item }) => (
              <RideCard
                ride={item}
                myProfileId={user?.id}
                myRequestStatus={myRequestsMap[item.id] || null}
                onRequestRide={reloadRequests}
              />
            )}
            contentContainerStyle={styles.list}
          />
        </>
      )}

      {!isSearching && hasSearched && rides.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No rides found. Try different locations or times.
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  form: { marginBottom: 16 },
  loader: { marginTop: 20 },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },
  list: { paddingBottom: 16 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
})