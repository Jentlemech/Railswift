$ErrorActionPreference = 'Stop'

$zones = @(
  'Northern Railway','Southern Railway','Eastern Railway','Western Railway','Central Railway',
  'South Central Railway','South Western Railway','North Eastern Railway','East Coast Railway',
  'East Central Railway','North Central Railway','North Western Railway','West Central Railway',
  'South East Central Railway','South Eastern Railway','Northeast Frontier Railway','Konkan Railway'
)

$states = @(
  'Delhi','Kerala','Tamil Nadu','Karnataka','Maharashtra','Gujarat','West Bengal','Uttar Pradesh','Bihar','Odisha',
  'Telangana','Andhra Pradesh','Rajasthan','Madhya Pradesh','Punjab','Haryana','Assam','Jharkhand','Chhattisgarh',
  'Goa','Uttarakhand','Himachal Pradesh','Jammu and Kashmir'
)

$seedStations = @(
  @{name='New Delhi';code='NDLS';city='New Delhi';state='Delhi';zone='Northern Railway';enquiry='139';address='Ajmeri Gate, New Delhi'},
  @{name='Aluva';code='AWY';city='Aluva';state='Kerala';zone='Southern Railway';enquiry='139';address='Railway Station Road, Aluva'},
  @{name='Kozhikode';code='CLT';city='Kozhikode';state='Kerala';zone='Southern Railway';enquiry='139';address='Railway Station Link Road, Kozhikode'},
  @{name='Ernakulam Junction';code='ERS';city='Kochi';state='Kerala';zone='Southern Railway';enquiry='139';address='South Junction, Kochi'},
  @{name='Mangaluru Central';code='MAQ';city='Mangaluru';state='Karnataka';zone='Southern Railway';enquiry='139';address='Bunder, Mangaluru'},
  @{name='Chennai Central';code='MAS';city='Chennai';state='Tamil Nadu';zone='Southern Railway';enquiry='139';address='Park Town, Chennai'},
  @{name='Chennai Egmore';code='MS';city='Chennai';state='Tamil Nadu';zone='Southern Railway';enquiry='139';address='Egmore, Chennai'},
  @{name='Bengaluru City';code='SBC';city='Bengaluru';state='Karnataka';zone='South Western Railway';enquiry='139';address='Majestic, Bengaluru'},
  @{name='Yesvantpur Junction';code='YPR';city='Bengaluru';state='Karnataka';zone='South Western Railway';enquiry='139';address='Yesvantpur, Bengaluru'},
  @{name='Mumbai Central';code='MMCT';city='Mumbai';state='Maharashtra';zone='Western Railway';enquiry='139';address='Tardeo, Mumbai'},
  @{name='Lokmanya Tilak Terminus';code='LTT';city='Mumbai';state='Maharashtra';zone='Central Railway';enquiry='139';address='Kurla, Mumbai'},
  @{name='Chhatrapati Shivaji Maharaj Terminus';code='CSMT';city='Mumbai';state='Maharashtra';zone='Central Railway';enquiry='139';address='Fort, Mumbai'},
  @{name='Howrah Junction';code='HWH';city='Howrah';state='West Bengal';zone='Eastern Railway';enquiry='139';address='Howrah, Kolkata Metro Region'},
  @{name='Sealdah';code='SDAH';city='Kolkata';state='West Bengal';zone='Eastern Railway';enquiry='139';address='Sealdah, Kolkata'},
  @{name='Patna Junction';code='PNBE';city='Patna';state='Bihar';zone='East Central Railway';enquiry='139';address='Fraser Road, Patna'},
  @{name='Bhubaneswar';code='BBS';city='Bhubaneswar';state='Odisha';zone='East Coast Railway';enquiry='139';address='Master Canteen Square, Bhubaneswar'},
  @{name='Puri';code='PURI';city='Puri';state='Odisha';zone='East Coast Railway';enquiry='139';address='Station Road, Puri'},
  @{name='Ahmedabad Junction';code='ADI';city='Ahmedabad';state='Gujarat';zone='Western Railway';enquiry='139';address='Kalupur, Ahmedabad'},
  @{name='Surat';code='ST';city='Surat';state='Gujarat';zone='Western Railway';enquiry='139';address='Station Road, Surat'},
  @{name='Vadodara Junction';code='BRC';city='Vadodara';state='Gujarat';zone='Western Railway';enquiry='139';address='Alkapuri, Vadodara'},
  @{name='Jaipur';code='JP';city='Jaipur';state='Rajasthan';zone='North Western Railway';enquiry='139';address='Station Road, Jaipur'},
  @{name='Ajmer Junction';code='AII';city='Ajmer';state='Rajasthan';zone='North Western Railway';enquiry='139';address='Railway Station Area, Ajmer'},
  @{name='Jodhpur Junction';code='JU';city='Jodhpur';state='Rajasthan';zone='North Western Railway';enquiry='139';address='Station Road, Jodhpur'},
  @{name='Lucknow Charbagh';code='LKO';city='Lucknow';state='Uttar Pradesh';zone='Northern Railway';enquiry='139';address='Charbagh, Lucknow'},
  @{name='Kanpur Central';code='CNB';city='Kanpur';state='Uttar Pradesh';zone='North Central Railway';enquiry='139';address='Kanpur Central Area, Kanpur'},
  @{name='Prayagraj Junction';code='PRYJ';city='Prayagraj';state='Uttar Pradesh';zone='North Central Railway';enquiry='139';address='Civil Lines, Prayagraj'},
  @{name='Varanasi Junction';code='BSB';city='Varanasi';state='Uttar Pradesh';zone='North Eastern Railway';enquiry='139';address='Cantt, Varanasi'},
  @{name='Gorakhpur Junction';code='GKP';city='Gorakhpur';state='Uttar Pradesh';zone='North Eastern Railway';enquiry='139';address='Railway Station Road, Gorakhpur'},
  @{name='Secunderabad Junction';code='SC';city='Secunderabad';state='Telangana';zone='South Central Railway';enquiry='139';address='Station Road, Secunderabad'},
  @{name='Hyderabad Deccan';code='HYB';city='Hyderabad';state='Telangana';zone='South Central Railway';enquiry='139';address='Nampally, Hyderabad'},
  @{name='Vijayawada Junction';code='BZA';city='Vijayawada';state='Andhra Pradesh';zone='South Central Railway';enquiry='139';address='Railway Station Road, Vijayawada'},
  @{name='Visakhapatnam';code='VSKP';city='Visakhapatnam';state='Andhra Pradesh';zone='East Coast Railway';enquiry='139';address='Station Road, Visakhapatnam'},
  @{name='Guntur Junction';code='GNT';city='Guntur';state='Andhra Pradesh';zone='South Central Railway';enquiry='139';address='Railway Station Area, Guntur'},
  @{name='Nagpur';code='NGP';city='Nagpur';state='Maharashtra';zone='Central Railway';enquiry='139';address='Sitabuldi, Nagpur'},
  @{name='Pune Junction';code='PUNE';city='Pune';state='Maharashtra';zone='Central Railway';enquiry='139';address='Station Road, Pune'},
  @{name='Nashik Road';code='NK';city='Nashik';state='Maharashtra';zone='Central Railway';enquiry='139';address='Nashik Road, Nashik'},
  @{name='Bhopal Junction';code='BPL';city='Bhopal';state='Madhya Pradesh';zone='West Central Railway';enquiry='139';address='Station Area, Bhopal'},
  @{name='Jabalpur';code='JBP';city='Jabalpur';state='Madhya Pradesh';zone='West Central Railway';enquiry='139';address='Railway Station Road, Jabalpur'},
  @{name='Indore Junction';code='INDB';city='Indore';state='Madhya Pradesh';zone='West Central Railway';enquiry='139';address='Station Road, Indore'},
  @{name='Ujjain Junction';code='UJN';city='Ujjain';state='Madhya Pradesh';zone='West Central Railway';enquiry='139';address='Railway Station, Ujjain'},
  @{name='Raipur Junction';code='R';city='Raipur';state='Chhattisgarh';zone='South East Central Railway';enquiry='139';address='Station Road, Raipur'},
  @{name='Bilaspur Junction';code='BSP';city='Bilaspur';state='Chhattisgarh';zone='South East Central Railway';enquiry='139';address='Bilaspur Station Area'},
  @{name='Ranchi';code='RNC';city='Ranchi';state='Jharkhand';zone='South Eastern Railway';enquiry='139';address='Station Road, Ranchi'},
  @{name='Dhanbad Junction';code='DHN';city='Dhanbad';state='Jharkhand';zone='East Central Railway';enquiry='139';address='Dhanbad Railway Colony'},
  @{name='Asansol Junction';code='ASN';city='Asansol';state='West Bengal';zone='Eastern Railway';enquiry='139';address='Asansol Station Road'},
  @{name='Guwahati';code='GHY';city='Guwahati';state='Assam';zone='Northeast Frontier Railway';enquiry='139';address='Paltan Bazaar, Guwahati'},
  @{name='Dibrugarh';code='DBRG';city='Dibrugarh';state='Assam';zone='Northeast Frontier Railway';enquiry='139';address='Railway Colony, Dibrugarh'},
  @{name='Jammu Tawi';code='JAT';city='Jammu';state='Jammu and Kashmir';zone='Northern Railway';enquiry='139';address='Jammu Railway Station Road'},
  @{name='Katra';code='SVDK';city='Katra';state='Jammu and Kashmir';zone='Northern Railway';enquiry='139';address='Katra Railway Station'},
  @{name='Amritsar Junction';code='ASR';city='Amritsar';state='Punjab';zone='Northern Railway';enquiry='139';address='Hall Gate, Amritsar'},
  @{name='Ludhiana Junction';code='LDH';city='Ludhiana';state='Punjab';zone='Northern Railway';enquiry='139';address='Railway Station Road, Ludhiana'},
  @{name='Chandigarh';code='CDG';city='Chandigarh';state='Haryana';zone='Northern Railway';enquiry='139';address='Industrial Area Phase I, Chandigarh'},
  @{name='Haridwar Junction';code='HW';city='Haridwar';state='Uttarakhand';zone='Northern Railway';enquiry='139';address='Railway Road, Haridwar'},
  @{name='Dehradun';code='DDN';city='Dehradun';state='Uttarakhand';zone='Northern Railway';enquiry='139';address='Railway Station Road, Dehradun'},
  @{name='Shimla';code='SML';city='Shimla';state='Himachal Pradesh';zone='Northern Railway';enquiry='139';address='Cart Road, Shimla'},
  @{name='Madgaon Junction';code='MAO';city='Madgaon';state='Goa';zone='Konkan Railway';enquiry='139';address='Margao, Goa'},
  @{name='Thiruvananthapuram Central';code='TVC';city='Thiruvananthapuram';state='Kerala';zone='Southern Railway';enquiry='139';address='Thampanoor, Thiruvananthapuram'},
  @{name='Kottayam';code='KTYM';city='Kottayam';state='Kerala';zone='Southern Railway';enquiry='139';address='Railway Station Road, Kottayam'},
  @{name='Thrissur';code='TCR';city='Thrissur';state='Kerala';zone='Southern Railway';enquiry='139';address='Poothole, Thrissur'},
  @{name='Shoranur Junction';code='SRR';city='Shoranur';state='Kerala';zone='Southern Railway';enquiry='139';address='Shoranur Station Road'},
  @{name='Tiruchchirappalli';code='TPJ';city='Tiruchirappalli';state='Tamil Nadu';zone='Southern Railway';enquiry='139';address='Railway Junction Road, Trichy'},
  @{name='Madurai Junction';code='MDU';city='Madurai';state='Tamil Nadu';zone='Southern Railway';enquiry='139';address='Periyar Bus Stand Road, Madurai'},
  @{name='Coimbatore Junction';code='CBE';city='Coimbatore';state='Tamil Nadu';zone='Southern Railway';enquiry='139';address='State Bank Road, Coimbatore'},
  @{name='Salem Junction';code='SA';city='Salem';state='Tamil Nadu';zone='Southern Railway';enquiry='139';address='Railway Junction, Salem'},
  @{name='Mysuru Junction';code='MYS';city='Mysuru';state='Karnataka';zone='South Western Railway';enquiry='139';address='Jhansi Rani Lakshmi Bai Road, Mysuru'},
  @{name='Hubballi Junction';code='UBL';city='Hubballi';state='Karnataka';zone='South Western Railway';enquiry='139';address='Railway Colony, Hubballi'},
  @{name='Belagavi';code='BGM';city='Belagavi';state='Karnataka';zone='South Western Railway';enquiry='139';address='Railway Station Road, Belagavi'}
)

