import cv2
from flask import Flask, Response
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)  # Allows your React server to read the stream without CORS blocks

model = YOLO("yolov8n.pt")
TARGET_CLASSES = {0: "Person", 2: "Car", 3: "Motorcycle", 5: "Bus", 7: "Truck"}


def generate_frames():
    cap = cv2.VideoCapture("videos/sample.mp4")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            # Loop the video continuously for the demo if it ends
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        results = model(frame, verbose=False)

        for result in results:
            boxes = result.boxes
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                if class_id in TARGET_CLASSES and confidence > 0.40:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cx, cy = int((x1 + x2) / 2), int(y2)

                    # Mutate frame with OpenCV drawings exactly as before
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
                    cv2.putText(
                        frame,
                        f"{TARGET_CLASSES[class_id]} {confidence:.2f}",
                        (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        (0, 255, 0),
                        2,
                    )

        # Encode the frame as a JPEG image in memory
        ret, buffer = cv2.imencode(".jpg", frame)
        if not ret:
            continue
        frame_bytes = buffer.tobytes()

        # Concatenate frame bytes in MJPEG multipart stream format
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
        )

    cap.release()


@app.route("/video_feed")
def video_feed():
    # Returns the streaming response to the browser
    return Response(
        generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame"
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
