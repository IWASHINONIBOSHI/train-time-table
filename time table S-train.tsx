import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, Train, Calendar, Settings, Bell, Star } from 'lucide-react';

// TypeScript型定義
interface TrainTime {
  id: string;
  hour: number;
  minute: number;
  totalMinutes: number;
}

interface HourSchedule {
  h: number;
  m: number[];
}

interface TimeTableData {
  weekday: HourSchedule[];
  weekend: HourSchedule[];
}

interface Route {
  id: string;
  from: string;
  to: string;
  line: string;
  data: TimeTableData;
}

interface NextTrainInfo {
  train: TrainTime;
  waitMinutes: number;
  waitText: string;
}

// カスタムフック：現在時刻管理
const useCurrentTime = (intervalMs: number = 10000) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return currentTime;
};

// カスタムフック：次の電車計算
const useNextTrains = (route: Route, currentTime: Date) => {
  return useMemo(() => {
    const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;
    const data = isWeekend ? route.data.weekend : route.data.weekday;
    
    // 全電車を平坦化
    const allTrains: TrainTime[] = data.flatMap(hour => 
      hour.m.map(minute => ({
        id: `${hour.h}-${minute}`,
        hour: hour.h,
        minute,
        totalMinutes: hour.h * 60 + minute
      }))
    );

    const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    // 次の電車を検索
    const nextTrains = allTrains
      .filter(train => train.totalMinutes > currentTotalMinutes)
      .slice(0, 3);

    return nextTrains.map(train => ({
      train,
      waitMinutes: train.totalMinutes - currentTotalMinutes,
      waitText: formatWaitTime(train.totalMinutes - currentTotalMinutes)
    }));
  }, [route, currentTime]);
};

// ユーティリティ関数
const formatTime = (hour: number, minute: number): string => 
  `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

const formatWaitTime = (minutes: number): string => {
  if (minutes <= 0) return '';
  if (minutes < 60) return `${minutes}分後`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}時間${remainingMinutes}分後`;
};

// 時刻表のデータ（著作権まわりが怖いので、一応偽物にしてあります。）
//ここをSQLにしましょう！
const sendaiRouteData: Route = {
  id: 'yakushido-sendai',
  from: '薬師堂',
  to: '仙台',
  line: '仙台市地下鉄東西線',
  data: {
    weekday: [
      {h: 5, m: [30, 45]},
      {h: 6, m: [0, 15, 30, 45]},
      {h: 7, m: [0, 12, 24, 36, 48]},
      {h: 8, m: [0, 12, 24, 36, 48]},
      {h: 9, m: [0, 20, 40]},
      {h: 10, m: [0, 20, 40]},
      {h: 11, m: [0, 20, 40]},
      {h: 12, m: [0, 20, 40]},
      {h: 13, m: [0, 20, 40]},
      {h: 14, m: [0, 20, 40]},
      {h: 15, m: [0, 20, 40]},
      {h: 16, m: [0, 12, 24, 36, 48]},
      {h: 17, m: [0, 12, 24, 36, 48]},
      {h: 18, m: [0, 12, 24, 36, 48]},
      {h: 19, m: [0, 15, 30, 45]},
      {h: 20, m: [0, 15, 30, 45]},
      {h: 21, m: [0, 15, 30, 45]},
      {h: 22, m: [0, 15, 30, 45]},
      {h: 23, m: [0, 15, 30]}
    ],
    weekend: [
      {h: 6, m: [0, 20, 40]},
      {h: 7, m: [0, 20, 40]},
      {h: 8, m: [0, 20, 40]},
      {h: 9, m: [0, 20, 40]},
      {h: 10, m: [0, 20, 40]},
      {h: 11, m: [0, 20, 40]},
      {h: 12, m: [0, 20, 40]},
      {h: 13, m: [0, 20, 40]},
      {h: 14, m: [0, 20, 40]},
      {h: 15, m: [0, 20, 40]},
      {h: 16, m: [0, 20, 40]},
      {h: 17, m: [0, 20, 40]},
      {h: 18, m: [0, 20, 40]},
      {h: 19, m: [0, 20, 40]},
      {h: 20, m: [0, 20, 40]},
      {h: 21, m: [0, 20, 40]},
      {h: 22, m: [0, 20, 40]},
      {h: 23, m: [0, 20]}
    ]
  }
};