$stations = New-Object System.Collections.Generic.List[object]
$codeSet = New-Object System.Collections.Generic.HashSet[string]

foreach ($s in $seedStations) {
  $stations.Add([ordered]@{
    stationName = $s.name
    stationCode = $s.code
    city = $s.city
    state = $s.state
    railwayZone = $s.zone
    enquiryNumber = $s.enquiry
    address = $s.address
  })
  [void]$codeSet.Add($s.code)
}

$targetCount = 7200
$index = 1
while ($stations.Count -lt $targetCount) {
  $code = ('S' + $index.ToString('0000'))
  if (-not $codeSet.Contains($code)) {
    $state = $states[($index % $states.Count)]
    $zone = $zones[($index % $zones.Count)]
    $city = "City-$($index.ToString('0000'))"
    $name = "Sample Junction $($index.ToString('0000'))"
    $stations.Add([ordered]@{
      stationName = $name
      stationCode = $code
      city = $city
      state = $state
      railwayZone = $zone
      enquiryNumber = '139'
      address = "Railway Station Road, $city, $state"
    })
    [void]$codeSet.Add($code)
  }
  $index++
}

$trainTypes = @('Express','Superfast','Rajdhani','Shatabdi','Vande Bharat','Passenger')
$dayPatterns = @(
  @('Mon','Tue','Wed','Thu','Fri','Sat','Sun'),
  @('Mon','Tue','Wed','Thu','Fri'),
  @('Mon','Wed','Fri'),
  @('Tue','Thu','Sat'),
  @('Sun','Tue','Thu'),
  @('Mon','Thu','Sat')
)

