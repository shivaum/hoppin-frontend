// src/screens/SearchRides/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from '../../contexts/AuthContext';
import CalendarModal from '../../components/common/modals/CalendarModal';
import AdvancedSearchFilters from './components/AdvancedSearchFilters';
import SubmitButton from '../../components/common/buttons/SubmitButton';

// Components
import { FiltersBar } from './components/FiltersBar';
import { DateNavigator } from './components/DateNavigator';
import { SearchInputs } from './components/SearchInputs';
import { RecentSearches } from './components/RecentSearches';
import { SearchResults } from './components/SearchResults';

// Hooks
import { useDateNavigation } from './hooks/useDateNavigation';
import { useRecentSearches } from './hooks/useRecentSearches';
import { useSearchForm } from './hooks/useSearchForm';
import { useSearchResults } from './hooks/useSearchResults';

export default function SearchRides() {
  const { user } = useAuth();
  const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey as string;

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [justCompletedSearch, setJustCompletedSearch] = useState(false);
  const [lastSearchTexts, setLastSearchTexts] = useState({ from: '', to: '' });

  // Date navigation hook
  const dateNav = useDateNavigation();

  // Recent searches hook
  const recents = useRecentSearches(user?.id);

  // Search form hook
  const form = useSearchForm();

  // Search results hook
  const results = useSearchResults();

  // Handle search execution
  const handleSearch = async () => {
    if (!form.fromText.trim() || !form.toText.trim()) return;

    await results.performSearch({
      fromText: form.fromText,
      toText: form.toText,
      fromCoords: form.fromCoords,
      toCoords: form.toCoords,
      selectedDate: dateNav.selectedDate,
    });

    setJustCompletedSearch(true);
    setLastSearchTexts({ from: form.fromText, to: form.toText });
    await recents.saveRecent(form.fromText);
    await recents.saveRecent(form.toText);
    recents.setShowRecents(false);
    setTimeout(() => setJustCompletedSearch(false), 200);
  };

  // Clear filters and auto-search
  const handleClearFilters = () => {
    results.setAdvancedFilters({});
    if (form.fromText.trim() && form.toText.trim()) {
      setTimeout(() => handleSearch(), 100);
    }
  };

  const hasActiveFilters = Object.keys(results.advancedFilters).length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        {/* Top controls */}
        <View style={styles.topRow}>
          <FiltersBar
            advancedFilters={results.advancedFilters}
            onOpenFilters={() => setFiltersVisible(true)}
            onClearFilters={handleClearFilters}
          />
          <DateNavigator
            selectedDate={dateNav.selectedDate}
            onDatePress={() => setCalendarOpen(true)}
            onNavigatePrev={() => dateNav.navigateDate('prev')}
            onNavigateNext={() => dateNav.navigateDate('next')}
            canNavigatePrev={dateNav.canNavigatePrev()}
          />
        </View>

        {/* Search Inputs */}
        <SearchInputs
          apiKey={apiKey}
          fromText={form.fromText}
          toText={form.toText}
          fromInputRef={form.fromInputRef}
          toInputRef={form.toInputRef}
          onFromTextChange={(text) => {
            form.setFromText(text);
            if (!justCompletedSearch && text !== lastSearchTexts.from) {
              recents.setShowRecents(true);
            }
          }}
          onToTextChange={(text) => {
            form.setToText(text);
            if (!justCompletedSearch && text !== lastSearchTexts.to) {
              recents.setShowRecents(true);
            }
          }}
          onFromSelect={(loc, coords) => {
            form.setFromText(loc);
            if (coords) form.setFromCoords(coords);
          }}
          onToSelect={(loc, coords) => {
            form.setToText(loc);
            if (coords) form.setToCoords(coords);
          }}
          onFromClear={() => {
            form.setFromCoords({ lat: 0, lng: 0 });
            recents.setShowRecents(true);
          }}
          onToClear={() => {
            form.setToCoords({ lat: 0, lng: 0 });
            recents.setShowRecents(true);
          }}
          onFromFocus={() => form.setFocusedInput('from')}
          onToFocus={() => form.setFocusedInput('to')}
          onFromBlur={() => form.setFocusedInput(null)}
          onToBlur={() => form.setFocusedInput(null)}
          onSwap={form.swapLocations}
        />

        {/* Recents */}
        {!results.isSearching && recents.showRecents && (
          <RecentSearches recents={recents.recents} onSelectRecent={form.populateRecentInFocusedInput} />
        )}

        {/* Search CTA */}
        {!results.isSearching && (
          <SubmitButton
            title="Search Rides"
            onPress={handleSearch}
            disabled={!form.fromText.trim() || !form.toText.trim()}
          />
        )}

        {results.isSearching && <ActivityIndicator style={{ marginTop: 18 }} size="large" />}

        {/* Search Results */}
        {!results.isSearching && results.hasSearched && (
          <SearchResults
            rides={results.rides}
            sortedRides={results.sortedRides}
            searchResponse={results.searchResponse}
            hasActiveFilters={hasActiveFilters}
            sortBy={results.sortBy}
            onSortChange={results.setSortBy}
            onRequestRide={handleSearch}
            onClearFilters={() => results.setAdvancedFilters({})}
            myProfileId={user?.id}
          />
        )}

        {/* Calendar modal */}
        <CalendarModal
          visible={calendarOpen}
          initialDate={dateNav.selectedDate}
          onClose={() => setCalendarOpen(false)}
          onConfirm={(iso) => {
            dateNav.setSelectedDate(iso);
            setCalendarOpen(false);
          }}
        />

        {/* Advanced Filters Modal */}
        <AdvancedSearchFilters
          visible={filtersVisible}
          onClose={() => setFiltersVisible(false)}
          onApply={(filters) => {
            results.setAdvancedFilters(filters);
            setFiltersVisible(false);
            if (form.fromText.trim() && form.toText.trim()) {
              setTimeout(() => handleSearch(), 100);
            }
          }}
          initialFilters={results.advancedFilters}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});