# GizanTech Temperature Monitor - Frontend

This is the frontend for the GizanTech Temperature Monitoring System, built with React and TypeScript. It provides a real-time dashboard that displays temperature data from the backend API.

## Features

- Real-time temperature updates using WebSockets
- Responsive design that works on desktop and mobile
- Interactive chart showing temperature history
- Connection status indicator
- Error handling and loading states

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend server (see backend README for setup)

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd gizan-tech-temp-monitor/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend directory if you need to customize any environment variables (optional)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Environment Variables

You can customize the following environment variables by creating a `.env` file in the frontend directory:

- `REACT_APP_API_URL` - The URL of the backend API (default: `http://localhost:5000`)

## Project Structure

```
src/
  ├── App.tsx            # Main application component
  ├── App.css            # Main styles
  ├── index.tsx          # Application entry point
  ├── index.css          # Global styles
  └── setupTests.ts      # Test setup
```

## Dependencies

- React 18
- TypeScript
- Chart.js & react-chartjs-2 for data visualization
- Socket.IO client for real-time updates
- React Testing Library for testing

## Browser Support

The application is tested on the latest versions of:
- Chrome
- Firefox
- Safari
- Edge

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
