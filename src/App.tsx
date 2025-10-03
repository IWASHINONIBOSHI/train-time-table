import React from 'react'
import { Clock, Train } from 'lucide-react'

function App() {
  // 現在時刻を取得
  const now = new Date()
  const currentTime = now.toLocaleTimeString('ja-JP')

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <h1 className="text-xl font-bold mb-2">仙台市地下鉄時刻表</h1>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Clock className="w-4 h-4" />
            <span>{currentTime}</span>
          </div>
        </div>
        
        {/* コンテンツエリア */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 text-lg font-bold">
              <span>薬師堂</span>
              <div className="text-blue-500 text-2xl">→</div>
              <span>仙台</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">仙台市地下鉄東西線</div>
          </div>
          
          {/* 次の電車（モック） */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl text-center shadow-lg animate-pulse">
            <div className="text-4xl font-bold font-mono mb-2">
              {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes() + 5).padStart(2, '0')}
            </div>
            <div className="text-xl opacity-90">5分後</div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Train className="w-4 h-4" />
              <span className="text-sm"> 準備しましょう</span>
            </div>
          </div>
          
          {/* 動作確認メッセージ */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-center">
              <strong>アプリが正常に動作しています。</strong><br/>
              基本設定が完了しました。
            </p>
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default App
