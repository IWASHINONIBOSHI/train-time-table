import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// HTML の <div id="root"> を取得
const rootElement = document.getElementById('root')!

// React アプリをマウント（表示）
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)