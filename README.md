# WatchTowerAI

AI College Security & Surveillance System is an AI-powered security platform designed to monitor college premises through CCTV cameras or live video feeds. The system uses Computer Vision, YOLO, and OpenCV to automatically detect people, vehicles, restricted-area entry, suspicious activities, and other security-related events in real time.

When the system detects a potentially dangerous or unauthorized event, it can generate an alert, capture evidence, and store the incident details in a database. A web-based admin dashboard allows authorized security staff to view live camera feeds, detected incidents, alerts, and historical records.

## Stacks:

**React, Django, DRF, PostgreSQL, YOLO, OpenCV**

## System Architecture:

```text
Frontend
React
│
│ HTTP / JSON
↓
Django + DRF
│
├── PostgreSQL
├── Authentication / RBAC
└── Incident APIs

CV Worker
Python
├── OpenCV
├── Ultralytics YOLO
├── Tracking
└── Zone/event logic
        │
        ↓
   Django API
```

## Repo Architecture:

```text
watchtowerai/
│
├── backend/
├── frontend/
├── cv/
├── docs/
└── README.md
```

## Example Case Working:

```text
              Camera frame
┌──────────────────────────────────┐
│                                  │
│       ┌────────────────┐         │
│       │ RESTRICTED     │         │
│       │      👤        │         │
│       │                │         │
│       └────────────────┘         │
│                                  │
└──────────────────────────────────┘


YOLO detection
       ↓
person bounding box
       ↓
person coordinates
       ↓
zone polygon
       ↓
point-in-polygon test
       ↓
INTRUSION


Video
  ↓
YOLO
  ↓
Person enters restricted zone
  ↓
Event generated
  ↓
Snapshot captured
  ↓
POST /api/incidents/
  ↓
PostgreSQL


Incident #17
Type: Restricted Area Intrusion
Camera: Main Gate
Timestamp: ...
Confidence: 0.91
Evidence: intrusion_17.jpg
```

## Dev Notes:

Abuzar, Team Lead: "Hi, this is a completely a new type of project with tech req that we have barely worked on. This is exactly the type of challenge I believe we will excell in, grasping new tech, binding and utilizing them together to solve a real worked problem in a workable, deployable and usable product."

Anuj, Frontend Lead: ""

Shikha, Frontend Dev: ""

Shivangi, Backend Dev: ""

## PS: 
WatchTowerAI is our 7th sem uni's minor-project, currently under development.