// コンポーネント：次の電車ハイライト
const NextTrainHighlight: React.FC<{ nextTrain?: NextTrainInfo }> = ({ nextTrain }) => {
  // アニメーション速度を計算する関数
  const getAnimationClass = (waitMinutes: number): string => {
    if (waitMinutes <= 1) return 'animate-ping'; // 1分以内：超高速点滅
    if (waitMinutes <= 3) return 'animate-pulse-fast'; // 3分以内：高速パルス
    if (waitMinutes <= 5) return 'animate-pulse'; // 5分以内：通常パルス
    if (waitMinutes <= 10) return 'animate-pulse-slow'; // 10分以内：ゆっくりパルス
    return 'animate-pulse-very-slow'; // 10分以上：とてもゆっくり
  };

  // 緊急度に応じた色を取得
  const getUrgencyColor = (waitMinutes: number): string => {
    if (waitMinutes <= 1) return 'from-red-500 to-red-600'; // 緊急：赤
    if (waitMinutes <= 3) return 'from-orange-500 to-orange-600'; // 注意：オレンジ
    if (waitMinutes <= 5) return 'from-yellow-500 to-yellow-600'; // 警告：黄色
    if (waitMinutes <= 10) return 'from-blue-500 to-blue-600'; // 通常：青
    return 'from-green-500 to-green-600'; // 余裕：緑
  };

  // 緊急度メッセージ
  const getUrgencyMessage = (waitMinutes: number): string => {
    if (waitMinutes <= 1) return '🚨 まもなく到着';
    if (waitMinutes <= 3) return '🏃‍♂️ 急いで！';
    if (waitMinutes <= 5) return '⏰ もうすぐです';
    if (waitMinutes <= 10) return '🚇 準備しましょう';
    return '☕ 余裕があります';
  };

  if (!nextTrain) {
    return (
      <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white p-6 rounded-xl text-center shadow-lg">
        <div className="text-lg opacity-90">本日の運行は終了しました</div>
      </div>
    );
  }

  const animationClass = getAnimationClass(nextTrain.waitMinutes);
  const colorClass = getUrgencyColor(nextTrain.waitMinutes);
  const urgencyMessage = getUrgencyMessage(nextTrain.waitMinutes);

  return (
    <div className={`bg-gradient-to-r ${colorClass} text-white p-6 rounded-xl text-center shadow-lg ${animationClass}`}>
      <div className="text-4xl font-bold font-mono mb-2">
        {formatTime(nextTrain.train.hour, nextTrain.train.minute)}
      </div>
      <div className="text-xl opacity-90 mb-2">{nextTrain.waitText}</div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <Bell className="w-4 h-4" />
        <span className="text-sm">{urgencyMessage}</span>
      </div>
      
      {/* 進行バー */}
      <div className="mt-4 bg-white bg-opacity-30 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-white h-full transition-all duration-1000"
          style={{ 
            width: nextTrain.waitMinutes <= 10 
              ? `${Math.max(10, 100 - (nextTrain.waitMinutes * 10))}%` 
              : '10%'
          }}
        ></div>
      </div>
    </div>
  );
};

// コンポーネント：電車リスト
const TrainList: React.FC<{ trains: NextTrainInfo[] }> = ({ trains }) => {
  if (trains.length === 0) return null;

  return (
    <div className="space-y-3">
      {trains.map((trainInfo, index) => (
        <div 
          key={trainInfo.train.id}
          className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Train className="w-5 h-5 text-blue-500" />
            <span className="text-xl font-mono">
              {formatTime(trainInfo.train.hour, trainInfo.train.minute)}
            </span>
          </div>
          <span className="text-gray-600">{trainInfo.waitText}</span>
        </div>
      ))}
    </div>
  );
};

