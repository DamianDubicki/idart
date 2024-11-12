"""
Application Name: IDArt
Course: INFO39014 Capstone Project
Date: November 25, 2024
Group: 19
Authors: Damian Dubicki, Dylan Law, Suresh Sharma, Volodymyr Suprun
"""

from flask import Flask, render_template, request, jsonify
import numpy as np
import joblib
from PIL import Image
from flask_cors import CORS
import tensorflow as tf

app = Flask(__name__)
CORS(app)

# Load the tflite model
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()

# Load the label encoder
label_encoder = joblib.load("label_encoder.pkl")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        file = request.files['file']
        
        # Check file type
        if file.content_type not in ['image/jpeg', 'image/png']:
            return jsonify({'error': 'Only JPEG and PNG files are allowed.'}), 400
        
        # Process the image and resize it
        processed_image = Image.open(file.stream).convert('RGB')
        processed_image = processed_image.resize((224, 224))

        # Convert the image to a numpy array and preprocess it
        image_array = np.expand_dims(np.array(processed_image), axis=0)
        image_array = image_array.astype(np.float32) / 127.5 - 1

        # Perform inference
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        interpreter.set_tensor(input_details[0]['index'], image_array)
        interpreter.invoke()

        # Get the prediction result
        predictions = interpreter.get_tensor(output_details[0]['index'])
        predicted_class_index = np.argmax(predictions)
        confidence_score = predictions[0][predicted_class_index] * 100  # Multiply by 100 for percentage format

        # Decode the predicted label
        predicted_combined = label_encoder.inverse_transform([predicted_class_index])[0]
        predicted_artwork, predicted_artist, predicted_date, predicted_style = predicted_combined.split("|")

        return jsonify({
            'artwork': predicted_artwork,
            'artist': predicted_artist,
            'date': predicted_date,
            'style': predicted_style,
            'confidence': f"{confidence_score:.0f}%"  # Return confidence score as a percentage
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run()
