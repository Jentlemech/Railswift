# BharatRail API Examples

## 1. Register

### Request

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "password": "StrongPass123",
  "phoneNumber": "9876543210"
}
```

### Response

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "0c3d5ce7-2f58-477d-a0e3-e50781ab4e9c",
      "name": "Aarav Sharma",
      "email": "aarav@example.com",
      "phone_number": "9876543210"
    }
  }
}
```

## 2. Train Search

### Request

```http
GET /api/trains/search?from=NDLS&to=BCT&date=2026-03-20
```

### Response

```json
{
  "success": true,
  "message": "Trains fetched successfully.",
  "data": {
    "route": {
      "from": "NDLS",
      "to": "BCT",
      "date": "2026-03-20"
    },
    "count": 1,
    "trains": [
      {
        "id": 1,
        "train_number": "22436",
        "train_name": "Vande Bharat Express",
        "source_station": "NDLS",
        "destination_station": "BCT",
        "departure_time": "06:00:00",
        "arrival_time": "14:10:00",
        "duration": "08:10",
        "seat_inventory": [
          {
            "id": 1,
            "class_type": "Sleeper",
            "total_seats": 120,
            "available_seats": 120
          }
        ]
      }
    ]
  }
}
```

## 3. Booking

### Request

```http
POST /api/bookings
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "trainId": 1,
  "journeyDate": "2026-03-20",
  "classType": "3AC",
  "passengers": [
    {
      "name": "Aarav Sharma",
      "age": 29,
      "gender": "Male",
      "seatPreference": "Lower"
    },
    {
      "name": "Riya Sharma",
      "age": 27,
      "gender": "Female",
      "seatPreference": "Window"
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "message": "Booking created successfully.",
  "data": {
    "id": "3f2d6a31-6b02-4b0f-a401-5ef29dc2d6cd",
    "pnr_number": "4837261950",
    "journey_date": "2026-03-20",
    "booking_status": "Confirmed",
    "class_type": "3AC",
    "total_fare": "2480.00",
    "train": {
      "id": 1,
      "train_number": "22436",
      "train_name": "Vande Bharat Express",
      "source_station": "NDLS",
      "destination_station": "BCT",
      "departure_time": "06:00:00",
      "arrival_time": "14:10:00",
      "duration": "08:10"
    },
    "passengers": [
      {
        "id": 1,
        "name": "Aarav Sharma",
        "age": 29,
        "gender": "Male",
        "seat_number": "B1",
        "seat_preference": "Lower"
      }
    ]
  }
}
```

## 4. PNR Check

### Request

```http
GET /api/pnr/4837261950
```

### Response

```json
{
  "success": true,
  "data": {
    "pnr_number": "4837261950",
    "booking_status": "Confirmed",
    "journey_date": "2026-03-20",
    "train": {
      "id": 1,
      "train_number": "22436",
      "train_name": "Vande Bharat Express",
      "source_station": "NDLS",
      "destination_station": "BCT",
      "departure_time": "06:00:00",
      "arrival_time": "14:10:00",
      "duration": "08:10"
    },
    "passengers": [
      {
        "id": 1,
        "name": "Aarav Sharma",
        "age": 29,
        "gender": "Male",
        "seat_number": "B1",
        "seat_preference": "Lower"
      }
    ]
  }
}
```