// コンポーネント：時刻表モーダル
const TimetableModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  route: Route;
  currentTime: Date;
}> = ({ isOpen, onClose, route, currentTime }) => {
  const [selectedDay, setSelectedDay] = useState<'weekday' | 'weekend'>('weekday');
  
  const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;
  
  useEffect(() => {
    setSelectedDay(isWeekend ? 'weekend' : 'weekday');
  }, [isWeekend]);

  if (!isOpen) return null;

  const data = route.data[selectedDay];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">全時刻表</h2>
          <button 
            onClick={onClose}
            className="text-2xl hover:bg-blue-600 w-8 h-8 rounded flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 border-b">
          <div className="flex bg-gray-100 rounded-lg overflow-hidden">
            <button
              className={`flex-1 py-2 px-4 transition-colors ${
                selectedDay === 'weekday' ? 'bg-blue-500 text-white' : 'text-gray-700'
              }`}
              onClick={() => setSelectedDay('weekday')}
            >
              平日
            </button>
            <button
              className={`flex-1 py-2 px-4 transition-colors ${
                selectedDay === 'weekend' ? 'bg-blue-500 text-white' : 'text-gray-700'
              }`}
              onClick={() => setSelectedDay('weekend')}
            >
              土日祝
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-96 p-4">
          {data.map(hour => (
            <div key={hour.h} className="mb-6">
              <h3 className="font-bold text-lg mb-3">{hour.h}時</h3>
              <div className="grid grid-cols-6 gap-2">
                {hour.m.map(minute => (
                  <div 
                    key={minute}
                    className="bg-blue-50 text-center py-2 rounded font-mono text-sm"
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// コンポーネント：設定モーダル
const SettingsModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  updateInterval: number;
  setUpdateInterval: (interval: number) => void;
}> = ({ isOpen, onClose, updateInterval, setUpdateInterval }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">設定</h2>
          <button 
            onClick={onClose}
            className="text-2xl hover:bg-gray-700 w-8 h-8 rounded flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">更新間隔</label>
            <select 
              value={updateInterval}
              onChange={(e) => setUpdateInterval(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value={5000}>5秒</option>
              <option value={10000}>10秒</option>
              <option value={30000}>30秒</option>
              <option value={60000}>1分</option>
            </select>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// メインコンポーネント
const SendaiSubwayApp: React.FC = () => {
  const [showTimetable, setShowTimetable] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(10000);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const currentTime = useCurrentTime(updateInterval);
  const nextTrains = useNextTrains(sendaiRouteData, currentTime);
  
  const toggleFavorite = useCallback(() => {
    setIsFavorite(prev => !prev);
  }, []);

  const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* カスタムアニメーション用のCSS */}
      <style>
        {`
          @keyframes pulse-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes pulse-slow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          
          @keyframes pulse-very-slow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.9; }
          }
          
          .animate-pulse-fast {
            animation: pulse-fast 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .animate-pulse-very-slow {
            animation: pulse-very-slow 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          @keyframes urgency-glow {
            0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.5); }
            50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.6); }
          }
          
          .urgency-glow {
            animation: urgency-glow 1s ease-in-out infinite;
          }
        `}
      </style>
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* オフライン表示 */}
        <div className="bg-green-500 text-white text-center py-2 text-sm">
          🔄 オフライン対応 - 通信不要
        </div>
        
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold">仙台市地下鉄時刻表</h1>
            <div className="flex gap-2">
              <button 
                onClick={toggleFavorite}
                className="p-2 hover:bg-blue-700 rounded"
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-400' : ''}`} />
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-blue-700 rounded"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm opacity-90">
            <Clock className="w-4 h-4" />
            <span>
              {currentTime.toLocaleTimeString('ja-JP')} 
              ({isWeekend ? '土日祝' : '平日'})
            </span>
          </div>
        </div>
        
        {/* 路線情報 */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex items-center justify-center gap-4 text-lg font-bold">
            <span>{sendaiRouteData.from}</span>
            <div className="text-blue-500 text-2xl">→</div>
            <span>{sendaiRouteData.to}</span>
          </div>
          <div className="text-center text-sm text-gray-600 mt-1">
            {sendaiRouteData.line}
          </div>
        </div>
        
        {/* 次の電車表示 */}
        <div className="p-6 space-y-4">
          <NextTrainHighlight nextTrain={nextTrains[0]} />
          
          {nextTrains.length > 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Train className="w-5 h-5" />
                その後の電車
              </h2>
              <TrainList trains={nextTrains.slice(1)} />
            </div>
          )}
        </div>
        
        {/* 全時刻表ボタン */}
        <button 
          onClick={() => setShowTimetable(true)}
          className="w-full bg-blue-500 text-white py-4 font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          全時刻表を表示
        </button>
      </div>
      
      {/* モーダル */}
      <TimetableModal 
        isOpen={showTimetable}
        onClose={() => setShowTimetable(false)}
        route={sendaiRouteData}
        currentTime={currentTime}
      />
      
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        updateInterval={updateInterval}
        setUpdateInterval={setUpdateInterval}
      />
    </div>
  );
};

export default SendaiSubwayApp;
