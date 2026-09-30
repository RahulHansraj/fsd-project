import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { 
  AlertTriangle,
  Building2, 
  Compass,
  Crosshair, 
  Eye, 
  Factory, 
  Flame, 
  Globe2, 
  Layers, 
  MapPin, 
  Maximize2, 
  Minimize2, 
  Moon, 
  Navigation, 
  Play, 
  Radio, 
  Satellite, 
  Sparkles, 
  Square, 
  Sun, 
  Trash2, 
  Truck, 
  Waves,
  Wind,
  X, 
  Zap 
} from 'lucide-react'
import { 
  FleetVehicle, 
  LandfillTelemetry, 
  QueueItem, 
  RecyclingFacility, 
  SmartBinSensor, 
  ZoneData, 
  ZoneName 
} from '../../types/operations'
import { 
  mockCircularHubs, 
  mockEnvironmentalSensors, 
  mockMarineBooms, 
  mockSF311Incidents 
} from '../../data/mockOperationsData'
import { playDispatchConfirm, playRadioChirp, playTelemetryPing } from '../../utils/audioEffects'

interface OpenStreetMapContainerProps {
  zones: ZoneData[]
  fleet: FleetVehicle[]
  facilities: RecyclingFacility[]
  landfill: LandfillTelemetry
  smartBins: SmartBinSensor[]
  activeZone: ZoneName
  onSelectZone: (zone: ZoneName) => void
  onTriggerNotice: (msg: string) => void
  onOpenRadioModal?: (vehicleId: string, driverName: string) => void
  onWaypointTaskDispatched?: (newTask: QueueItem) => void
  height?: string
}

type TileTheme = 'voyager' | 'dark' | 'osm' | 'satellite'

const tileLayersConfig: Record<TileTheme, { url: string; attribution: string; maxZoom: number }> = {
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics, USDA FSA, USGS, Aerogrid, IGN, IGP, and the GIS User Community',
    maxZoom: 19
  }
}

// San Francisco Municipal Center Coordinates
const SF_CENTER_COORDS: [number, number] = [37.7749, -122.4194]

// Hotspot centers for Contamination Heatmap layer across SF districts
const sfContaminationHotspots = [
  { coords: [37.7618, -122.4194] as [number, number], radius: 450, intensity: 'high', name: '16th & Mission Commercial Corridor (24.2% Contam)' },
  { coords: [37.7340, -122.3850] as [number, number], radius: 420, intensity: 'high', name: 'Bayview Scrap Metal & Industrial Corridor' },
  { coords: [37.7885, -122.3995] as [number, number], radius: 360, intensity: 'medium', name: 'SoMa High-Rise Packaging Accumulation' },
  { coords: [37.8080, -122.4177] as [number, number], radius: 300, intensity: 'medium', name: 'Fisherman Wharf Seafood Packaging Drop-off' },
  { coords: [37.7815, -122.4160] as [number, number], radius: 340, intensity: 'high', name: 'Civic Center Market St Public Litter Overflow' }
]

