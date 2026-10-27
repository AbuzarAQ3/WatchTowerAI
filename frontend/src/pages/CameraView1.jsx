import React from 'react';

export default function CameraView1() {
  return (
    <div className="bg-slate-900 p-6 rounded-lg shadow-xl max-w-4xl mx-auto text-white">
      <h2 className="text-xl font-bold mb-4">📷 Live WatchTowerAI Processing Feed</h2>
      
      <div className="relative border-4 border-emerald-500 rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
        {/* Directly bind the Python stream URL to the src of an img element */}
        <img 
          src="http://localhost:8081/video_feed" 
          alt="WatchTower Live Stream Feed" 
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "https://placehold.co";
          }}
        />
      </div>
      
      <div className="mt-4 text-sm text-slate-400">
        <p>• Resolution: Auto-scaled • Architecture: YOLOv8n Engine • Protocol: HTTP-MJPEG</p>
      </div>
    </div>
  );
}
