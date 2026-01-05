import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.titleText}>SkyRaven Ministries</Text>
        <Text style={styles.subtitleText}>
          Spreading hope, faith, and love through service
        </Text>
      </View>

      <View style={styles.missionSection}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.missionText}>
          SkyRaven Ministries is dedicated to serving our community through faith,
          compassion, and action. We believe in making a positive impact through
          outreach programs, support services, and spiritual guidance.
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        <View style={styles.featureCard}>
          <Ionicons name="heart" size={40} color="#E74C3C" />
          <Text style={styles.featureTitle}>Donate</Text>
          <Text style={styles.featureDescription}>
            Support our mission with your generous contributions
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="receipt" size={40} color="#4A90E2" />
          <Text style={styles.featureTitle}>Track Expenses</Text>
          <Text style={styles.featureDescription}>
            Monitor and manage ministry expenses transparently
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="people" size={40} color="#27AE60" />
          <Text style={styles.featureTitle}>Community</Text>
          <Text style={styles.featureDescription}>
            Join our growing community of believers
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="calendar" size={40} color="#F39C12" />
          <Text style={styles.featureTitle}>Events</Text>
          <Text style={styles.featureDescription}>
            Stay updated with our latest programs and activities
          </Text>
        </View>
      </View>

      <View style={styles.impactSection}>
        <Text style={styles.sectionTitle}>Our Impact</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Families Helped</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1,200+</Text>
            <Text style={styles.statLabel}>Volunteer Hours</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>$50K+</Text>
            <Text style={styles.statLabel}>Funds Raised</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for being part of our journey
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 30,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#E3F2FD',
    marginBottom: 5,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  missionSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  missionText: {
    fontSize: 16,
    color: '#7F8C8D',
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 20,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 10,
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  impactSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 5,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
});
