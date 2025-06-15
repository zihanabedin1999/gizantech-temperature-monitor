import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { io, Socket } from 'socket.io-client';
import './App.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TemperatureData = {
  temperature: number;
  unit: string;
  timestamp: string;
};

type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
};

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0, // Disable animations to reduce resize issues
  },
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Real-time Temperature Monitoring',
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Temperature (°C)',
      },
    },
    x: {
      title: {
        display: true,
        text: 'Time',
      },
    },
  },
  // Suppress ResizeObserver warnings
  onResize: (chart: any, size: any) => {
    if (size.height !== 0 || size.width !== 0) {
      requestAnimationFrame(() => {
        chart.resize();
      });
    }
  }
};

const App: React.FC = () => {
  // State management
  const [currentTemp, setCurrentTemp] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [temperatureData, setTemperatureData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  });

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  // Handle temperature updates
  const handleTemperatureUpdate = useCallback((data: TemperatureData) => {
    setCurrentTemp(data.temperature);
    
    setTemperatureData(prevData => {
      const newLabels = [...prevData.labels, new Date().toLocaleTimeString()];
      const newData = [...prevData.datasets[0].data, data.temperature];
      
      // Keep only the last 20 data points
      if (newLabels.length > 20) {
        newLabels.shift();
        newData.shift();
      }
      
      return {
        labels: newLabels,
        datasets: [
          {
            ...prevData.datasets[0],
            data: newData,
          },
        ],
      };
    });
  }, []);

  // Chart reference callback
  const chartRef = useCallback((node: any) => {
    if (node !== null) {
      chartInstance.current = node;
    }
  }, []);

  // Handle errors
  const handleError = useCallback((error: Error) => {
    console.error('WebSocket error:', error);
    setError(`Error: ${error.message}`);
    setIsConnected(false);
  }, []);

  // Initialize WebSocket connection with retry logic
  const connectWebSocket = useCallback(() => {
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log('Attempting to connect to WebSocket server...');
    setError('Connecting to server...');

    // Connect to WebSocket server with reconnection options
    const socket = io('http://localhost:5000', {
      path: '/socket.io/',
      reconnection: true,
      reconnectionAttempts: Infinity, // Keep trying to reconnect
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      transports: ['websocket'],
      autoConnect: true,
      forceNew: true,
      withCredentials: true
    });

    // Store the socket in the ref
    socketRef.current = socket;

    // Connection established
    socket.on('connect', () => {
      console.log('Successfully connected to WebSocket server');
      setIsConnected(true);
      setError(null);
    });

    // Handle connection errors
    socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      setError(`Connection error: ${error.message}. Reconnecting...`);
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from WebSocket server:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server intentionally disconnected, try to reconnect
        socket.connect();
      }
    });

    // Handle reconnection attempts
    socket.on('reconnect_attempt', (attempt: number) => {
      const message = `Connection lost. Reconnecting (attempt ${attempt})...`;
      console.log(message);
      setError(message);
    });

    // Handle reconnection success
    socket.on('reconnect', (attempt: number) => {
      console.log(`Successfully reconnected after ${attempt} attempts`);
      setIsConnected(true);
      setError(null);
    });

    // Handle reconnection failure
    socket.on('reconnect_failed', () => {
      const message = 'Unable to reconnect to server. Please check your connection and refresh the page.';
      console.error(message);
      setError(message);
    });

    // Handle temperature updates
    socket.on('temperatureUpdate', handleTemperatureUpdate);

    // Handle errors
    socket.on('error', handleError);

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off('temperatureUpdate', handleTemperatureUpdate);
        socketRef.current.off('error', handleError);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [handleTemperatureUpdate, handleError]);

  // Initialize WebSocket connection on component mount
  useEffect(() => {
    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectWebSocket]);

  // Handle chart resize
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          // Force chart resize on container size change
          if (chartInstance.current) {
            chartInstance.current.resize();
          }
        }
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      if (chartContainerRef.current) {
        resizeObserver.unobserve(chartContainerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  // Manual reconnect function
  const handleReconnect = useCallback(() => {
    console.log('Manual reconnection attempt...');
    setError('Attempting to reconnect...');
    connectWebSocket();
  }, [connectWebSocket]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>GizanTech Temperature Monitor</h1>
        <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <main className="app-content">
        <div className="current-temp">
          <h2>Current Temperature</h2>
          <div className="temp-value">
            {currentTemp.toFixed(1)}°C
          </div>
        </div>

        <div className="chart-container" ref={chartContainerRef}>
          <Line 
            ref={chartRef}
            data={temperatureData} 
            options={chartOptions} 
          />
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={handleReconnect} className="retry-button">
              Retry Connection
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>GizanTech &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