$classesPool = @('SL','3A','2A','1A','CC','2S')

$seedTrains = @(
  @{name='Mangala Lakshadweep Express';number='12617';from='ERS';to='MAQ';departure='23:45';arrival='09:30';duration='9h 45m';days=@('Mon','Tue','Wed','Thu','Fri','Sat','Sun');distance=412;type='Express';classes=@('SL','3A','2A','1A')},
  @{name='Karnataka Express';number='12627';from='NDLS';to='SBC';departure='06:20';arrival='08:10';duration='25h 50m';days=@('Mon','Tue','Wed','Thu','Fri','Sat','Sun');distance=2408;type='Superfast';classes=@('SL','3A','2A','1A')},
  @{name='Rajdhani Express';number='12951';from='MMCT';to='NDLS';departure='16:35';arrival='08:35';duration='16h 00m';days=@('Mon','Tue','Wed','Thu','Fri','Sat','Sun');distance=1384;type='Rajdhani';classes=@('3A','2A','1A')},
  @{name='Shatabdi Express';number='12028';from='SBC';to='MAS';departure='14:30';arrival='19:25';duration='4h 55m';days=@('Mon','Tue','Wed','Thu','Fri','Sat');distance=362;type='Shatabdi';classes=@('EC','CC')},
  @{name='Vande Bharat Express';number='22435';from='NDLS';to='BSB';departure='06:00';arrival='14:00';duration='8h 00m';days=@('Mon','Tue','Wed','Thu','Fri','Sat');distance=760;type='Vande Bharat';classes=@('EC','CC')},
  @{name='Howrah Mail';number='12809';from='HWH';to='CSMT';departure='20:00';arrival='05:00';duration='33h 00m';days=@('Mon','Tue','Wed','Thu','Fri','Sat','Sun');distance=1968;type='Express';classes=@('SL','3A','2A')},
  @{name='Kerala Express';number='12625';from='TVC';to='NDLS';departure='11:15';arrival='06:40';duration='43h 25m';days=@('Mon','Tue','Wed','Thu','Fri','Sat','Sun');distance=3031;type='Superfast';classes=@('SL','3A','2A','1A')},
  @{name='Tamil Nadu Express';number='12621';from='MAS';to='NDLS';departure='22:00';arrival='06:30';duration='32h 30m';days=@('Mon','Tue','Wed','Thu','Fri','Sat','Sun');distance=2180;type='Superfast';classes=@('SL','3A','2A','1A')},
  @{name='Jan Shatabdi Express';number='12081';from='TVC';to='KTYM';departure='05:15';arrival='07:40';duration='2h 25m';days=@('Mon','Tue','Wed','Thu','Fri','Sat');distance=111;type='Shatabdi';classes=@('CC','2S')},
  @{name='Intercity Express';number='22679';from='CBE';to='SBC';departure='06:00';arrival='12:10';duration='6h 10m';days=@('Mon','Tue','Wed','Thu','Fri','Sat','Sun');distance=363;type='Express';classes=@('CC','2S','SL')}
)

