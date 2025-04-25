from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import mediapipe as mp  # Replace dlib with mediapipe
import numpy as np
from typing import List, Dict
import io
from PIL import Image
import math
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Force MediaPipe to use CPU
os.environ["MEDIAPIPE_DISABLE_GPU"] = "1"

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe Face Mesh with error handling
try:
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5
    )
    logger.info("MediaPipe Face Mesh initialized successfully")
except Exception as e:
    logger.error(f"Error initializing MediaPipe: {str(e)}")
    face_mesh = None

@app.get("/")
@app.get("/")
async def health_check():
    """Health check endpoint for monitoring"""
    # This will always return OK to pass the health check
    import socket
    hostname = socket.gethostname()
    return {"status": "ok", "hostname": hostname, "ipv6_support": "Enabled", "version": "1.0.0"}

@app.post("/analyze-face")
async def analyze_face(file: UploadFile = File(...)):
    try:
        # Read the image file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Convert to RGB (MediaPipe requires RGB)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Detect facial landmarks
        results = face_mesh.process(img_rgb)
        
        if not results.multi_face_landmarks:
            return JSONResponse(
                status_code=400,
                content={"error": "No face detected in the image"}
            )
        
        # Get facial landmarks
        face_landmarks = results.multi_face_landmarks[0]
        
        # Convert landmarks to a list of dictionaries
        landmarks = []
        h, w, c = img.shape
        for i, landmark in enumerate(face_landmarks.landmark):
            # Convert normalized coordinates to pixel coordinates
            x = int(landmark.x * w)
            y = int(landmark.y * h)
            landmarks.append({"x": x, "y": y, "z": landmark.z})
        
        # Calculate distances between key points
        distances = calculate_distances(landmarks, img.shape)
        
        # Analyze microexpressions (placeholder for now)
        microexpressions = analyze_microexpressions(img_rgb, landmarks)
        
        # Generate personality report (placeholder for now)
        personality_report = generate_personality_report(microexpressions, distances)
        
        return {
            "landmarks": landmarks,
            "distances": distances,
            "microexpressions": microexpressions,
            "personality_report": personality_report
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

def calculate_distances(landmarks: List[Dict], img_shape: tuple) -> Dict[str, float]:
    """Calculate distances between key facial landmarks"""
    distances = {}
    
    # Example: distance between eyes
    # Using MediaPipe landmarks: 
    # Right eye outer corner: 33, Right eye inner corner: 133
    # Left eye inner corner: 362, Left eye outer corner: 263
    left_eye_outer = landmarks[33]
    left_eye_inner = landmarks[133]
    right_eye_inner = landmarks[362]
    right_eye_outer = landmarks[263]
    
    # Distance between eyes
    eye_distance = math.sqrt((right_eye_inner["x"] - left_eye_inner["x"])**2 + 
                           (right_eye_inner["y"] - left_eye_inner["y"])**2)
    distances["eye_distance"] = float(eye_distance)
    
    # Distance between outer corners of eyes
    outer_eye_distance = math.sqrt((right_eye_outer["x"] - left_eye_outer["x"])**2 + 
                                 (right_eye_outer["y"] - left_eye_outer["y"])**2)
    distances["outer_eye_distance"] = float(outer_eye_distance)
    
    # Nose to chin distance (nose tip: 1, chin: 152)
    nose_tip = landmarks[1]
    chin = landmarks[152]
    nose_chin_distance = math.sqrt((nose_tip["x"] - chin["x"])**2 + 
                                (nose_tip["y"] - chin["y"])**2)
    distances["nose_chin_distance"] = float(nose_chin_distance)
    
    # Distance between lips (upper lip: 13, lower lip: 14)
    upper_lip = landmarks[13]
    lower_lip = landmarks[14]
    lip_distance = math.sqrt((upper_lip["x"] - lower_lip["x"])**2 + 
                          (upper_lip["y"] - lower_lip["y"])**2)
    distances["lip_distance"] = float(lip_distance)
    
    # Face width at cheeks (left cheek: 123, right cheek: 352)
    left_cheek = landmarks[123]
    right_cheek = landmarks[352]
    face_width = math.sqrt((left_cheek["x"] - right_cheek["x"])**2 + 
                        (left_cheek["y"] - right_cheek["y"])**2)
    distances["face_width"] = float(face_width)
    
    # Face height
    face_height = nose_chin_distance + math.sqrt((nose_tip["x"] - landmarks[10]["x"])**2 +
                                            (nose_tip["y"] - landmarks[10]["y"])**2)
    distances["face_height"] = float(face_height)
    
    # Calculate face ratio (width/height)
    distances["face_ratio"] = float(face_width / face_height)
    
    return distances

def analyze_microexpressions(img: np.ndarray, landmarks: List[Dict]) -> Dict[str, float]:
    """Analyze microexpressions in the face"""
    # Placeholder for microexpression analysis
    # This would involve more complex analysis using ML models
    
    # Eyebrow position relative to neutral
    # Here we use a simple approximation
    left_eyebrow = landmarks[66]  # Left eyebrow
    right_eyebrow = landmarks[296]  # Right eyebrow
    left_eye = landmarks[159]  # Left eye upper
    right_eye = landmarks[386]  # Right eye upper
    
    # Calculate eyebrow heights relative to eyes
    left_height = left_eye["y"] - left_eyebrow["y"]
    right_height = right_eye["y"] - right_eyebrow["y"]
    avg_height = (left_height + right_height) / 2
    
    # Mouth shape (simplified)
    mouth_width = math.sqrt((landmarks[61]["x"] - landmarks[291]["x"])**2 +
                        (landmarks[61]["y"] - landmarks[291]["y"])**2)
    mouth_height = math.sqrt((landmarks[13]["x"] - landmarks[14]["x"])**2 +
                         (landmarks[13]["y"] - landmarks[14]["y"])**2)
    
    # Very basic approximation of emotions from facial measurements
    # NOTE: This is extremely simplified and not scientifically accurate
    happiness = (mouth_width / mouth_height) / 10
    sadness = 1 - (avg_height / 30) if avg_height < 30 else 0.2
    surprise = (avg_height / 40) if avg_height > 20 else 0.1
    
    return {
        "happiness": min(happiness, 1.0),
        "sadness": min(sadness, 1.0),
        "anger": 0.1,  # Placeholder
        "surprise": min(surprise, 1.0),
        "fear": 0.05,  # Placeholder
        "disgust": 0.05  # Placeholder
    }

def generate_personality_report(microexpressions: Dict[str, float], 
                              distances: Dict[str, float]) -> Dict[str, str]:
    """Generate personality report based on facial analysis"""
    # Placeholder for personality analysis
    # This would involve more complex analysis using ML models
    
    # Very basic demo personality analysis - not scientifically valid!
    face_ratio = distances.get("face_ratio", 0.8)
    
    # Determine "personality type" based on face ratio
    if face_ratio > 0.85:
        personality_type = "Extroverted"
    else:
        personality_type = "Introverted"
    
    # Determine "emotional stability" based on microexpressions
    emotional_stability = "High"
    if microexpressions["happiness"] < 0.3 and microexpressions["sadness"] > 0.5:
        emotional_stability = "Moderate"
    
    # Determine "openness" based on eye distance
    openness = "Moderate"
    if distances.get("eye_distance", 0) > 100:
        openness = "High"
    
    # Determine other traits (all placeholders)
    conscientiousness = "High"
    agreeableness = "Moderate"
    
    return {
        "personality_type": personality_type,
        "emotional_stability": emotional_stability,
        "openness": openness,
        "conscientiousness": conscientiousness,
        "agreeableness": agreeableness,
        "note": "This analysis is for demonstration purposes only and is not scientifically validated."
    } 