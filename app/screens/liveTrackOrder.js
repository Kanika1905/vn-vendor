// app/screens/liveTrackOrder.js
// Live map tracking screen. Shows the driver (live), the customer destination,
// and a route polyline, with a delivery-status stepper above the map.
//
// react-native-maps is required lazily so the app keeps working even before the
// native module is installed / a dev build is made.
import React, { useContext, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Platform, Linking } from "react-native";
import { AuthContext } from "../context/authContext";
import useOrderTracking from "../hooks/useOrderTracking";
import { colors, spacing, radius, sizes, weights, type } from "../theme";
import { Screen, Header, Button, EmptyState, Icon } from "../components/ui";

// Lazy-load the native maps module.
let Maps = null;
try {
  Maps = require("react-native-maps");
} catch {
  Maps = null;
}
const MapView = Maps?.default;
const Marker = Maps?.Marker;
const Polyline = Maps?.Polyline;
const PROVIDER_GOOGLE = Maps?.PROVIDER_GOOGLE;

const STEPS = [
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "arriving", label: "Arriving" },
  { key: "delivered", label: "Delivered" },
];
const stepIndex = (s) => Math.max(0, STEPS.findIndex((x) => x.key === s));

const toCoord = (p) => (p ? { latitude: p.lat, longitude: p.lng } : null);
const FALLBACK_REGION = { latitude: 19.076, longitude: 72.8777, latitudeDelta: 0.05, longitudeDelta: 0.05 };

export default function LiveTrackOrder({ navigation, route }) {
  const order = route.params?.order || {};
  const orderId = order._id;
  const { token } = useContext(AuthContext);
  const { status, driver, destination, loading, error, connection, retry } = useOrderTracking(orderId, token);
  const mapRef = useRef(null);

  const driverCoord = toCoord(driver);
  const destCoord = toCoord(destination);

  // Auto-fit the map to whatever markers we have.
  useEffect(() => {
    if (!mapRef.current) return;
    const pts = [driverCoord, destCoord].filter(Boolean);
    if (pts.length >= 2) {
      mapRef.current.fitToCoordinates(pts, {
        edgePadding: { top: 90, right: 60, bottom: 110, left: 60 },
        animated: true,
      });
    } else if (pts.length === 1) {
      mapRef.current.animateToRegion({ ...pts[0], latitudeDelta: 0.02, longitudeDelta: 0.02 }, 600);
    }
  }, [driverCoord?.latitude, driverCoord?.longitude, destCoord?.latitude, destCoord?.longitude]);

  const current = stepIndex(status);

  return (
    <Screen>
      <Header
        title="Live tracking"
        subtitle={order._id ? `Order #${String(order._id).slice(-6).toUpperCase()}` : undefined}
        onBack={() => navigation.goBack()}
        right={<ConnectionPill connection={connection} />}
      />

      {/* Status stepper */}
      <View style={styles.stepper}>
        {STEPS.map((s, i) => {
          const done = i <= current;
          return (
            <View key={s.key} style={styles.step}>
              <View style={styles.stepRow}>
                <View style={[styles.node, done && styles.nodeDone]}>
                  {done ? <Icon name="tick" size={11} color={colors.inkInverse} /> : <View style={styles.nodeDot} />}
                </View>
                {i < STEPS.length - 1 && <View style={[styles.bar, i < current && styles.barDone]} />}
              </View>
              <Text style={[styles.stepLabel, done && styles.stepLabelDone]} numberOfLines={1}>{s.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Map area */}
      <View style={styles.mapWrap}>
        {!MapView ? (
          <EmptyState
            emoji="🗺️"
            title="Map module not installed"
            subtitle="Run `npx expo install react-native-maps`, add your Google Maps API key, and rebuild the dev client to see the live map."
            action={<Button title="Maps setup docs" variant="secondary" block={false} onPress={() => Linking.openURL("https://docs.expo.dev/versions/latest/sdk/map-view/")} />}
          />
        ) : (
          <>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              initialRegion={driverCoord ? { ...driverCoord, latitudeDelta: 0.02, longitudeDelta: 0.02 } : FALLBACK_REGION}
              showsUserLocation={false}
            >
              {destCoord && (
                <Marker coordinate={destCoord} title="Delivery address" description={order.deliveryAddress} pinColor={colors.danger} />
              )}
              {driverCoord && (
                <Marker coordinate={driverCoord} title="Driver" anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={styles.driverMarker}>
                    <Icon name="delivery" size={16} color={colors.inkInverse} />
                  </View>
                </Marker>
              )}
              {driverCoord && destCoord && (
                <Polyline coordinates={[driverCoord, destCoord]} strokeColor={colors.primary} strokeWidth={4} lineDashPattern={[2, 6]} />
              )}
            </MapView>

            {/* Loading overlay */}
            {loading && (
              <View style={styles.overlay}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.overlayText}>Loading live location…</Text>
              </View>
            )}

            {/* No driver yet */}
            {!loading && !driverCoord && (
              <View style={styles.overlay}>
                <EmptyState
                  emoji="📍"
                  title="Waiting for driver"
                  subtitle="The driver's live location will appear here once the order is out for delivery."
                />
              </View>
            )}

            {/* Error banner with retry */}
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText} numberOfLines={1}>{error}</Text>
                <Text style={styles.retry} onPress={retry}>Retry</Text>
              </View>
            )}
          </>
        )}
      </View>
    </Screen>
  );
}

function ConnectionPill({ connection }) {
  const live = connection === "live";
  const polling = connection === "polling";
  const label = live ? "Live" : polling ? "Reconnecting" : "Connecting";
  const color = live ? colors.primary : colors.warning;
  return (
    <View style={[styles.pill, { backgroundColor: live ? colors.primarySoft : colors.warningSoft }]}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Stepper
  stepper: { flexDirection: "row", backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  step: { flex: 1 },
  stepRow: { flexDirection: "row", alignItems: "center" },
  node: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#E1E8E2", alignItems: "center", justifyContent: "center" },
  nodeDone: { backgroundColor: colors.primary },
  nodeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#C7D1C9" },
  bar: { flex: 1, height: 3, backgroundColor: "#E1E8E2", marginHorizontal: 3, borderRadius: 2 },
  barDone: { backgroundColor: colors.primary },
  stepLabel: { fontSize: sizes.xs - 1, fontWeight: weights.bold, color: colors.inkFaint, marginTop: 5 },
  stepLabelDone: { color: colors.primaryDark },

  // Map
  mapWrap: { flex: 1, overflow: "hidden", backgroundColor: colors.surfaceAlt },
  driverMarker: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.inkInverse,
  },

  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(246,248,245,0.86)", gap: spacing.sm },
  overlayText: { ...type.caption },

  errorBanner: {
    position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.dangerBorder,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  errorText: { flex: 1, fontSize: sizes.sm, fontWeight: weights.semibold, color: colors.danger },
  retry: { fontSize: sizes.sm, fontWeight: weights.heavy, color: colors.primary, paddingLeft: spacing.md },

  // Connection pill
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontSize: sizes.xs, fontWeight: weights.heavy },
});
