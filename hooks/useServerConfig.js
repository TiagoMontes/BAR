import { useState, useEffect } from 'react'
import config from '../lib/config.json'

const DEFAULT_SERVER_URL = config.serverUrl

export const getServerUrl = () => {
  const storedUrl = localStorage.getItem('serverUrl')
  return storedUrl || DEFAULT_SERVER_URL
}

export default function useServerConfig() {
  const [serverUrl, setServerUrl] = useState(getServerUrl())

  useEffect(() => {
    localStorage.setItem('serverUrl', serverUrl)
  }, [serverUrl])

  return {
    serverUrl,
    setServerUrl,
    getServerUrl
  }
} 