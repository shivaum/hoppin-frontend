// src/components/common/inputs/SmartLocationInput.tsx
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLocationSuggestions } from '../../../integrations/hopin-backend/smart';
import type { LocationSuggestion } from '../../../types';

export interface SmartLocationInputRef {
  focus(): void;
  blur(): void;
  clear(): void;
  setLocationText(text: string): void;
}

export interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  placeholder?: string;
  onChange?: (text: string) => void;
  onSelect?: (location: string, coords?: LatLng) => void;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
  showPersonalizedSuggestions?: boolean;
  maxSuggestions?: number;
}

const SmartLocationInput = forwardRef<SmartLocationInputRef, Props>(
  (
    {
      value,
      placeholder = 'Enter location',
      onChange,
      onSelect,
      onClear,
      onFocus,
      onBlur,
      style,
      showPersonalizedSuggestions = true,
      maxSuggestions = 8,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<TextInput>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        onChange?.('');
        onClear?.();
        setSuggestions([]);
        setShowSuggestions(false);
      },
      setLocationText: (text: string) => {
        onChange?.(text);
      },
    }));

    // Helper function to create basic location suggestions as fallback
    const createBasicSuggestions = (query: string): LocationSuggestion[] => {
      const basicLocations = [
        'New York, NY',
        'Los Angeles, CA', 
        'Chicago, IL',
        'Houston, TX',
        'Phoenix, AZ',
        'Philadelphia, PA',
        'San Antonio, TX',
        'San Diego, CA',
        'Dallas, TX',
        'San Jose, CA',
        'Austin, TX',
        'Jacksonville, FL',
        'Fort Worth, TX',
        'Columbus, OH',
        'Charlotte, NC',
        'San Francisco, CA',
        'Indianapolis, IN',
        'Seattle, WA',
        'Denver, CO',
        'Washington, DC'
      ];

      const suggestions: LocationSuggestion[] = [];

      // Always include user's input as first option (for custom addresses)
      suggestions.push({
        canonical_name: query,
        alias_name: query,
        display_name: query,
        coordinates: {
          lat: null,
          lng: null,
        },
        popularity: 100, // High priority for user input
        relevance_boost: 0,
        user_searched: false,
      });

      // Add matching cities from our basic list
      const cityMatches = basicLocations
        .filter(location => 
          location.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, maxSuggestions - 1) // Leave room for user input
        .map((location) => ({
          canonical_name: location,
          alias_name: location,
          display_name: location,
          coordinates: {
            lat: null,
            lng: null,
          },
          city: location.split(',')[0],
          state: location.split(',')[1]?.trim(),
          popularity: 50,
          relevance_boost: 0,
          user_searched: false,
        }));

      suggestions.push(...cityMatches);

      return suggestions.slice(0, maxSuggestions);
    };

    // Debounced search for suggestions
    useEffect(() => {
      console.log('🔍 Location Input Effect triggered:', {
        value: value.trim(),
        length: value.trim().length,
        isFocused,
        showPersonalizedSuggestions,
        maxSuggestions
      });

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (value.trim().length >= 2 && isFocused) {
        console.log('✅ Starting location search for:', value.trim());
        debounceRef.current = setTimeout(async () => {
          try {
            setIsLoading(true);
            setError(null);
            console.log('🔄 Setting loading state, cleared error');
            
            // Try smart suggestions first
            if (showPersonalizedSuggestions) {
              console.log('🧠 Attempting smart suggestions...');
              try {
                const response = await getLocationSuggestions(value.trim(), maxSuggestions);
                console.log('✅ Smart suggestions response:', response);
                
                // Check if we got any suggestions
                if (response.suggestions && response.suggestions.length > 0) {
                  setSuggestions(response.suggestions);
                  setShowSuggestions(true);
                  console.log('✅ Set smart suggestions:', response.suggestions.length, 'items');
                } else {
                  console.log('⚠️ Smart suggestions returned empty results, falling back to basic...');
                  const basicSuggestions = createBasicSuggestions(value.trim());
                  console.log('✅ Created basic suggestions:', basicSuggestions.length, 'items', basicSuggestions);
                  setSuggestions(basicSuggestions);
                  setShowSuggestions(true);
                  console.log('✅ Set basic fallback suggestions (empty smart results)');
                }
              } catch (smartErr) {
                console.log('⚠️ Smart suggestions failed with error:', smartErr);
                console.log('🔄 Falling back to basic suggestions...');
                // Fallback to basic suggestions (mock data for now)
                const basicSuggestions = createBasicSuggestions(value.trim());
                console.log('✅ Created basic suggestions:', basicSuggestions.length, 'items', basicSuggestions);
                setSuggestions(basicSuggestions);
                setShowSuggestions(true);
                console.log('✅ Set basic fallback suggestions (API error)');
              }
            } else {
              console.log('🔧 Using basic suggestions mode');
              // Use basic suggestions
              const basicSuggestions = createBasicSuggestions(value.trim());
              console.log('✅ Created basic suggestions:', basicSuggestions.length, 'items', basicSuggestions);
              setSuggestions(basicSuggestions);
              setShowSuggestions(true);
              console.log('✅ Set basic suggestions');
            }
          } catch (err: any) {
            console.error('❌ Location suggestions error:', err);
            setError('Unable to load location suggestions');
            setSuggestions([]);
          } finally {
            setIsLoading(false);
            console.log('🏁 Finished loading, set loading to false');
          }
        }, 300);
      } else {
        console.log('❌ Not searching - criteria not met:', {
          lengthCheck: value.trim().length >= 2,
          focusCheck: isFocused
        });
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoading(false);
      }

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [value, isFocused, maxSuggestions]);

    const handleFocus = () => {
      setIsFocused(true);
      onFocus?.();
      if (value.trim().length >= 2) {
        setShowSuggestions(true);
      }
    };

    const handleBlur = () => {
      // Delay blur to allow suggestion tap
      setTimeout(() => {
        setIsFocused(false);
        setShowSuggestions(false);
        onBlur?.();
      }, 150);
    };

    const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
      const coords = suggestion.coordinates.lat && suggestion.coordinates.lng 
        ? { lat: suggestion.coordinates.lat, lng: suggestion.coordinates.lng }
        : undefined;

      onSelect?.(suggestion.display_name, coords);
      onChange?.(suggestion.display_name);
      setShowSuggestions(false);
      inputRef.current?.blur();
    };

    const renderSuggestion = ({ item }: { item: LocationSuggestion }) => (
      <TouchableOpacity
        style={s.suggestionRow}
        onPress={() => handleSuggestionSelect(item)}
        activeOpacity={0.7}
      >
        <View style={s.suggestionContent}>
          <View style={s.suggestionHeader}>
            <Ionicons 
              name={item.user_searched ? 'time' : 'location'} 
              size={16} 
              color={item.user_searched ? '#7C3AED' : '#6B7280'} 
            />
            <Text numberOfLines={1} style={s.suggestionTitle}>
              {item.display_name}
            </Text>
            {item.user_searched && (
              <View style={s.userSearchedBadge}>
                <Text style={s.userSearchedText}>Recent</Text>
              </View>
            )}
            {item.popularity >= 50 && (
              <Ionicons name="trending-up" size={12} color="#10B981" />
            )}
          </View>
          
          {(item.city || item.state) && (
            <Text style={s.suggestionSubtitle}>
              {[item.city, item.state].filter(Boolean).join(', ')}
            </Text>
          )}
          
          {showPersonalizedSuggestions && item.relevance_boost > 0 && (
            <View style={s.relevanceIndicator}>
              <Text style={s.relevanceText}>
                Personal match ({Math.round(item.relevance_boost / 10)}⭐)
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );

    // Debug render state
    console.log('🎨 Rendering SmartLocationInput:', {
      showSuggestions,
      suggestionsLength: suggestions.length,
      isLoading,
      error,
      value,
      isFocused
    });

    return (
      <View style={[s.container, style]}>
        <View style={[s.inputContainer, isFocused && s.inputContainerFocused]}>
          <Ionicons 
            name="location-outline" 
            size={20} 
            color={isFocused ? '#7C3AED' : '#6B7280'} 
            style={s.inputIcon}
          />
          
          <TextInput
            ref={inputRef}
            style={s.textInput}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            onChangeText={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCorrect={false}
            autoCapitalize="words"
          />

          {isLoading && (
            <ActivityIndicator size="small" color="#7C3AED" style={s.loadingIndicator} />
          )}

          {value.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                onChange?.('');
                onClear?.();
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              style={s.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {showSuggestions && (
          <View style={s.suggestionsContainer}>
            {error ? (
              <View style={s.errorContainer}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : suggestions.length > 0 ? (
              <>
                <FlatList
                  data={suggestions}
                  keyExtractor={(item, index) => `${item.canonical_name}-${index}`}
                  renderItem={renderSuggestion}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={s.suggestionsList}
                />
                {suggestions.length >= maxSuggestions && (
                  <View style={s.moreResultsHint}>
                    <Text style={s.moreResultsText}>
                      Type more to see additional suggestions
                    </Text>
                  </View>
                )}
              </>
            ) : !isLoading && (
              <View style={s.noResultsContainer}>
                <Text style={s.noResultsText}>No locations found</Text>
                <Text style={s.noResultsSubtext}>Try a different search term</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }
);

SmartLocationInput.displayName = 'SmartLocationInput';

const s = StyleSheet.create({
  container: {
    position: 'relative',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputContainerFocused: {
    borderColor: '#7C3AED',
    backgroundColor: '#FEFBFF',
  },

  inputIcon: {
    marginRight: 8,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },

  loadingIndicator: {
    marginLeft: 8,
  },

  clearButton: {
    marginLeft: 8,
  },

  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    maxHeight: 300,
  },

  suggestionsList: {
    maxHeight: 250,
  },

  suggestionRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  suggestionContent: {
    flex: 1,
  },

  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },

  suggestionTitle: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },

  suggestionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 24,
  },

  userSearchedBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  userSearchedText: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '600',
  },

  relevanceIndicator: {
    marginTop: 4,
    marginLeft: 24,
  },
  relevanceText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },

  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },

  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  noResultsSubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },

  moreResultsHint: {
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  moreResultsText: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default SmartLocationInput;