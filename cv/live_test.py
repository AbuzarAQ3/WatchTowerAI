
import cv2
import subprocess
from ultralytics import YOLO

# YouTube Live URL
youtube_url = "https://www.youtube.com/live/uEkJjuAjWa0"

# Load existing YOLO model
model = YOLO("yolov8n.pt")

# Target classes
TARGET_CLASSES = [0, 2, 3, 5, 7]

# Get actual stream URL using yt-dlp
stream_url = subprocess.check_output(
    ["python", "-m", "yt_dlp", "-g", youtube_url],
    text=True
).strip().splitlines()[0]

# Open live stream
cap = cv2.VideoCapture(stream_url)

if not cap.isOpened():
    print("Live stream is not opened!")
    exit()

print("Live stream connected!")
print("YOLO Detection + Tracking started!")

while True:
    ret, frame = cap.read()

    if not ret:
        print("Frame is not received")
        break

    # YOLO Detection + ByteTrack Tracking
    results = model.track(
        frame,
        persist=True,
        tracker="bytetrack.yaml",
        classes=TARGET_CLASSES,
        conf=0.25,
        imgsz=960,
        iou=0.5,
        verbose=False,
    )
    if results[0].boxes.id is not None:
     print("Tracking IDs:", results[0].boxes.id.int().tolist())
    else:
     print("No tracking IDs")
    annotated_frame = results[0].plot()
    cv2.imshow(
        "WatchTowerAI - Live Detection & Tracking",
        annotated_frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
