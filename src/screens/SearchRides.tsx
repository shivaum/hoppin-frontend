// src/screens/SearchRides.tsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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

export default function SearchRides() {
  const { user } = useAuth()
  const [fromText, setFromText] = useState('')
  const [toText, setToText] = useState('')
  const [rides, setRides] = useState<RideType[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [myRequestsMap, setMyRequestsMap] = useState<Record<string, string>>({})

  // load existing requests
  useEffect(() => {
    getMyRideRequests()
      .then(reqs => {
        const m: Record<string, string> = {}
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="From (e.g., Cal Poly Campus)"
          value={fromText}
          onChangeText={setFromText}
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="To (e.g., SLO Airport)"
          value={toText}
          onChangeText={setToText}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={[styles.button, (!fromText || !toText || isSearching) && styles.buttonDisabled]}
          onPress={handleSearch}
          disabled={!fromText || !toText || isSearching}
        >
          {isSearching
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Search Rides</Text>}
        </TouchableOpacity>
      </View>

      {isSearching && (
        <ActivityIndicator style={styles.loader} size="large" />
      )}

      {!isSearching && rides.length > 0 && (
        <>
          <Text style={styles.header}>Found {rides.length} ride{rides.length > 1 ? 's' : ''}</Text>
          <FlatList
            data={rides}
            keyExtractor={r => r.id}
            renderItem={({ item }) => (
              <RideCard
                ride={item}
                myProfileId={user?.id}
                myRequestStatus={myRequestsMap[item.id] || null}
                onRequestRide={() => {
                  // reload requests map so UI updates after user requests
                  getMyRideRequests()
                    .then(reqs => {
                      const m: Record<string,string> = {}
                      reqs.forEach(r => { m[r.ride_id] = r.status })
                      setMyRequestsMap(m)
                    })
                }}
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
  form: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#3b82f6',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginTop: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },
  list: {
    paddingBottom: 16,
  },
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