$trains = New-Object System.Collections.Generic.List[object]
$trainNumbers = New-Object System.Collections.Generic.HashSet[string]

foreach ($t in $seedTrains) {
  $fares = [ordered]@{}
  foreach ($c in $t.classes) {
    $base = switch ($c) {
      '2S' { 180 }
      'SL' { 420 }
      'CC' { 650 }
      '3A' { 980 }
      '2A' { 1480 }
      '1A' { 2450 }
      'EC' { 1890 }
      default { 500 }
    }
    $fares[$c] = $base + ($t.distance / 10)
  }

  $trains.Add([ordered]@{
    trainName = $t.name
    trainNumber = $t.number
    fromStation = $t.from
    toStation = $t.to
    departureTime = $t.departure
    arrivalTime = $t.arrival
    travelDuration = $t.duration
    runningDays = $t.days
    distanceKm = $t.distance
    trainType = $t.type
    availableClasses = $t.classes
    baseFares = $fares
  })
  [void]$trainNumbers.Add($t.number)
}

$targetTrains = 420
$idx = 1
while ($trains.Count -lt $targetTrains) {
  $from = $stations[($idx * 7) % $stations.Count]
  $to = $stations[($idx * 19) % $stations.Count]

  if ($from.stationCode -eq $to.stationCode) { $idx++; continue }

  $number = (10000 + $idx).ToString()
  if ($trainNumbers.Contains($number)) { $idx++; continue }

  $type = $trainTypes[$idx % $trainTypes.Count]
  $days = $dayPatterns[$idx % $dayPatterns.Count]

  $distance = 120 + (($idx * 13) % 2800)
  $depHour = ($idx * 3) % 24
  $depMin = (($idx * 17) % 60)
  $travelHours = 2 + (($idx * 11) % 36)
  $arrTotal = ($depHour * 60 + $depMin + $travelHours * 60 + (($idx * 7) % 60))
  $arrHour = [int](($arrTotal / 60) % 24)
  $arrMin = [int]($arrTotal % 60)

  $dep = '{0:00}:{1:00}' -f $depHour, $depMin
  $arr = '{0:00}:{1:00}' -f $arrHour, $arrMin
  $dur = '{0}h {1}m' -f $travelHours, (($idx * 7) % 60)

  $classesCount = 2 + ($idx % 5)
  $availClasses = @()
  for ($c = 0; $c -lt $classesCount; $c++) {
    $candidate = $classesPool[($idx + $c * 2) % $classesPool.Count]
    if ($availClasses -notcontains $candidate) { $availClasses += $candidate }
  }

  $fares = [ordered]@{}
  foreach ($c in $availClasses) {
    $base = switch ($c) {
      '2S' { 140 }
      'SL' { 320 }
      'CC' { 520 }
      '3A' { 860 }
      '2A' { 1280 }
      '1A' { 2200 }
      'EC' { 1700 }
      default { 400 }
    }
    $fares[$c] = [int]($base + ($distance / 6))
  }

  $trains.Add([ordered]@{
    trainName = "$type Corridor Express $number"
    trainNumber = $number
    fromStation = $from.stationCode
    toStation = $to.stationCode
    departureTime = $dep
    arrivalTime = $arr
    travelDuration = $dur
    runningDays = $days
    distanceKm = $distance
    trainType = $type
    availableClasses = $availClasses
    baseFares = $fares
  })

  [void]$trainNumbers.Add($number)
  $idx++
}

foreach ($st in $stations) {
  if (-not $st.Contains('contactNumber')) {
    $st.contactNumber = $st.enquiryNumber
  }
}
$stations | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 data/stations.json
$trains | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 data/trains.json

Write-Output "Generated stations: $($stations.Count)"
Write-Output "Generated trains: $($trains.Count)"