export function OpenStreetMapContainer({
  zones,
  fleet,
  facilities,
  landfill,
  smartBins,
  activeZone,
  onSelectZone,
  onTriggerNotice,
  onOpenRadioModal,
  onWaypointTaskDispatched,
  height = '480px'
}: OpenStreetMapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const layersGroupRef = useRef<{
    zones: L.FeatureGroup
    vehicles: L.FeatureGroup
    facilities: L.FeatureGroup
    landfill: L.FeatureGroup
    smartBins: L.FeatureGroup
    routes: L.FeatureGroup
    heatmaps: L.FeatureGroup
    sf311: L.FeatureGroup
    envSensors: L.FeatureGroup
    marineBooms: L.FeatureGroup
    circularHubs: L.FeatureGroup
    waypointRoute: L.FeatureGroup
  } | null>(null)

  // Map Controls State
  const [currentTheme, setCurrentTheme] = useState<TileTheme>('voyager')
  const [showVehicles, setShowVehicles] = useState(true)
  const [showFacilities, setShowFacilities] = useState(true)
  const [showLandfill, setShowLandfill] = useState(true)
  const [showSmartBins, setShowSmartBins] = useState(true)
  const [showWards, setShowWards] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [show311, setShow311] = useState(true)
  const [showEnvSensors, setShowEnvSensors] = useState(true)
  const [showMarineBooms, setShowMarineBooms] = useState(true)
  const [showCircularHubs, setShowCircularHubs] = useState(true)
  const [isSimulatingGps, setIsSimulatingGps] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Waypoint Planner State
  const [waypointMode, setWaypointMode] = useState(false)
  const [activeWaypoint, setActiveWaypoint] = useState<{
    coords: [number, number]
    nearestVehicle: FleetVehicle
    distanceKm: number
    durationMin: number
  } | null>(null)

  // Mutable positions for vehicle GPS animation simulation
  const [simulatedFleet, setSimulatedFleet] = useState<FleetVehicle[]>(fleet)

  // Invalidate map size when fullscreen toggles so Leaflet recomputes tile grid
  useEffect(() => {
    if (!mapInstanceRef.current) return
    // Allow the CSS reflow (position: fixed) to settle before recalculating
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize({ animate: false })
    }, 150)
    return () => clearTimeout(timer)
  }, [isFullscreen])

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: SF_CENTER_COORDS,
      zoom: 13,
      zoomControl: false
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const tileConfig = tileLayersConfig[currentTheme]
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom
    }).addTo(map)
    tileLayerRef.current = tileLayer

    // Initialize Layer Groups
    const zonesGroup = L.featureGroup().addTo(map)
    const vehiclesGroup = L.featureGroup().addTo(map)
    const facilitiesGroup = L.featureGroup().addTo(map)
    const landfillGroup = L.featureGroup().addTo(map)
    const smartBinsGroup = L.featureGroup().addTo(map)
    const routesGroup = L.featureGroup().addTo(map)
    const heatmapsGroup = L.featureGroup().addTo(map)
    const sf311Group = L.featureGroup().addTo(map)
    const envSensorsGroup = L.featureGroup().addTo(map)
    const marineBoomsGroup = L.featureGroup().addTo(map)
    const circularHubsGroup = L.featureGroup().addTo(map)
    const waypointGroup = L.featureGroup().addTo(map)

    layersGroupRef.current = {
      zones: zonesGroup,
      vehicles: vehiclesGroup,
      facilities: facilitiesGroup,
      landfill: landfillGroup,
      smartBins: smartBinsGroup,
      routes: routesGroup,
      heatmaps: heatmapsGroup,
      sf311: sf311Group,
      envSensors: envSensorsGroup,
      marineBooms: marineBoomsGroup,
      circularHubs: circularHubsGroup,
      waypointRoute: waypointGroup
    }

    // Waypoint Click Listener on Map
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      
      let closestVehicle = simulatedFleet[0]
      let minDistance = Infinity

      simulatedFleet.forEach(v => {
        const dLat = v.coordinates[0] - lat
        const dLng = v.coordinates[1] - lng
        const d = Math.sqrt(dLat * dLat + dLng * dLng)
        if (d < minDistance) {
          minDistance = d
          closestVehicle = v
        }
      })

      const roundedDist = Math.round((minDistance * 111) * 10) / 10
      const duration = Math.max(4, Math.round(roundedDist * 2.6))

      setActiveWaypoint({
        coords: [lat, lng],
        nearestVehicle: closestVehicle,
        distanceKm: roundedDist,
        durationMin: duration
      })

      playTelemetryPing()
      onTriggerNotice(`Waypoint pinned in San Francisco at [${lat.toFixed(4)}, ${lng.toFixed(4)}]. Nearest unit: ${closestVehicle.id} (${roundedDist} km).`)
    })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Switch Tile Theme
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const config = tileLayersConfig[currentTheme]
    
    // Remove old tile layer
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current)
    }
    
    // Add new tile layer with correct config
    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom
    }).addTo(mapInstanceRef.current)
    
    tileLayerRef.current = newTileLayer
  }, [currentTheme])

  // Fly to SF District
  const handleSelectDistrict = (districtName: string) => {
    if (districtName === 'All-SF') {
      if (!mapInstanceRef.current) return
      playRadioChirp()
      mapInstanceRef.current.flyTo(SF_CENTER_COORDS, 13, { duration: 1.5 })
      onTriggerNotice('Reset to San Francisco Bay Area overview.')
      return
    }

    const targetZone = zones.find(z => z.name === districtName)
    if (targetZone && mapInstanceRef.current) {
      onSelectZone(targetZone.name)
      playRadioChirp()
      mapInstanceRef.current.flyTo(targetZone.centerCoordinates, 14, { duration: 1.5 })
      onTriggerNotice(`Focused San Francisco GIS on ${targetZone.name}. Score: ${targetZone.score}/100, Segregation: ${targetZone.segregationRate}%.`)
    }
  }

  // GPS Simulation Interval
  useEffect(() => {
    if (!isSimulatingGps) return

    const interval = setInterval(() => {
      setSimulatedFleet(prev => prev.map(v => {
        if (v.status !== 'On route' && v.status !== 'Attention') return v
        const dLat = (Math.random() - 0.48) * 0.0006
        const dLng = (Math.random() - 0.48) * 0.0006
        return {
          ...v,
          coordinates: [v.coordinates[0] + dLat, v.coordinates[1] + dLng],
          speedKmh: Math.max(10, Math.min(45, Math.round(v.speedKmh + (Math.random() - 0.5) * 4)))
        }
      }))
    }, 1800)

    return () => clearInterval(interval)
  }, [isSimulatingGps])

  // Render & Update Map Layers
  useEffect(() => {
    const map = mapInstanceRef.current
    const groups = layersGroupRef.current
    if (!map || !groups) return

    // 1. SF 311 CITIZEN INCIDENT PINS
    groups.sf311.clearLayers()
    if (show311) {
      mockSF311Incidents.forEach(inc => {
        const isCritical = inc.priority === 'critical'
        const iconHtml = `
          <div class="osm-311-pin ${isCritical ? 'critical' : ''}">
            <span>⚠️</span>
          </div>
        `
        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-div-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })

        const marker = L.marker(inc.coordinates, { icon })
        marker.bindPopup(`
          <div class="osm-popup-card">
            <div class="osm-popup-head">
              <strong>⚠️ SF 311: ${inc.title}</strong>
              <span class="inc-pri-tag ${inc.priority}">${inc.priority.toUpperCase()}</span>
            </div>
            <div class="osm-popup-meta">
              <div>Address: <b>${inc.address}</b></div>
              <div>District: <b>${inc.district}</b></div>
              <div>Est. Load: <b>${inc.wasteEstimatedKg} kg</b> (${inc.category})</div>
              <div>Status: <b>${inc.status}</b> · Reported: <b>${inc.reportedAt}</b></div>
              <p class="inc-popup-desc">${inc.description}</p>
            </div>
            <div class="osm-popup-actions">
              <button id="dispatch-311-${inc.id}" class="osm-btn-primary">Dispatch Nearest Unit</button>
            </div>
          </div>
        `, { minWidth: 260 })

        marker.on('popupopen', () => {
          const btn = document.getElementById(`dispatch-311-${inc.id}`)
          if (btn) {
            btn.onclick = () => {
              if (onWaypointTaskDispatched) {
                onWaypointTaskDispatched({
                  id: `task-${Date.now().toString().slice(-4)}`,
                  time: 'Just now',
                  title: `SF 311 Clearance: ${inc.title}`,
                  detail: `At ${inc.address} (${inc.district}). Load: ${inc.wasteEstimatedKg}kg. Case #${inc.caseNumber}`,
                  severity: inc.priority === 'critical' || inc.priority === 'high' ? 'high' : 'medium',
                  assignedVehicle: 'R-22',
                  zone: inc.district,
                  status: 'In Progress',
                  recommendation: `Rapid clearance unit dispatched.`
                })
              }
              playDispatchConfirm()
              onTriggerNotice(`Dispatched unit to SF 311 incident at ${inc.address}!`)
              map.closePopup()
            }
          }
        })

        groups.sf311.addLayer(marker)
      })
    }

    // 2. ENVIRONMENTAL & AIR QUALITY SENSORS
    groups.envSensors.clearLayers()
    if (showEnvSensors) {
      mockEnvironmentalSensors.forEach(sensor => {
        const iconHtml = `
          <div class="osm-env-pin ${sensor.status}">
            <span>🍃</span>
            <small>${sensor.pm25}</small>
          </div>
        `
        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-div-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })

        const marker = L.marker(sensor.coordinates, { icon })
        marker.bindPopup(`
          <div class="osm-popup-card">
            <div class="osm-popup-head">
              <strong>🍃 ${sensor.name}</strong>
              <small>${sensor.district}</small>
            </div>
            <div class="osm-popup-meta">
              <div>Particulate PM2.5: <b>${sensor.pm25} µg/m³</b> (Limit: 35)</div>
              <div>Hydrogen Sulfide H₂S: <b>${sensor.h2sPpm} ppm</b> (${sensor.odorUnitsM3} OU/m³)</div>
              <div>Acoustic Sound: <b>${sensor.soundDba} dBA</b> (SF limit: 75 dBA)</div>
              <div>Status: <b>${sensor.status.toUpperCase()}</b> · Updated: <b>${sensor.lastReading}</b></div>
            </div>
          </div>
        `, { minWidth: 250 })

        groups.envSensors.addLayer(marker)
      })
    }

    // 3. COASTAL MARINE TRASH BOOMS
    groups.marineBooms.clearLayers()
    if (showMarineBooms) {
      mockMarineBooms.forEach(boom => {
        const iconHtml = `
          <div class="osm-marine-pin">
            <span>🌊</span>
          </div>
        `
        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-div-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })

        const marker = L.marker(boom.coordinates, { icon })
        marker.bindPopup(`
          <div class="osm-popup-card">
            <div class="osm-popup-head">
              <strong>🌊 ${boom.name}</strong>
              <small>${boom.waterBody} · ${boom.location}</small>
            </div>
            <div class="osm-popup-meta">
              <div>Type: <b>${boom.type}</b></div>
              <div>Weekly Capture: <b>${boom.weeklyInterceptedKg} kg/week</b></div>
              <div>Annual Plastic Diverted: <b>${boom.annualPlasticsDivertedTons} tons/year</b></div>
              <div>Status: <b>${boom.operationalStatus}</b> (Battery: ${boom.sensorBatteryPercent}%)</div>
            </div>
          </div>
        `, { minWidth: 250 })

        groups.marineBooms.addLayer(marker)
      })
    }

    // 4. CIRCULAR RECOVERY INFRASTRUCTURE HUBS
    groups.circularHubs.clearLayers()
    if (showCircularHubs) {
      mockCircularHubs.forEach(hub => {
        const iconHtml = `
          <div class="osm-circular-hub-pin">
            <span>♻️</span>
          </div>
        `
        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-div-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })

        const marker = L.marker(hub.coordinates, { icon })
        marker.bindPopup(`
          <div class="osm-popup-card">
            <div class="osm-popup-head">
              <strong>♻️ ${hub.name}</strong>
              <small>${hub.category}</small>
            </div>
            <div class="osm-popup-meta">
              <div>Address: <b>${hub.address}</b></div>
              <div>Annual Throughput: <b>${hub.annualThroughputTons.toLocaleString()} t/year</b></div>
              <div>Public Access: <b>${hub.publicDropOff ? 'Open to Public' : 'Fleet Depot Only'}</b></div>
              <p>${hub.description}</p>
              <div>Accepted: <i>${hub.acceptedMaterials.join(', ')}</i></div>
            </div>
          </div>
        `, { minWidth: 270 })

        groups.circularHubs.addLayer(marker)
      })
    }

    // 5. SAN FRANCISCO DISTRICT POLYGONS
    groups.zones.clearLayers()
    if (showWards) {
      zones.forEach(zone => {
        const isSelected = zone.name === activeZone
        const color = zone.state === 'healthy' ? '#2d896b' : zone.state === 'attention' ? '#d99b45' : '#d4684e'
        
        const polygon = L.polygon(zone.polygonCoordinates, {
          color: isSelected ? '#174e47' : color,
          weight: isSelected ? 3 : 1.5,
          opacity: 0.85,
          fillColor: color,
          fillOpacity: isSelected ? 0.25 : 0.12
        })

        polygon.bindTooltip(`
          <div class="osm-tooltip">
            <strong>${zone.name}</strong>
            <small>Segregation: ${zone.segregationRate}% · Contam: ${zone.contaminationRate}%</small>
          </div>
        `, { sticky: true, className: 'osm-custom-tooltip' })

        polygon.on('click', () => {
          onSelectZone(zone.name)
          onTriggerNotice(`Selected ${zone.name} on San Francisco GIS. Score: ${zone.score}/100.`)
        })

        groups.zones.addLayer(polygon)
      })
    }

    // 6. FLEET VEHICLES
    groups.vehicles.clearLayers()
    if (showVehicles) {
      simulatedFleet.forEach(vehicle => {
        const isAttention = vehicle.status === 'Attention'
        const color = isAttention ? '#d4684e' : vehicle.status === 'Unloading' ? '#3d8eb9' : '#2d896b'

        const vehicleHtml = `
          <div class="osm-vehicle-marker ${isAttention ? 'attention' : ''}">
            <div class="marker-pulse" style="background: ${color};"></div>
            <div class="marker-badge" style="background: ${color};">
              <span>${vehicle.id}</span>
            </div>
          </div>
        `

        const icon = L.divIcon({
          html: vehicleHtml,
          className: 'custom-div-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        })

        const marker = L.marker(vehicle.coordinates, { icon })

        const popupContent = `
          <div class="osm-popup-card">
            <div class="osm-popup-head">
              <strong>${vehicle.id} (${vehicle.type})</strong>
              <span class="osm-status-pill ${vehicle.status.toLowerCase().replace(' ', '-')}">${vehicle.status}</span>
            </div>
            <div class="osm-popup-meta">
              <div>Driver: <b>${vehicle.crewLeader}</b></div>
              <div>Operating: <b>${vehicle.zone}</b></div>
              <div>Payload: <b>${vehicle.currentLoadTons} / ${vehicle.maxCapacityTons} t</b></div>
              <div>Speed: <b>${vehicle.speedKmh} km/h</b> · Battery: <b>${vehicle.batteryFuel}%</b></div>
              ${vehicle.dwellTimeMinutes > 15 ? `<div class="osm-dwell-alert">⚠️ Dwell Alert: ${vehicle.dwellTimeMinutes}m at gate</div>` : ''}
            </div>
            <div class="osm-popup-actions">
              <button id="reroute-${vehicle.id}" class="osm-btn-primary">Reroute Unit</button>
              <button id="radio-${vehicle.id}" class="osm-btn-secondary">Radio Call</button>
            </div>
          </div>
        `

        marker.bindPopup(popupContent, { minWidth: 220 })

        marker.on('popupopen', () => {
          const rerouteBtn = document.getElementById(`reroute-${vehicle.id}`)
          const radioBtn = document.getElementById(`radio-${vehicle.id}`)
          if (rerouteBtn) {
            rerouteBtn.onclick = () => {
              playDispatchConfirm()
              onTriggerNotice(`Dynamic GPS waypoint reroute pushed to Unit ${vehicle.id}.`)
              map.closePopup()
            }
          }
          if (radioBtn) {
            radioBtn.onclick = () => {
              if (onOpenRadioModal) onOpenRadioModal(vehicle.id, vehicle.crewLeader)
              map.closePopup()
            }
          }
        })

        groups.vehicles.addLayer(marker)
      })
    }

    // 7. RECYCLING FACILITIES (MRF)
    groups.facilities.clearLayers()
    if (showFacilities) {
      facilities.forEach(fac => {
        const facHtml = `
          <div class="osm-fac-marker">
            <div class="fac-pin-icon">🏭</div>
            <span class="fac-pin-label">${fac.dailyIntake}t</span>
          </div>
        `

        const icon = L.divIcon({
          html: facHtml,
          className: 'custom-div-icon',
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        })

        const marker = L.marker(fac.coordinates, { icon })
        marker.bindPopup(`
          <div class="osm-popup-card">
            <div class="osm-popup-head">
              <strong>${fac.name}</strong>
              <small>${fac.location}</small>
            </div>
            <div class="osm-popup-meta">
              <div>Type: <b>${fac.type}</b></div>
              <div>Intake: <b>${fac.dailyIntake} / ${fac.ratedCapacity} t/day</b></div>
              <div>Purity Yield: <b>${fac.purityYield}%</b></div>
              <div>Mode: <b>${fac.operatingMode}</b></div>
            </div>
          </div>
        `, { minWidth: 200 })

        groups.facilities.addLayer(marker)
      })
    }

    // 8. LANDFILL TELEMETRY (Pine Ridge / Cell 4)
    groups.landfill.clearLayers()
    if (showLandfill) {
      const hazardColor = '#d4684e'
      const circle = L.circle(landfill.coordinates, {
        radius: 750,
        color: hazardColor,
        weight: 1.5,
        dashArray: '5, 8',
        fillColor: hazardColor,
        fillOpacity: 0.12
      })

      const marker = L.marker(landfill.coordinates, {
        icon: L.divIcon({
          html: `
            <div class="osm-landfill-marker">
              <span>⚠️</span>
              <small>${landfill.methaneLevelPpm} ppm</small>
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })
      })

      marker.bindPopup(`
        <div class="osm-popup-card">
          <div class="osm-popup-head">
            <strong>${landfill.siteName}</strong>
            <span class="osm-status-pill critical">Hazard Alert</span>
          </div>
          <div class="osm-popup-meta">
            <div>Methane: <b>${landfill.methaneLevelPpm} ppm</b> (Limit: ${landfill.methaneThresholdPpm})</div>
            <div>Runway: <b>${landfill.baselineRunwayDays} days</b></div>
            <div>Current Fill: <b>${landfill.fillPercentage}% (${landfill.currentFillTons.toLocaleString()} t)</b></div>
            <div>Leachate Pond: <b>${landfill.leachatePondCapacityPercent}%</b></div>
          </div>
        </div>
      `, { minWidth: 220 })

      groups.landfill.addLayer(circle)
      groups.landfill.addLayer(marker)
    }

    // 9. IOT SMART BINS
    groups.smartBins.clearLayers()
    if (showSmartBins) {
      smartBins.forEach(bin => {
        const isFull = bin.fillPercent >= 80
        const isMed = bin.fillPercent >= 50
        const color = isFull ? '#d4684e' : isMed ? '#d99b45' : '#2d896b'

        const iconHtml = `
          <div class="osm-bin-marker" style="border-color: ${color};">
            <div class="bin-fill-indicator" style="height: ${bin.fillPercent}%; background: ${color};"></div>
          </div>
        `

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-div-icon',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        })

        const marker = L.marker(bin.coordinates, { icon })
        marker.bindPopup(`
          <div class="osm-popup-card">
            <div class="osm-popup-head">
              <strong>${bin.locationName} (${bin.code})</strong>
              <small>${bin.ward}</small>
            </div>
            <div class="osm-popup-meta">
              <div>Fill Level: <b>${bin.fillPercent}%</b></div>
              <div>Stream: <b>${bin.wasteType}</b></div>
              <div>Temp: <b>${bin.temperatureC}°C</b></div>
              <div>Battery: <b>${bin.batteryPercent}%</b></div>
              <div>Last Emptied: <b>${bin.lastEmptied}</b></div>
            </div>
          </div>
        `, { minWidth: 190 })

        groups.smartBins.addLayer(marker)
      })
    }

    // 10. AI-OPTIMIZED ROUTE POLYLINES
    groups.routes.clearLayers()
    if (showRoutes) {
      const delayedCorridor: [number, number][] = [
        [37.7858, -122.4065],
        [37.7880, -122.4010],
        [37.7910, -122.3990],
        [37.7950, -122.3980]
      ]
      const aiOptimalBypass: [number, number][] = [
        [37.7858, -122.4065],
        [37.7820, -122.4080],
        [37.7800, -122.4020],
        [37.7850, -122.3960],
        [37.7950, -122.3980]
      ]

      const polyRed = L.polyline(delayedCorridor, {
        color: '#d4684e',
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.85
      })

      const polyGreen = L.polyline(aiOptimalBypass, {
        color: '#2d896b',
        weight: 4,
        opacity: 0.85
      })

      groups.routes.addLayer(polyRed)
      groups.routes.addLayer(polyGreen)
    }

    // 11. CONTAMINATION HEATMAP LAYER
    groups.heatmaps.clearLayers()
    if (showHeatmap) {
      sfContaminationHotspots.forEach(spot => {
        const isHigh = spot.intensity === 'high'
        const color = isHigh ? '#d4684e' : '#d99b45'

        const circle = L.circle(spot.coords, {
          radius: spot.radius,
          color: color,
          weight: 1,
          fillColor: color,
          fillOpacity: isHigh ? 0.32 : 0.2
        })

        circle.bindTooltip(`
          <div class="osm-tooltip">
            <strong>${spot.name}</strong>
            <small>High Contamination Risk Hotspot</small>
          </div>
        `, { sticky: true })

        groups.heatmaps.addLayer(circle)
      })
    }

    // 12. DYNAMIC WAYPOINT ROUTING LINE
    groups.waypointRoute.clearLayers()
    if (activeWaypoint) {
      const truckPos = activeWaypoint.nearestVehicle.coordinates
      const destPos = activeWaypoint.coords

      const line = L.polyline([truckPos, destPos], {
        color: '#d2e970',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.95
      })

      const pinIcon = L.divIcon({
        html: `
          <div class="osm-waypoint-pin">
            <span>📍</span>
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })

      const destMarker = L.marker(destPos, { icon: pinIcon })

      groups.waypointRoute.addLayer(line)
      groups.waypointRoute.addLayer(destMarker)
    }

  }, [
    currentTheme, 
    zones, 
    simulatedFleet, 
    facilities, 
    landfill, 
    smartBins, 
    activeZone, 
    showVehicles, 
    showFacilities, 
    showLandfill, 
    showSmartBins, 
    showWards, 
    showRoutes, 
    showHeatmap, 
    show311,
    showEnvSensors,
    showMarineBooms,
    showCircularHubs,
    activeWaypoint
  ])

  // Confirm Waypoint Dispatch Action
  const handleConfirmWaypointDispatch = () => {
    if (!activeWaypoint) return
    playDispatchConfirm()

    const newTask: QueueItem = {
      id: `task-${Date.now().toString().slice(-4)}`,
      time: 'Just now',
      title: `GPS Waypoint Dispatch (${activeWaypoint.distanceKm} km)`,
      detail: `Assigned to Unit ${activeWaypoint.nearestVehicle.id} (${activeWaypoint.nearestVehicle.crewLeader}). Destination coordinates: [${activeWaypoint.coords[0].toFixed(4)}, ${activeWaypoint.coords[1].toFixed(4)}]`,
      severity: 'medium',
      assignedVehicle: activeWaypoint.nearestVehicle.id,
      zone: activeWaypoint.nearestVehicle.zone,
      status: 'Pending',
      recommendation: `Dynamic route computed: ETA ~${activeWaypoint.durationMin} mins via arterial corridor.`
    }

    if (onWaypointTaskDispatched) {
      onWaypointTaskDispatched(newTask)
    }

    onTriggerNotice(`Dispatched Unit ${activeWaypoint.nearestVehicle.id} to selected map waypoint (${activeWaypoint.distanceKm} km)!`)
    setActiveWaypoint(null)
    setWaypointMode(false)
  }

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.setView(SF_CENTER_COORDS, 13)
    onTriggerNotice(`OpenStreetMap view reset to San Francisco.`)
  }

  return (
    <div className={`osm-wrapper ${isFullscreen ? 'fullscreen-map' : ''}`} style={{ height: isFullscreen ? '100vh' : height }}>
      {/* Top Map Control Bar */}
      <div className="osm-toolbar">
        <div className="osm-tool-group">
          {/* SF District Selector */}
          <div className="osm-hub-selector">
            <Compass size={13} />
            <select 
              value={activeZone} 
              onChange={(e) => handleSelectDistrict(e.target.value)}
              className="hub-select"
            >
              <option value="All-SF">🌉 San Francisco Overview (All Districts)</option>
              {zones.map(z => (
                <option key={z.name} value={z.name}>
                  📍 {z.name} ({z.score} pts · {z.segregationRate}% Seg)
                </option>
              ))}
            </select>
          </div>

          {/* SF 311 Citizen Incidents Toggle */}
          <button 
            className={`osm-layer-chip ${show311 ? 'active' : ''}`}
            onClick={() => setShow311(!show311)}
            title="Toggle SF 311 citizen incident pins"
          >
            <AlertTriangle size={12} /> SF 311 ({mockSF311Incidents.length})
          </button>

          {/* Environmental Air & Odor Sensors Toggle */}
          <button 
            className={`osm-layer-chip ${showEnvSensors ? 'active' : ''}`}
            onClick={() => setShowEnvSensors(!showEnvSensors)}
            title="Toggle BAAQMD air quality & odor sensors"
          >
            <Wind size={12} /> Air & Odor ({mockEnvironmentalSensors.length})
          </button>

          {/* Marine Trash Booms Toggle */}
          <button 
            className={`osm-layer-chip ${showMarineBooms ? 'active' : ''}`}
            onClick={() => setShowMarineBooms(!showMarineBooms)}
            title="Toggle coastal marine trash booms"
          >
            <Waves size={12} /> Marine Booms ({mockMarineBooms.length})
          </button>

          {/* Circular Recovery Hubs Toggle */}
          <button 
            className={`osm-layer-chip ${showCircularHubs ? 'active' : ''}`}
            onClick={() => setShowCircularHubs(!showCircularHubs)}
            title="Toggle specialized circular depots"
          >
            <Building2 size={12} /> Circular Hubs ({mockCircularHubs.length})
          </button>

          {/* Fleet Vehicles */}
          <button 
            className={`osm-layer-chip ${showVehicles ? 'active' : ''}`}
            onClick={() => setShowVehicles(!showVehicles)}
          >
            <Truck size={12} /> Fleet ({fleet.length})
          </button>

          {/* Recycling Plants */}
          <button 
            className={`osm-layer-chip ${showFacilities ? 'active' : ''}`}
            onClick={() => setShowFacilities(!showFacilities)}
          >
            <Factory size={12} /> Plants ({facilities.length})
          </button>

          {/* Smart Bins */}
          <button 
            className={`osm-layer-chip ${showSmartBins ? 'active' : ''}`}
            onClick={() => setShowSmartBins(!showSmartBins)}
          >
            <Trash2 size={12} /> Smart Bins ({smartBins.length})
          </button>

          {/* Heatmap */}
          <button 
            className={`osm-layer-chip ${showHeatmap ? 'active' : ''}`}
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            <Flame size={12} /> Heatmap
          </button>

          {/* Waypoint Dispatch Mode Toggle */}
          <button 
            className={`osm-layer-chip ${waypointMode ? 'waypoint-active' : ''}`}
            onClick={() => {
              setWaypointMode(!waypointMode)
              if (!waypointMode) {
                onTriggerNotice('Click anywhere on the map to set a dispatch waypoint for nearest truck!')
              } else {
                setActiveWaypoint(null)
              }
            }}
            title="Click map to calculate nearest truck route"
          >
            <MapPin size={12} /> {waypointMode ? 'Click Map Target' : 'Waypoint Tool'}
          </button>
        </div>

        <div className="osm-tool-right">
          {/* GPS Simulation Toggle */}
          <button 
            className={`osm-gps-toggle ${isSimulatingGps ? 'live' : ''}`}
            onClick={() => {
              setIsSimulatingGps(!isSimulatingGps)
              onTriggerNotice(isSimulatingGps ? 'GPS Telemetry simulation paused.' : 'Live GPS movement simulation active on OpenStreetMap.')
            }}
            title="Simulate live truck GPS travel"
          >
            {isSimulatingGps ? <Square size={11} /> : <Play size={11} />}
            <span>{isSimulatingGps ? 'Live GPS Active' : 'Simulate GPS'}</span>
          </button>

          {/* Theme Selector */}
          <div className="osm-theme-switch">
            <button 
              className={currentTheme === 'voyager' ? 'active' : ''} 
              onClick={() => setCurrentTheme('voyager')}
              title="CartoDB Voyager (Light)"
            >
              <Sun size={12} /> Light
            </button>
            <button 
              className={currentTheme === 'dark' ? 'active' : ''} 
              onClick={() => setCurrentTheme('dark')}
              title="CartoDB Dark Matter"
            >
              <Moon size={12} /> Dark
            </button>
            <button 
              className={currentTheme === 'satellite' ? 'active' : ''} 
              onClick={() => setCurrentTheme('satellite')}
              title="Esri Satellite Imagery"
            >
              <Satellite size={12} /> Satellite
            </button>
            <button 
              className={currentTheme === 'osm' ? 'active' : ''} 
              onClick={() => setCurrentTheme('osm')}
              title="Standard OpenStreetMap"
            >
              <Layers size={12} /> OSM
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button 
            className="osm-icon-btn" 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Actual Map Canvas */}
      <div ref={mapContainerRef} className={`osm-map-element ${waypointMode ? 'crosshair-cursor' : ''}`} />

      {/* Floating Waypoint Calculation Card */}
      {activeWaypoint && (
        <div className="osm-waypoint-card">
          <div className="wp-head">
            <span className="wp-badge">📍 WAYPOINT CALCULATED</span>
            <button onClick={() => setActiveWaypoint(null)} className="wp-close">✕</button>
          </div>
          <div className="wp-body">
            <div>Nearest Truck: <strong>{activeWaypoint.nearestVehicle.id} ({activeWaypoint.nearestVehicle.crewLeader})</strong></div>
            <div>Distance: <strong>{activeWaypoint.distanceKm} km</strong> · Est. Transit: <strong>{activeWaypoint.durationMin} mins</strong></div>
            <small>Optimal route calculated avoiding commercial congestion corridors.</small>
          </div>
          <button className="primary-btn-sm full-w mt-2" onClick={handleConfirmWaypointDispatch}>
            Confirm Dispatch to Waypoint
          </button>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="osm-legend-overlay">
        <div className="legend-item"><span className="dot dot-green" /> Moving (&gt;15km/h)</div>
        <div className="legend-item"><span className="dot dot-orange" /> Dwell / Delay Risk</div>
        <div className="legend-item"><span className="dot dot-blue" /> Unloading / MRF Gate</div>
        <div className="legend-divider" />
        <div className="legend-route"><span className="line line-dashed" /> Congested Corridor</div>
        <div className="legend-route"><span className="line line-solid" /> AI Bypass Route</div>
      </div>
    </div>
  )
}
