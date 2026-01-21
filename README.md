### EcoGuard - Real-Time Forest Monitoring System

    EcoGuard is a cutting-edge progressive web application (PWA) designed for forest rangers working in challenging 
    connectivity environments. The system enables incident reporting (poaching, deforestation, fires) with an offline-first 
    approach and real-time synchronization.

### Key Features

    Interactive Mapping: Visualization of protected areas and incidents via Leaflet and PostGIS.

    Offline-First & Background Sync: Incident entry without network access, local storage in Dexie.js (IndexedDB)
    and automatic synchronization via Service Worker upon restoration of 4G/5G.

    Real-Time (WebSockets): Instant notification of new incidents between all connected guards via GraphQL Subscriptions.
    Enhanced Security: Authentication via HttpOnly Cookies, strict CORS filtering, and secure identification of requests 
    originating from the Service Worker.

    Field UX: Touchscreen reporting form, precise manual repositioning of GPS points, and responsive toast notifications.

### Technical Architecture

    Backend (Java / Spring Boot)
    Spring Boot 3.x with Spring Security (Stateless).
    Spring GraphQL: Optimized communication via Queries, Mutations, and Subscriptions.
    PostGIS: Spatial database for storing geometries (incidents and zones).
    Project Reactor: Reactive management of WebSocket streams.
    Frontend (React / TypeScript)
    Apollo Client: Intelligent cache management and hybrid routing (HTTP/WS) via SplitLink.
    React-Leaflet: Map rendering engine.
    Dexie.js: IndexedDB layer for local data persistence.
    Service Worker: Background synchronization manager and network proxy.

    ### ⚡ Performance & High Availability
        - **Redis (Cache & Broker)**: Accelerated geographic reads and distributed session management.
        - **Rate Limiting (Token Bucket)**: Protection against denial-of-service (DoS) attacks and API abuse, 
            ensuring availability for field agents.


### Installation & Configuration

    ### Backend Prerequisites
        Java 17
        PostgreSQL 16+ avec l'extension PostGIS
        Redis 
    ###Frontend (ecoguardui) Prerequisites
        Node.js 20+
        Configuration Frontend (.env)
            REACT_APP_BASE_URL=http://localhost:8081/graphql
            REACT_APP_WS_URL=ws://localhost:8081/graphql

### Offline Sync Flow

    -Entry: The agent fills out the form in the white area.
    -Storage: The incident is saved in Dexie with a pending status.
    -Waiting: The Service Worker records a sync-incidents task.
    -Response: As soon as the browser detects the network, the Service Worker sends 
        data via a GraphQL mutation secured by an X-Source-SW header.
    -Validation: The Java server saves the entry to the database and notifies all agents via WebSocket.

### Security

    Project uses defense in depth:
        -Tokens are never accessible via JavaScript (HttpOnly).
        -Each synchronization request is validated by the worker's origin and specific header.
        -GraphQL schemas are strictly typed to prevent data injection.

### Future Developments

    -HTTP/3 protocol support for very low-latency areas.
    -Massive map tile caching for 100% blind mode.
    -Algorithm for calculating the shortest path to an incident via forest trails.