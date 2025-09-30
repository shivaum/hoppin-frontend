import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

interface ProfileMenuListProps {
  items: MenuItem[];
}

export default function ProfileMenuList({ items }: ProfileMenuListProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'account':
        return '👤';
      case 'reviews':
        return '⭐';
      case 'payment':
        return '💳';
      case 'security':
        return '🔒';
      case 'help':
        return '❓';
      default:
        return '📝';
    }
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <TouchableOpacity 
          key={item.id}
          style={[
            styles.menuItem,
            index === items.length - 1 && styles.lastMenuItem
          ]}
          onPress={item.onPress}
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{getIcon(item.icon)}</Text>
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
          </View>
          <View style={styles.chevron}>
            <Text style={styles.chevronText}>›</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.gray200,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral.gray900,
  },
  chevron: {
    marginLeft: 12,
  },
  chevronText: {
    fontSize: 20,
    color: colors.neutral.gray400,
    fontWeight: '300',
  },
});