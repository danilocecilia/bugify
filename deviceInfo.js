function getDeviceInfo() {
  const userAgent = navigator.userAgent
  let deviceType = 'Desktop/Laptop'
  let os = 'Unknown'
  let osVersion = 'Unknown'

  // Detect device type
  if (/Mobi|Android/i.test(userAgent)) {
    deviceType = 'Mobile'
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = 'Tablet'
  }

  // Detect OS
  if (userAgent.includes('Windows NT 10.0')) {
    os = 'Windows'
    osVersion = '10 or 11'
  } else if (userAgent.includes('Windows NT 6.2')) {
    os = 'Windows'
    osVersion = '8'
  } else if (userAgent.includes('Windows NT 6.1')) {
    os = 'Windows'
    osVersion = '7'
  } else if (/Mac/i.test(userAgent)) {
    os = 'MacOS'
    osVersion = 'Unknown'
  } else if (/Android/i.test(userAgent)) {
    os = 'Android'
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    os = 'iOS'
  } else if (/Linux/i.test(userAgent)) {
    os = 'Linux'
  }

  return {
    deviceType,
    os,
    osVersion,
  }
}
