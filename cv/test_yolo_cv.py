import cv2
from ultralytics import YOLO

model = YOLO("yolov8n.pt") 

cap = cv2.VideoCapture("videos/sample.mp4")

TARGET_CLASSES = {0: "Person", 2: "Car", 3: "Motorcycle", 5: "Bus", 7: "Truck"}

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame, verbose=False)

    for result in results:
        boxes = result.boxes
        for box in boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            if class_id in TARGET_CLASSES and confidence > 0.40:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                
                cx = int((x1 + x2) / 2)
                cy = int(y2)

                print(f"[{TARGET_CLASSES[class_id]}] Conf: {confidence:.2f} | BBox: ({x1},{y1})->({x2},{y2}) | Feet: ({cx},{cy})")

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
                cv2.putText(frame, f"{TARGET_CLASSES[class_id]} {confidence:.2f}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    cv2.imshow("WatchTowerAI - CV Test Sandbox", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
